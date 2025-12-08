// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { binarySearchFeatureFlag } from "@/lib/helpers/featureFlagSearch";
import type { FeatureFlagDto } from "@/lib/dto/featureFlag.dto";

describe("binarySearchFeatureFlag", () => {
    it("should return matching feature flags", () => {
        const flags: FeatureFlagDto[] = [
            { id: 1, user_id: 100, name: "AlphaFeature", is_active: true, description: "Alpha feature", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 2, user_id: 100, name: "BetaFeature", is_active: true, description: "Beta feature", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 3, user_id: 100, name: "BetaPlusFeature", is_active: true, description: "Beta plus feature", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 4, user_id: 100, name: "GammaFeature", is_active: true, description: "Gamma feature", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 5, user_id: 100, name: "DeltaFeature", is_active: true, description: "Delta feature", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
        ];

        const results = binarySearchFeatureFlag(flags, "Beta");

        expect(results).toHaveLength(2);
        expect(results[0].name).toBe("BetaFeature");
        expect(results[1].name).toBe("BetaPlusFeature");
    });

    it("should return empty array when no match found", () => {
        const flags: FeatureFlagDto[] = [
            { id: 1, user_id: 100, name: "AlphaFeature", is_active: true, description: "Alpha feature", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
        ];

        const results = binarySearchFeatureFlag(flags, "Zeta");

        expect(results).toEqual([]);
    });

    it("should handle empty array", () => {
        const flags: FeatureFlagDto[] = [];
        const results = binarySearchFeatureFlag(flags, "Test");
        expect(results).toEqual([]);
    });

    it("should return max 7 results", () => {
        const flags: FeatureFlagDto[] = [
            { id: 0, user_id: 100, name: "TestFeature0", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 1, user_id: 100, name: "TestFeature1", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 2, user_id: 100, name: "TestFeature2", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 3, user_id: 100, name: "TestFeature3", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 4, user_id: 100, name: "TestFeature4", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 5, user_id: 100, name: "TestFeature5", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 6, user_id: 100, name: "TestFeature6", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 7, user_id: 100, name: "TestFeature7", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 8, user_id: 100, name: "TestFeature8", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
            { id: 9, user_id: 100, name: "TestFeature9", is_active: true, description: "Test", strategy: null, whitelist_id: null, whitelist: undefined, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
        ];

        const results = binarySearchFeatureFlag(flags, "TestFeature");

        expect(results.length).toBeLessThanOrEqual(7);
        expect(results.length).toBe(7);
    });

    it("should work with feature flags that have whitelist", () => {
        const flags: FeatureFlagDto[] = [
            { id: 1, user_id: 100, name: "CanaryFeature", is_active: true, description: "Canary feature", strategy: "CANARY", whitelist_id: 5, whitelist: { id: 5, name: "Beta Testers" }, start_time: null, end_time: null, created_at: null, updated_at: null, deleted_at: null },
        ];

        const results = binarySearchFeatureFlag(flags, "Canary");

        expect(results).toHaveLength(1);
        expect(results[0].whitelist?.name).toBe("Beta Testers");
    });
});