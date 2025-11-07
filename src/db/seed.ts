import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";  // ← Tilføj denne import
import { featureFlagsTable, usersTable } from "./schema";
import * as schema from "./schema";

// Opret pool connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
    console.log("🌱 Seeding database...");

    try {
        console.log("Clearing existing data...");
        await db.delete(featureFlagsTable);
        await db.delete(usersTable);


        await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE feature_flags_id_seq RESTART WITH 1');

        console.log("Creating users...");
        const [user1, user2, user3] = await db
            .insert(usersTable)
            .values([
                {
                    name: "Clemen Dalgaard",
                    email: "clemen@jppol.dk",
                    role: "Developer",
                },
                {
                    name: "Jens Ulriksen",
                    email: "ju@jppol.dk",
                    role: "Developer",
                },
                {
                    name: "Bobby",
                    email: "bob@jppol.dk",
                    role: "Product-Manager",
                },
            ])
            .returning();

        console.log("Users created:", user1?.id, user2?.id, user3?.id);

        console.log("Creating feature flags...");
        await db
            .insert(featureFlagsTable)
            .values([
                {
                    user_id: user1.id,
                    name: "Gratis frokost i kantinen",
                    is_active: false,
                    description: "Frokostpris == 35 kr. -> 0 kr.",
                    strategy: "FUTURE_IMPLEMENTATIONS",
                    start_time: new Date("2025-12-01T13:34:00"),
                    end_time: new Date("2025-12-02T13:34:00"),
                },
                {
                    user_id: user1.id,
                    name: "Ansættelsesstop",
                    is_active: true,
                    description: "Vi hyrer pt ikke",
                    strategy: "NO_STRATEGY",
                    start_time: new Date("2025-11-01T10:00:00"),
                    end_time: new Date("2025-12-31T23:59:00"),
                },
                {
                    user_id: user1.id,
                    name: "Fjern system bugs",
                    is_active: false,
                    description: "Fjerner alle kendte bugs fra systemet",
                    strategy: "NO_STRATEGY",
                    start_time: new Date("2025-11-09T11:39:00"),
                    end_time: new Date("2025-11-10T11:39:00"),
                },
                {
                    user_id: user1.id,
                    name: "Tilkald Bedstemor",
                    is_active: false,
                    description: "DDSASDADSA",
                    strategy: "NO_STRATEGY",
                    start_time: new Date("2025-11-20T13:13:00"),
                    end_time: new Date("2025-11-29T13:13:00"),
                },
                {
                    user_id: user1.id,
                    name: "Sluk for alt strøm i bygningen",
                    is_active: true,
                    description: "Fjerner strømtilførselen for alle stikkontakter",
                    strategy: "FUTURE_IMPLEMENTATIONS",
                    start_time: new Date("2025-10-28T13:31:00"),
                    end_time: new Date("2025-12-04T13:31:00"),
                },
                {
                    user_id: user1.id,
                    name: "Lås alle døre ind til toiletter",
                    is_active: false,
                    description: "JP kører med ofte med kampagner hvor der er fokus på at komme af med sine efterladenskaber i naturen",
                    strategy: "NO_STRATEGY",
                    start_time: new Date("2025-11-09T08:11:00"),
                    end_time: new Date("2025-11-10T08:11:00"),
                },
            ]);

        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    } finally {
        await pool.end();
        process.exit(0);
    }
}

seed();