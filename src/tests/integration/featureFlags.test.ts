/**
 * @vitest-environment node
 */
import {describe, it, expect, beforeAll, afterAll, beforeEach, vi} from "vitest";
import {featureFlagsTable} from "@/db/schema";
import {NextRequest} from "next/server";
import {Pool} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import {eq} from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({path: ".env.test"});

const testPool = new Pool({connectionString: process.env.TEST_DATABASE_URL});
const testDb = drizzle(testPool, {schema});

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
    const flagByIdRoute = await import("@/app/api/feature-flags/[id]/route");
    const flagsRoute = await import("@/app/api/feature-flags/route");
    const fetchFlag = await import("@/app/api/public/feature-flags/route");

    POST_GetFlagById = fetchFlag.POST;
    DELETE_Flag = flagByIdRoute.DELETE;

    POST_CreateFlag = flagsRoute.POST;
    PATCH_UpdateFlag = flagByIdRoute.PATCH;

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
            white_list_id INT,
            start_time  TIMESTAMP    NOT NULL,
            end_time    TIMESTAMP,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at  TIMESTAMP,
            path JSONB DEFAULT NULL
        )
    `);
});

beforeEach(async () => {
    const {getUserRole} = await import("@/lib/helpers/user");
    vi.mocked(getUserRole).mockResolvedValue("Developer");

    await testDb.delete(featureFlagsTable).execute();
});

afterAll(async () => {
    await testDb.delete(featureFlagsTable).execute();
    await testPool.end();
});

describe("POST /api/public/feature-flags/ - Check if flag is enabled", () => {
    it("returns enabled: true for existing active flag", async () => {
        await testDb
            .insert(featureFlagsTable)
            .values({
                userId: 1,
                name: "TestFlag",
                isActive: true,
                description: "Test flag",
                strategy: "NO_STRATEGY",
                whiteListId: null,
                startTime: new Date(),
                endTime: null,
                path: null,
            })
            .execute();

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: {
                "x-api-key": process.env.FEATURE_FLAG_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                featureFlagName: "TestFlag",
                userEmail: null,
            }),
        });


        const res = await POST_GetFlagById(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.enabled).toBe(true);
    });

    it("returns enabled: false for non-existing flag", async () => {
        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: {"x-api-key": process.env.FEATURE_FLAG_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                featureFlagName: "DoesNotExist",
                userEmail: null,
            }),
        });

        const res = await POST_GetFlagById(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.enabled).toBe(false);
    });

    it("returns 401 if API key is invalid", async () => {
        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: {"x-api-key": "wrong-key"},
        });

        const res = await POST_GetFlagById(req, {params: {id: "TestFlag"}});
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
                userId: 1,
                name: "NewFlag",
                isActive: true,
                description: "New test flag",
                strategy: "NO_STRATEGY",
                whiteListId: null,
                startTime: new Date().toISOString(),
                endTime: null,
                path: null,
            }),
        });

        const res = await POST_CreateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.name).toBe("NewFlag");
        expect(json.isActive).toBe(true);

        const flagInDb = await testDb
            .select()
            .from(featureFlagsTable)
            .where(eq(featureFlagsTable.name, "NewFlag"));

        expect(flagInDb).toHaveLength(1);
        expect(flagInDb[0].name).toBe("NewFlag");
        expect(flagInDb[0].isActive).toBe(true);
    });

    it("returns 401 if user is not a Developer", async () => {
        const {getUserRole} = await import("@/lib/helpers/user");
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager");

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                userId: 2,
                name: "UnauthorizedFlag",
                isActive: true,
                description: "Should fail",
                whiteListId: null,
                strategy: "NO_STRATEGY",
                startTime: new Date().toISOString(),
                endTime: null,
                path: null,
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
                userId: 1,
                name: "UpdateTestFlag",
                isActive: true,
                description: "Original description",
                strategy: "NO_STRATEGY",
                whiteListId: null,
                startTime: new Date(),
                endTime: null,
                path: null
            })
            .returning();

        const flagId = created[0].id;

        const req = new NextRequest("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({
                id: flagId,
                userId: 1,
                description: "Updated description",
                isActive: false,
            }),
        });

        const res = await PATCH_UpdateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.description).toBe("Updated description");
        expect(json.isActive).toBe(false);

        const flagInDb = await testDb
            .select()
            .from(featureFlagsTable)
            .where(eq(featureFlagsTable.id, flagId));

        expect(flagInDb).toHaveLength(1);
        expect(flagInDb[0].description).toBe("Updated description");
        expect(flagInDb[0].isActive).toBe(false);
    });

    it("returns 403 if non-Developer tries to update (not just toggle)", async () => {
        const {getUserRole} = await import("@/lib/helpers/user");
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager");

        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                userId: 1,
                name: "ProtectedFlag",
                isActive: true,
                description: "Original",
                strategy: "NO_STRATEGY",
                startTime: new Date(),
                endTime: null,
            })
            .returning();

        const flagId = created[0].id;

        const req = new NextRequest("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({
                id: flagId,
                userId: 2,
                description: "Trying to update",
            }),
        });

        const res = await PATCH_UpdateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(403);
        expect(json.error).toContain("Du har ikke adgang til at redigere feature flags");
    });

    it("allows Product-Manager to toggle isActive only", async () => {
        const {getUserRole} = await import("@/lib/helpers/user");
        vi.mocked(getUserRole).mockClear()
        const user = await getUserRole(2);
        vi.mocked(getUserRole).mockResolvedValueOnce(user);

        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                userId: 1,
                name: "ToggleFlag",
                isActive: true,
                description: "Can be toggled",
                strategy: "NO_STRATEGY",
                startTime: new Date(),
                endTime: null,
            })
            .returning();

        const flagId = created[0].id;

        const req = new NextRequest("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({
                id: flagId,
                userId: 2,
                isActive: false,
            }),
        });

        const res = await PATCH_UpdateFlag(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.isActive).toBe(false);
    });
});

describe("DELETE /api/featureFlags/[id] - Delete feature flag", () => {
    it("soft deletes a flag and verifies deletedAt is set", async () => {
        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                userId: 1,
                name: "DeleteTestFlag",
                isActive: true,
                description: "To be deleted",
                strategy: "NO_STRATEGY",
                startTime: new Date(),
                endTime: null,
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
        expect(json.deletedAt).not.toBeNull();

        const flagInDb = await testDb
            .select()
            .from(featureFlagsTable)
            .where(eq(featureFlagsTable.id, flagId));

        expect(flagInDb).toHaveLength(1);
        expect(flagInDb[0].deletedAt).not.toBeNull();
    });

    it("returns 401 if non-Developer tries to delete", async () => {
        const {getUserRole} = await import("@/lib/helpers/user");
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager");

        const created = await testDb
            .insert(featureFlagsTable)
            .values({
                userId: 1,
                name: "ProtectedDeleteFlag",
                isActive: true,
                description: "Cannot delete",
                strategy: "NO_STRATEGY",
                startTime: new Date(),
                endTime: null,
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

        expect(flagInDb[0].deletedAt).toBeNull();
    });
});