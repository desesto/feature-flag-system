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
            feature_flag_id: 1,
            user_id: 2,
            action_type: 'CREATED',
            changed_fields: null,
            old_values: null,
            new_values: null,
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
            feature_flag_id: 5,
            user_id: 3,
            action_type: 'DELETED',
            changed_fields: null,
            old_values: null,
            new_values: null,
        })
    })
})

describe("logFeatureFlagUpdated", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("logs ACTIVATED when only is_active changes to true", async () => {
        const oldFlag: FeatureFlagDto = {
            id: 1,
            name: "test-flag",
            is_active: false,
            description: "Test",
            strategy: "NO_STRATEGY",
            user_id: 1,
            whitelist_id: null,
            start_time: null,
            end_time: null,
            created_at: new Date("2025-01-01"),
            updated_at: new Date("2025-01-01"),
            deleted_at: null,
        }

        const newFlag: FeatureFlagDto = {
            ...oldFlag,
            is_active: true,
        }

        await logFeatureFlagUpdated(1, 2, oldFlag, newFlag)

        expect(mockDb.values).toHaveBeenCalledWith({
            feature_flag_id: 1,
            user_id: 2,
            action_type: 'ACTIVATED',
            changed_fields: JSON.stringify(['is_active']),
            old_values: JSON.stringify({ is_active: false }),
            new_values: JSON.stringify({ is_active: true }),
        })
    })

    it("logs DEACTIVATED when only is_active changes to false", async () => {
        const oldFlag: FeatureFlagDto = {
            id: 1,
            name: "test-flag",
            is_active: true,
            description: "Test",
            strategy: "NO_STRATEGY",
            user_id: 1,
            whitelist_id: null,
            start_time: null,
            end_time: null,
            created_at: new Date("2025-01-01"),
            updated_at: new Date("2025-01-01"),
            deleted_at: null,
        }

        const newFlag: FeatureFlagDto = {
            ...oldFlag,
            is_active: false,
        }

        await logFeatureFlagUpdated(1, 2, oldFlag, newFlag)

        expect(mockDb.values).toHaveBeenCalledWith({
            feature_flag_id: 1,
            user_id: 2,
            action_type: 'DEACTIVATED',
            changed_fields: JSON.stringify(['is_active']),
            old_values: JSON.stringify({ is_active: true }),
            new_values: JSON.stringify({ is_active: false }),
        })
    })

    it("logs UPDATED when multiple fields change", async () => {
        const oldFlag: FeatureFlagDto = {
            id: 1,
            name: "old-name",
            is_active: false,
            description: "Old description",
            strategy: "NO_STRATEGY",
            user_id: 1,
            whitelist_id: null,
            start_time: null,
            end_time: null,
            created_at: new Date("2025-01-01"),
            updated_at: new Date("2025-01-01"),
            deleted_at: null,
        }

        const newFlag: FeatureFlagDto = {
            ...oldFlag,
            name: "new-name",
            description: "New description",
        }

        await logFeatureFlagUpdated(1, 2, oldFlag, newFlag)

        expect(mockDb.values).toHaveBeenCalledWith({
            feature_flag_id: 1,
            user_id: 2,
            action_type: 'UPDATED',
            changed_fields: JSON.stringify(['name', 'description']),
            old_values: JSON.stringify({
                name: 'old-name',
                description: 'Old description'
            }),
            new_values: JSON.stringify({
                name: 'new-name',
                description: 'New description'
            }),
        })
    })

    it("does not log when no fields changed", async () => {
        const oldFlag: FeatureFlagDto = {
            id: 1,
            name: "test-flag",
            is_active: true,
            description: "Test",
            strategy: "NO_STRATEGY",
            user_id: 1,
            whitelist_id: null,
            start_time: null,
            end_time: null,
            created_at: new Date("2025-01-01"),
            updated_at: new Date("2025-01-01"),
            deleted_at: null,
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
    it("returns ACTIVATED when only is_active changes to true", () => {
        const result = determineUpdateActionType(['is_active'], true)
        expect(result).toBe('ACTIVATED')
    })

    it("returns DEACTIVATED when only is_active changes to false", () => {
        const result = determineUpdateActionType(['is_active'], false)
        expect(result).toBe('DEACTIVATED')
    })

    it("returns UPDATED when multiple fields change", () => {
        const result = determineUpdateActionType(['name', 'description'], undefined)
        expect(result).toBe('UPDATED')
    })

    it("returns UPDATED when is_active and other fields change", () => {
        const result = determineUpdateActionType(['is_active', 'name'], true)
        expect(result).toBe('UPDATED')
    })
})