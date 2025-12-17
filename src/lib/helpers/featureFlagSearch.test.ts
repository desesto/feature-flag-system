import { describe, it, expect } from 'vitest';
import { binarySearchFeatureFlag } from "@/lib/helpers/featureFlagSearch";
import type { FeatureFlagDto } from "@/lib/dto/featureFlag.dto";

describe("binarySearchFeatureFlag", () => {
    it("should return matching feature flags", () => {
        const flags: FeatureFlagDto[] = [
            { id: 1, userId: 100, name: "AlphaFeature", isActive: true, description: "Alpha feature", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 2, userId: 100, name: "BetaFeature", isActive: true, description: "Beta feature", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 3, userId: 100, name: "BetaPlusFeature", isActive: true, description: "Beta plus feature", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 4, userId: 100, name: "GammaFeature", isActive: true, description: "Gamma feature", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 5, userId: 100, name: "DeltaFeature", isActive: true, description: "Delta feature", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
        ];

        const results = binarySearchFeatureFlag(flags, "Beta");

        expect(results).toHaveLength(2);
        expect(results[0].name).toBe("BetaFeature");
        expect(results[1].name).toBe("BetaPlusFeature");
    });

    it("should return empty array when no match found", () => {
        const flags: FeatureFlagDto[] = [
            { id: 1, userId: 100, name: "AlphaFeature", isActive: true, description: "Alpha feature", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
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
            { id: 0, userId: 100, name: "TestFeature0", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 1, userId: 100, name: "TestFeature1", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 2, userId: 100, name: "TestFeature2", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 3, userId: 100, name: "TestFeature3", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 4, userId: 100, name: "TestFeature4", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 5, userId: 100, name: "TestFeature5", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 6, userId: 100, name: "TestFeature6", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 7, userId: 100, name: "TestFeature7", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 8, userId: 100, name: "TestFeature8", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
            { id: 9, userId: 100, name: "TestFeature9", isActive: true, description: "Test", strategy: null, whiteListId: null, whiteList: undefined, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
        ];

        const results = binarySearchFeatureFlag(flags, "TestFeature");

        expect(results.length).toBeLessThanOrEqual(7);
        expect(results.length).toBe(7);
    });

    it("should work with feature flags that have whiteList", () => {
        const flags: FeatureFlagDto[] = [
            { id: 1, userId: 100, name: "CanaryFeature", isActive: true, description: "Canary feature", strategy: "CANARY", whiteListId: 5, whiteList: { id: 5, name: "Beta Testers" }, startTime: null, endTime: null, createdAt: null, updatedAt: null, deletedAt: null },
        ];

        const results = binarySearchFeatureFlag(flags, "Canary");

        expect(results).toHaveLength(1);
        expect(results[0].whiteList?.name).toBe("Beta Testers");
    });
});