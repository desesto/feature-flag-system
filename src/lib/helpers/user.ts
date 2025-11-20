import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/schema";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export async function getUserRole(userId: number): Promise<string> {
    const [user] = await db
        .select({ role: usersTable.role })
        .from(usersTable)
        .where(eq(usersTable.id, userId));

    return user.role;
}

