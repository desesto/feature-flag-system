/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { featureFlagsTable } from "@/db/schema";
import { NextRequest } from "next/server";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const testPool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
const testDb = drizzle(testPool, { schema });

vi.mock("@/db", () => ({
    db: testDb,
}));

vi.mock("@/lib/helpers/user", () => ({
    getUserRole: vi.fn().mockResolvedValue("Developer"),
}));

vi.mock("@/lib/helpers/featureFlagHistory", () => ({
    logFeatureFlagCreated: vi.fn(),
    logFeatureFlagUpdated: vi.fn(),
    logFeatureFlagDeleted: vi.fn(),
}));

let POST_GetFlagById: any;
let DELETE_Flag: any;
let POST_CreateFlag: any;
let PATCH_UpdateFlag: any;

beforeAll(async () => {
    const flagByIdRoute = await import("@/app/api/featureFlags/[id]/route");
    POST_GetFlagById = flagByIdRoute.POST;
    DELETE_Flag = flagByIdRoute.DELETE;

    try {
        const flagsRoute = await import("@/app/api/featureFlags/route");
        POST_CreateFlag = flagsRoute.POST;
        PATCH_UpdateFlag = flagsRoute.PATCH;
    } catch (e) {
        console.error("Failed to import from featureFlags route:", e);
        throw e;
    }

    try {
        await testDb.execute(`DROP TABLE IF EXISTS feature_flags CASCADE`);
    } catch (e) {
    }

    await testDb.execute(`
        CREATE TABLE feature_flags (
                                       id SERIAL PRIMARY KEY,
                                       user_id INT NOT NULL,
                                       name VARCHAR(255) NOT NULL UNIQUE,
                                       is_active BOOLEAN NOT NULL,
                                       description TEXT,
                                       strategy VARCHAR(255) NOT NULL,
                                       start_time TIMESTAMP NOT NULL,
                                       end_time TIMESTAMP,
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                       deleted_at TIMESTAMP
        )
    `);
});

beforeEach(async () => {
    const { getUserRole } = await vi.importMock("@/lib/helpers/user");
    vi.mocked(getUserRole).mockResolvedValue("Developer");

    await testDb.delete(featureFlagsTable).execute();
});

afterAll(async () => {
    await testDb.delete(featureFlagsTable).execute();
    await testPool.end();
});

describe("POST /api/featureFlags/[id] - Check if flag is enabled", () => {
    it("returns enabled: true for existing active flag", async () => {
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
            headers: { "x-api-key": process.env.FEATURE_FLAG_API_KEY! },
        });

        const res = await POST_GetFlagById(req, { params: { id: "TestFlag" } });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.enabled).toBe(true);
    });

    it("returns enabled: false for non-existing flag", async () => {
        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { "x-api-key": process.env.FEATURE_FLAG_API_KEY! },
        });

        const res = await POST_GetFlagById(req, { params: { id: "DoesNotExist" } });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.enabled).toBe(false);
    });

    it("returns 401 if API key is invalid", async () => {
        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { "x-api-key": "wrong-key" },
        });

        const res = await POST_GetFlagById(req, { params: { id: "TestFlag" } });
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe("Unauthorized");
    });
});

describe("POST /api/featureFlags - Create feature flag", () => {
    it("creates a feature flag and verifies it is in the database", async () => {
        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                user_id: 1,
                name: "NewFlag",
                is_active: true,
                description: "New test flag",
                strategy: "NO_STRATEGY",
                start_time: new Date().toISOString(),
                end_time: null,
            }),
        });

        const res = await POST_CreateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.name).toBe("NewFlag");
        expect(json.is_active).toBe(true);

        const flagInDb = await testDb
            .select()
            .from(featureFlagsTable)
            .where(eq(featureFlagsTable.name, "NewFlag"));

        expect(flagInDb).toHaveLength(1);
        expect(flagInDb[0].name).toBe("NewFlag");
        expect(flagInDb[0].is_active).toBe(true);
    });

    it("returns 401 if user is not a Developer", async () => {
        const { getUserRole } = await vi.importMock("@/lib/helpers/user");
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager");

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                user_id: 2,
                name: "UnauthorizedFlag",
                is_active: true,
                description: "Should fail",
                strategy: "NO_STRATEGY",
                start_time: new Date().toISOString(),
                end_time: null,
            }),
        });

        const res = await POST_CreateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toContain("Unauthorized");

        const flagInDb = await testDb
            .select()
            .from(featureFlagsTable)
            .where(eq(featureFlagsTable.name, "UnauthorizedFlag"));

        expect(flagInDb).toHaveLength(0);
    });
});

