import {describe, it, expect, beforeAll, afterAll, beforeEach, vi} from "vitest";
import {featureFlagsTable} from "@/db/schema";
import {NextRequest} from "next/server";
import {Pool} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import dotenv from "dotenv";

dotenv.config({path: ".env.test"});

const testPool = new Pool({connectionString: process.env.TEST_DATABASE_URL});
const testDb = drizzle(testPool, {schema});

vi.mock("@/db", () => ({
    db: testDb,
}));

let POST: any;

beforeAll(async () => {
    ({ POST } = await import("@/app/api/featureFlags/[id]/route"));

    try {
        await testDb.execute(`DROP TABLE IF EXISTS feature_flags CASCADE`);
    } catch (e) {
    }

    await testDb.execute(`
        CREATE TABLE feature_flags
        (
            id          SERIAL PRIMARY KEY,
            user_id     INT          NOT NULL,
            name        VARCHAR(255) NOT NULL UNIQUE,
            is_active   BOOLEAN      NOT NULL,
            description TEXT,
            strategy    VARCHAR(255) NOT NULL,
            start_time  TIMESTAMP    NOT NULL,
            end_time    TIMESTAMP,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at  TIMESTAMP
        )
    `);
});

beforeEach(async () => {
    await testDb.delete(featureFlagsTable).execute();
});

afterAll(async () => {
    await testDb.delete(featureFlagsTable).execute();
    await testPool.end();
});

describe("feature flag API", () => {
    it("returns enabled: true for existing flag", async () => {

        await testDb
            .insert(featureFlagsTable)
            .values({
                user_id: 1,
                name: "TestFlag",
                is_active: true,
                description: "Test flag",
                strategy: "NO_STRATEGY",
                start_time: new Date(),
                end_time: null,
            })
            .execute();

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: {"x-api-key": process.env.FEATURE_FLAG_API_KEY!},
        });

        const res = await POST(req, {params: {id: "TestFlag"}});
        const json = await res.json();

        expect(json.enabled).toBe(true);
    });

    it("returns enabled: false for non-existing flag", async () => {
        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: {"x-api-key": process.env.FEATURE_FLAG_API_KEY!},
        });

        const res = await POST(req, {params: {id: "DoesNotExist"}});
        const json = await res.json();

        expect(json.enabled).toBe(false);
    });

    it("returns 401 if API key is invalid", async () => {
        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: {"x-api-key": "wrong-key"},
        });

        const res = await POST(req, {params: {id: "TestFlag"}});
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe("Unauthorized");
    });
});