import {
    pgTable,
    serial,
    varchar,
    uniqueIndex,
    boolean,
    text,
    timestamp,
    integer,
    foreignKey,
    pgEnum, jsonb,
} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

export const roleEnum = pgEnum("role", ["Product-Manager", "Developer"]);
export const strategyEnum = pgEnum("strategy", ["NO_STRATEGY", "FUTURE_IMPLEMENTATIONS"]);
export const ActionTypeEnum = pgEnum("action_type", ["CREATED", "UPDATED", "DELETED", "ACTIVATED", "DEACTIVATED"]);

export const usersTable = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }),
        email: varchar("email", { length: 255 }),
        role: roleEnum("role").notNull().default("Developer"),
    },
    (table) => ({
        email_unique: uniqueIndex("email_unique_idx").on(table.email),
    })
);

export const featureFlagsTable = pgTable(
    "feature_flags",
    {
        id: serial("id").primaryKey(),
        user_id: integer("user_id").notNull(),
        name: varchar("name", { length: 255 }),
        is_active: boolean("is_active").notNull(),
        description: text("description"),
        strategy: strategyEnum("strategy").notNull().default("NO_STRATEGY"),
        start_time: timestamp("start_time"),
        end_time: timestamp("end_time"),
        created_at: timestamp("created_at").defaultNow(),
        updated_at: timestamp("updated_at").defaultNow(),
        deleted_at: timestamp("deleted_at"),
    },
    (table) => ({
        name_unique: uniqueIndex("feature_flag_name_unique").on(table.name),
        user_fk: foreignKey({
            columns: [table.user_id],
            foreignColumns: [usersTable.id],
        }),
    })
);

export const featureFlagHistoryTable = pgTable(
    "feature_flag_history",
    {
        id: serial("id").primaryKey(),
        feature_flag_id: integer("feature_flag_id").notNull(),
        user_id: integer("user_id").notNull(),
        timestamp: timestamp("timestamp").defaultNow(),
        action_type: ActionTypeEnum("action_type",).notNull(),
    },
    (table) => ({
    feature_flag_fk: foreignKey({
        columns: [table.feature_flag_id],
        foreignColumns: [featureFlagsTable.id],
    }),
    user_fk: foreignKey({
        columns: [table.user_id],
        foreignColumns: [usersTable.id],
    })
    }))

export const usersRelations = relations(usersTable, ({ many }) => ({
    featureFlags: many(featureFlagsTable),
    featureFlagHistories: many(featureFlagHistoryTable),
}));

export const featureFlagsRelations = relations(featureFlagsTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [featureFlagsTable.user_id],
        references: [usersTable.id],
    }),
    featureFlagHistories: many(featureFlagHistoryTable),
}));

export const featureFlagHistoryRelations = relations(featureFlagHistoryTable, ({ one }) => ({
    featureFlag: one(featureFlagsTable, {
        fields: [featureFlagHistoryTable.feature_flag_id],
        references: [featureFlagsTable.id],
    }),
    user: one(usersTable, {
        fields: [featureFlagHistoryTable.user_id],
        references: [usersTable.id],
    }),
}))

export const auditLogsTable = pgTable("audit_logs", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    user_email: varchar("user_email", { length: 255 }),
    action: varchar("action", { length: 255 }).notNull(),
    entity: varchar("entity", { length: 255 }).notNull(),
    entity_id: integer("entity_id").notNull(),
    entity_name: varchar("entity_name", { length: 255 }),
    old_value: jsonb("old_value"),
    new_value: jsonb("new_value"),
    created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
    user_fk: foreignKey({
        columns: [table.user_id],
        foreignColumns: [usersTable.id],
    }),
}));

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [auditLogsTable.user_id],
        references: [usersTable.id],
    }),
}));