describe("PATCH /api/featureFlags - Update feature flag", () => {
    it("updates a feature flag and verifies changes in database", async () => {
        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                user_id: 1,
                name: "UpdateTestFlag",
                is_active: true,
                description: "Original description",
                strategy: "NO_STRATEGY",
                start_time: new Date(),
                end_time: null,
            })
            .returning();

        const flagId = created[0].id;

        const req = new NextRequest("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({
                id: flagId,
                user_id: 1,
                description: "Updated description",
                is_active: false,
            }),
        });

        const res = await PATCH_UpdateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.description).toBe("Updated description");
        expect(json.is_active).toBe(false);

        const flagInDb = await testDb
            .select()
            .from(featureFlagsTable)
            .where(eq(featureFlagsTable.id, flagId));

        expect(flagInDb).toHaveLength(1);
        expect(flagInDb[0].description).toBe("Updated description");
        expect(flagInDb[0].is_active).toBe(false);
    });

    it("returns 403 if non-Developer tries to update (not just toggle)", async () => {
        const { getUserRole } = await vi.importMock("@/lib/helpers/user");
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager");

        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                user_id: 1,
                name: "ProtectedFlag",
                is_active: true,
                description: "Original",
                strategy: "NO_STRATEGY",
                start_time: new Date(),
                end_time: null,
            })
            .returning();

        const flagId = created[0].id;

        const req = new NextRequest("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({
                id: flagId,
                user_id: 2,
                description: "Trying to update",
            }),
        });

        const res = await PATCH_UpdateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(403);
        expect(json.error).toContain("Unauthorized");
    });

    it("allows Product-Manager to toggle is_active only", async () => {
        const { getUserRole } = await vi.importMock("@/lib/helpers/user");
        vi.mocked(getUserRole).mockClear()
        const user = await getUserRole(2);
        vi.mocked(getUserRole).mockResolvedValueOnce(user);

        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                user_id: 1,
                name: "ToggleFlag",
                is_active: true,
                description: "Can be toggled",
                strategy: "NO_STRATEGY",
                start_time: new Date(),
                end_time: null,
            })
            .returning();

        const flagId = created[0].id;

        const req = new NextRequest("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({
                id: flagId,
                user_id: 2,
                is_active: false,
            }),
        });

        const res = await PATCH_UpdateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.is_active).toBe(false);
    });
});

describe("DELETE /api/featureFlags/[id] - Delete feature flag", () => {
    it("soft deletes a flag and verifies deleted_at is set", async () => {
        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                user_id: 1,
                name: "DeleteTestFlag",
                is_active: true,
                description: "To be deleted",
                strategy: "NO_STRATEGY",
                start_time: new Date(),
                end_time: null,
            })
            .returning();

        const flagId = created[0].id;

        const req = new NextRequest("http://localhost", {
            method: "DELETE",
            body: JSON.stringify({
                id: flagId,
                userId: 1,
            }),
        });

        const res = await DELETE_Flag(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.deleted_at).not.toBeNull();

        const flagInDb = await testDb
            .select()
            .from(featureFlagsTable)
            .where(eq(featureFlagsTable.id, flagId));

        expect(flagInDb).toHaveLength(1);
        expect(flagInDb[0].deleted_at).not.toBeNull();
    });

    it("returns 401 if non-Developer tries to delete", async () => {
        const { getUserRole } = await vi.importMock("@/lib/helpers/user");
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager");

        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                user_id: 1,
                name: "ProtectedDeleteFlag",
                is_active: true,
                description: "Cannot delete",
                strategy: "NO_STRATEGY",
                start_time: new Date(),
                end_time: null,
            })
            .returning();

        const flagId = created[0].id;

        const req = new NextRequest("http://localhost", {
            method: "DELETE",
            body: JSON.stringify({
                id: flagId,
                userId: 2,
            }),
        });

        const res = await DELETE_Flag(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toContain("Unauthorized");

        const flagInDb = await testDb
            .select()
            .from(featureFlagsTable)
            .where(eq(featureFlagsTable.id, flagId));

        expect(flagInDb[0].deleted_at).toBeNull();
    });
});