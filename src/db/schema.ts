import {
    pgTable,
    serial,
    varchar,
    uniqueIndex,
    boolean,
    text,
    timestamp,
    integer,
    foreignKey
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }),
        email: varchar("email", { length: 255 }),
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
        strategy: varchar("strategy", { length: 255 }),
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