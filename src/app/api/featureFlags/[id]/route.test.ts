// src/app/api/featureFlags/[id]/route.test.ts
/**
 * @vitest-environment node
 */
import { describe, expect, it, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// Use vi.hoisted to ensure mockDb is available during hoisting
const { mockDb } = vi.hoisted(() => {
    const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn(),
    }

    return { mockDb }
})

vi.mock("drizzle-orm/node-postgres", () => ({
    drizzle: vi.fn(() => mockDb),
}))

vi.mock("@/lib/helpers/user", () => ({
    getUserRole: vi.fn(),
}))

vi.mock("@/lib/helpers/featureFlagHistory", () => ({
    logFeatureFlagDeleted: vi.fn(),
}))

// Import AFTER mocks
import { DELETE } from "@/app/api/featureFlags/[id]/route"
import { getUserRole } from "@/lib/helpers/user"
import { logFeatureFlagDeleted } from "@/lib/helpers/featureFlagHistory"

describe("DELETE /api/feature-flags/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns 401 when user is not a Developer", async () => {
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager")

        const req = new NextRequest("http://localhost:3000/api/feature-flags/1", {
            method: "DELETE",
            body: JSON.stringify({ id: 1, userId: 2 }),
        })

        const response = await DELETE(req)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe("Unauthorized action: only developers can delete flags")
    })

    it("successfully deletes flag and logs history when user is Developer", async () => {
        const mockDeletedFlag = {
            id: 1,
            name: "test-flag",
            is_active: false,
            description: "Test",
            strategy: "standard",
            user_id: 1,
            start_time: null,
            end_time: null,
            created_at: new Date("2025-01-01"),
            updated_at: new Date("2025-01-01"),
            deleted_at: new Date("2025-11-17"),
        }

        vi.mocked(getUserRole).mockResolvedValueOnce("Developer")
        vi.mocked(logFeatureFlagDeleted).mockResolvedValueOnce(undefined)
        mockDb.returning.mockResolvedValueOnce([mockDeletedFlag])

        const req = new NextRequest("http://localhost:3000/api/feature-flags/1", {
            method: "DELETE",
            body: JSON.stringify({ id: 1, userId: 1 }),
        })

        const response = await DELETE(req)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.id).toBe(1)
        expect(data.deleted_at).toBeTruthy()
        expect(logFeatureFlagDeleted).toHaveBeenCalledWith(1, 1)
    })
})