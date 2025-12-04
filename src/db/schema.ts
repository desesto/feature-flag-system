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
    pgEnum,
} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

export const roleEnum = pgEnum("role", ["Product-Manager", "Developer" , "Non-Technical-User"]);
export const strategyEnum = pgEnum("strategy", ["NO_STRATEGY", "CANARY", "FUTURE_IMPLEMENTATIONS"]);
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
        whitelist_id: integer("whitelist_id"),
        start_time: timestamp("start_time", { mode: "date" }),
        end_time: timestamp("end_time", { mode: "date" }),
        created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
        updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
        deleted_at: timestamp("deleted_at", { mode: "date" }),
    },
    (table) => ({
        name_unique: uniqueIndex("feature_flag_name_unique").on(table.name),
        user_fk: foreignKey({
            columns: [table.user_id],
            foreignColumns: [usersTable.id],
        }),
    })
);

export const whiteListsTable = pgTable(
    "whitelists",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
    },
    (table) => ({
        name_unique: uniqueIndex("whitelist_name_unique").on(table.name),
    })
);

export const whiteListUsersTable = pgTable(
    "whitelist_users",
    {
        id: serial("id").primaryKey(),
        whitelist_id: integer("whitelist_id").notNull(),
        user_id: integer("user_id").notNull(),
    },
    (table) => ({
        whitelist_fk: foreignKey({
            columns: [table.whitelist_id],
            foreignColumns: [whiteListsTable.id],
        }).onDelete("cascade"),
        user_fk: foreignKey({
            columns: [table.user_id],
            foreignColumns: [usersTable.id],
        }).onDelete("cascade"),
        // Unique så samme user ikke kan tilføjes flere gange til samme whitelist
        unique_whitelist_user: uniqueIndex("unique_whitelist_user_idx").on(
            table.whitelist_id,
            table.user_id
        ),
    })
);

export const featureFlagHistoryTable = pgTable(
    "feature_flag_history",
    {
        id: serial("id").primaryKey(),
        feature_flag_id: integer("feature_flag_id").notNull(),
        user_id: integer("user_id").notNull(),
        timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),
        action_type: ActionTypeEnum("action_type",).notNull(),
        changed_fields: text("changed_fields"),
        old_values: text("old_values"),
        new_values: text("new_values"),
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
    whiteListMemberships: many(whiteListUsersTable),
}));

export const featureFlagsRelations = relations(featureFlagsTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [featureFlagsTable.user_id],
        references: [usersTable.id],
    }),
    featureFlagHistories: many(featureFlagHistoryTable),
    whitelist: one(whiteListsTable, {
        fields: [featureFlagsTable.whitelist_id],
        references: [whiteListsTable.id],
    }),
}));
export const whiteListsRelations = relations(whiteListsTable, ({ many }) => ({
    featureFlags: many(featureFlagsTable), //
    whitelistUsers: many(whiteListUsersTable),
}));

export const whiteListUsersRelations = relations(whiteListUsersTable, ({ one }) => ({
    whitelist: one(whiteListsTable, {
        fields: [whiteListUsersTable.whitelist_id],
        references: [whiteListsTable.id],
    }),
    user: one(usersTable, {
        fields: [whiteListUsersTable.user_id],
        references: [usersTable.id],
    }),
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