import { pgTable, serial, varchar, uniqueIndex } from "drizzle-orm/pg-core";

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
