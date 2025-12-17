/**
 * @vitest-environment node
 */
import { describe, expect, it, vi, beforeEach } from "vitest"
import type { FeatureFlagDto } from "@/lib/dto/featureFlag.dto"

const { mockDb } = vi.hoisted(() => {
    const mockDb = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([]),
    }

    return { mockDb }
})

vi.mock("drizzle-orm/node-postgres", () => ({
    drizzle: vi.fn(() => mockDb),
}))


import {
    logFeatureFlagCreated,
    logFeatureFlagDeleted,
    logFeatureFlagUpdated,
    determineUpdateActionType,
} from "./featureFlagHistory"

describe("logFeatureFlagCreated", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("inserts correct data for CREATED action", async () => {
        await logFeatureFlagCreated(1, 2)

        expect(mockDb.insert).toHaveBeenCalled()
        expect(mockDb.values).toHaveBeenCalledWith({
            featureFlagId: 1,
            userId: 2,
            actionType: 'CREATED',
            changedFields: null,
            oldValues: null,
            newValues: null,
        })
    })
})

describe("logFeatureFlagDeleted", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("inserts correct data for DELETED action", async () => {
        await logFeatureFlagDeleted(5, 3)

        expect(mockDb.insert).toHaveBeenCalled()
        expect(mockDb.values).toHaveBeenCalledWith({
            featureFlagId: 5,
            userId: 3,
            actionType: 'DELETED',
            changedFields: null,
            oldValues: null,
            newValues: null,
        })
    })
})

describe("logFeatureFlagUpdated", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("logs ACTIVATED when only isActive changes to true", async () => {
        const oldFlag: FeatureFlagDto = {
            id: 1,
            name: "test-flag",
            isActive: false,
            description: "Test",
            strategy: "NO_STRATEGY",
            userId: 1,
            whiteListId: null,
            startTime: null,
            endTime: null,
            createdAt: new Date("2025-01-01"),
            updatedAt: new Date("2025-01-01"),
            deletedAt: null,
        }

        const newFlag: FeatureFlagDto = {
            ...oldFlag,
            isActive: true,
        }

        await logFeatureFlagUpdated(1, 2, oldFlag, newFlag)

        expect(mockDb.values).toHaveBeenCalledWith({
            featureFlagId: 1,
            userId: 2,
            actionType: 'ACTIVATED',
            changedFields: JSON.stringify(['isActive']),
            oldValues: JSON.stringify({ isActive: false }),
            newValues: JSON.stringify({ isActive: true }),
        })
    })

    it("logs DEACTIVATED when only isActive changes to false", async () => {
        const oldFlag: FeatureFlagDto = {
            id: 1,
            name: "test-flag",
            isActive: true,
            description: "Test",
            strategy: "NO_STRATEGY",
            userId: 1,
            whiteListId: null,
            startTime: null,
            endTime: null,
            createdAt: new Date("2025-01-01"),
            updatedAt: new Date("2025-01-01"),
            deletedAt: null,
        }

        const newFlag: FeatureFlagDto = {
            ...oldFlag,
            isActive: false,
        }

        await logFeatureFlagUpdated(1, 2, oldFlag, newFlag)

        expect(mockDb.values).toHaveBeenCalledWith({
            featureFlagId: 1,
            userId: 2,
            actionType: 'DEACTIVATED',
            changedFields: JSON.stringify(['isActive']),
            oldValues: JSON.stringify({ isActive: true }),
            newValues: JSON.stringify({ isActive: false }),
        })
    })

    it("logs UPDATED when multiple fields change", async () => {
        const oldFlag: FeatureFlagDto = {
            id: 1,
            name: "old-name",
            isActive: false,
            description: "Old description",
            strategy: "NO_STRATEGY",
            userId: 1,
            whiteListId: null,
            startTime: null,
            endTime: null,
            createdAt: new Date("2025-01-01"),
            updatedAt: new Date("2025-01-01"),
            deletedAt: null,
        }

        const newFlag: FeatureFlagDto = {
            ...oldFlag,
            name: "new-name",
            description: "New description",
        }

        await logFeatureFlagUpdated(1, 2, oldFlag, newFlag)

        expect(mockDb.values).toHaveBeenCalledWith({
            featureFlagId: 1,
            userId: 2,
            actionType: 'UPDATED',
            changedFields: JSON.stringify(['name', 'description']),
            oldValues: JSON.stringify({
                name: 'old-name',
                description: 'Old description'
            }),
            newValues: JSON.stringify({
                name: 'new-name',
                description: 'New description'
            }),
        })
    })

    it("does not log when no fields changed", async () => {
        const oldFlag: FeatureFlagDto = {
            id: 1,
            name: "test-flag",
            isActive: true,
            description: "Test",
            strategy: "NO_STRATEGY",
            userId: 1,
            whiteListId: null,
            startTime: null,
            endTime: null,
            createdAt: new Date("2025-01-01"),
            updatedAt: new Date("2025-01-01"),
            deletedAt: null,
        }

        const newFlag: FeatureFlagDto = {
            ...oldFlag,
            name: "test-flag",
        }

        await logFeatureFlagUpdated(1, 2, oldFlag, newFlag)

        expect(mockDb.insert).not.toHaveBeenCalled()
        expect(mockDb.values).not.toHaveBeenCalled()
    })
})

describe("determineUpdateActionType", () => {
    it("returns ACTIVATED when only isActive changes to true", () => {
        const result = determineUpdateActionType(['isActive'], true)
        expect(result).toBe('ACTIVATED')
    })

    it("returns DEACTIVATED when only isActive changes to false", () => {
        const result = determineUpdateActionType(['isActive'], false)
        expect(result).toBe('DEACTIVATED')
    })

    it("returns UPDATED when multiple fields change", () => {
        const result = determineUpdateActionType(['name', 'description'], undefined)
        expect(result).toBe('UPDATED')
    })

    it("returns UPDATED when isActive and other fields change", () => {
        const result = determineUpdateActionType(['isActive', 'name'], true)
        expect(result).toBe('UPDATED')
    })
})