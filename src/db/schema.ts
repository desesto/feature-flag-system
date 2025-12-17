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
        userId: integer("user_id").notNull(),
        name: varchar("name", { length: 255 }),
        isActive: boolean("is_active").notNull(),
        description: text("description"),
        strategy: strategyEnum("strategy").notNull().default("NO_STRATEGY"),
        whiteListId: integer("white_list_id"),
        startTime: timestamp("start_time", { mode: "date" }),
        endTime: timestamp("end_time", { mode: "date" }),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
        deletedAt: timestamp("deleted_at", { mode: "date" }),
        path: jsonb("path").$type<string[] | null>().default(null),
    },
    (table) => ({
        name_unique: uniqueIndex("feature_flag_name_unique").on(table.name),
        user_fk: foreignKey({
            columns: [table.userId],
            foreignColumns: [usersTable.id],
        }),
    })
);

export const whiteListsTable = pgTable(
    "white_lists",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
    },
    (table) => ({
        name_unique: uniqueIndex("whitelist_name_unique").on(table.name),
    })
);

export const whiteListUsersTable = pgTable(
    "white_list_users",
    {
        id: serial("id").primaryKey(),
        whiteListId: integer("white_list_id").notNull(),
        userId: integer("user_id").notNull(),
    },
    (table) => ({
        whitelist_fk: foreignKey({
            columns: [table.whiteListId],
            foreignColumns: [whiteListsTable.id],
        }).onDelete("cascade"),
        user_fk: foreignKey({
            columns: [table.userId],
            foreignColumns: [usersTable.id],
        }).onDelete("cascade"),
        unique_whitelist_user: uniqueIndex("unique_whitelist_user_idx").on(
            table.whiteListId,
            table.userId
        ),
    })
);

export const featureFlagHistoryTable = pgTable(
    "feature_flag_history",
    {
        id: serial("id").primaryKey(),
        featureFlagId: integer("feature_flag_id").notNull(),
        userId: integer("user_id").notNull(),
        timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),
        actionType: ActionTypeEnum("action_type",).notNull(),
        changedFields: text("changed_fields"),
        oldValues: text("old_values"),
        newValues: text("new_values"),
    },
    (table) => ({
    feature_flag_fk: foreignKey({
        columns: [table.featureFlagId],
        foreignColumns: [featureFlagsTable.id],
    }),
    user_fk: foreignKey({
        columns: [table.userId],
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
        fields: [featureFlagsTable.userId],
        references: [usersTable.id],
    }),
    featureFlagHistories: many(featureFlagHistoryTable),
    whiteList: one(whiteListsTable, {
        fields: [featureFlagsTable.whiteListId],
        references: [whiteListsTable.id],
    }),
}));
export const whiteListsRelations = relations(whiteListsTable, ({ many }) => ({
    featureFlags: many(featureFlagsTable),
    whiteListUsers: many(whiteListUsersTable),
}));

export const whiteListUsersRelations = relations(whiteListUsersTable, ({ one }) => ({
    whiteList: one(whiteListsTable, {
        fields: [whiteListUsersTable.whiteListId],
        references: [whiteListsTable.id],
    }),
    user: one(usersTable, {
        fields: [whiteListUsersTable.userId],
        references: [usersTable.id],
    }),
}));

export const featureFlagHistoryRelations = relations(featureFlagHistoryTable, ({ one }) => ({
    featureFlag: one(featureFlagsTable, {
        fields: [featureFlagHistoryTable.featureFlagId],
        references: [featureFlagsTable.id],
    }),
    user: one(usersTable, {
        fields: [featureFlagHistoryTable.userId],
        references: [usersTable.id],
    }),
}))