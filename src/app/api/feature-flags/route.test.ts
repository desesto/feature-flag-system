// src/app/api/featureFlags/route.test.ts
/**
 * @vitest-environment node
 */
import { describe, expect, it, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const { mockDb } = vi.hoisted(() => {
    const mockDb = {
        query: {
            featureFlagsTable: {
                findMany: vi.fn(),
                findFirst: vi.fn(),
            },
        },
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
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
    logFeatureFlagCreated: vi.fn(),
    logFeatureFlagUpdated: vi.fn(),
}))

import {POST} from "@/app/api/featureFlags/route"
import {PATCH} from "@/app/api/featureFlags/[id]/route"
import { getUserRole } from "@/lib/helpers/user"
import { logFeatureFlagCreated, logFeatureFlagUpdated } from "@/lib/helpers/featureFlagHistory"

describe("POST /api/feature-flags", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockDb.returning.mockResolvedValue([])
    })

    it("returns 401 when user is not a Developer", async () => {
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager")

        const req = new NextRequest("http://localhost:3000/api/feature-flags", {
            method: "POST",
            body: JSON.stringify({
                user_id: 2,
                name: "new-flag",
                is_active: true,
                description: "Test",
                strategy: "standard",
            }),
        })

        const response = await POST(req)

        expect(response.status).toBe(401)
    })

    it("creates feature flag and logs history when user is Developer", async () => {
        const mockNewFlag = {
            id: 1,
            name: "new-flag",
            is_active: true,
            description: "Test",
            strategy: "standard",
            user_id: 1,
            start_time: null,
            end_time: null,
            created_at: "2025-01-01T00:00:00.000Z",
            updated_at: "2025-01-01T00:00:00.000Z",
            deleted_at: null,
        }

        vi.mocked(getUserRole).mockResolvedValueOnce("Developer")
        mockDb.returning.mockResolvedValueOnce([mockNewFlag])

        const req = new NextRequest("http://localhost:3000/api/feature-flags", {
            method: "POST",
            body: JSON.stringify({
                user_id: 1,
                name: "new-flag",
                is_active: true,
                description: "Test",
                strategy: "standard",
                start_time: null,
                end_time: null,
            }),
        })

        const response = await POST(req)

        expect(response.status).toBe(200)
        expect(logFeatureFlagCreated).toHaveBeenCalledWith(1, 1)
    })
})

describe("PATCH /api/feature-flags", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockDb.where.mockReturnThis()
        mockDb.returning.mockResolvedValue([])
    })

    it("returns 403 when Product-Manager tries to update other fields", async () => {
        vi.mocked(getUserRole).mockResolvedValueOnce("Product-Manager")

        const req = new NextRequest("http://localhost:3000/api/feature-flags", {
            method: "PATCH",
            body: JSON.stringify({
                id: 1,
                user_id: 2,
                name: "updated-name",
                is_active: true,
            }),
        })

        const response = await PATCH(req)

        expect(response.status).toBe(403)
    })

    it("allows Developer to update and logs history", async () => {
        const mockOldFlag = {
            id: 1,
            name: "old-name",
            is_active: false,
            description: "Old description",
            strategy: "NO_STRATEGY",
            user_id: 1,
            whitelist_id: null,
            whitelist: null,
            start_time: null,
            end_time: null,
            created_at: "2025-01-01T00:00:00.000Z",
            updated_at: "2025-01-01T00:00:00.000Z",
            deleted_at: null,
        }

        const mockUpdatedFlag = {
            id: 1,
            name: "new-name",
            is_active: false,
            description: "Old description",
            strategy: "NO_STRATEGY",
            user_id: 1,
            whitelist_id: null,
            whitelist: null,
            start_time: null,
            end_time: null,
            created_at: "2025-01-01T00:00:00.000Z",
            updated_at: "2025-01-02T00:00:00.000Z",
            deleted_at: null,
        }

        vi.mocked(getUserRole).mockResolvedValueOnce("Developer")
        mockDb.query.featureFlagsTable.findFirst
            .mockResolvedValueOnce(mockOldFlag)
            .mockResolvedValueOnce(mockUpdatedFlag)

        const req = new NextRequest("http://localhost:3000/api/feature-flags", {
            method: "PATCH",
            body: JSON.stringify({
                id: 1,
                user_id: 1,
                name: "new-name",
            }),
        })

        const response = await PATCH(req)

        expect(response.status).toBe(200)
        expect(logFeatureFlagUpdated).toHaveBeenCalled()
    })
})