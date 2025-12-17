import {nullable, number, object, picklist, string, boolean, optional, array, fallback, date} from "valibot";

export const strategyValues = ['NO_STRATEGY', 'CANARY', 'FUTURE_IMPLEMENTATIONS'] as const;

export const FeatureFlagSchema = object({
    id: number(),
    userId: number(),
    name: string(),
    isActive: boolean(),
    description: string(),
    strategy: nullable(picklist(strategyValues)),
    whiteListId: nullable(number()),
    whiteList: optional(nullable(object({
        id: number(),
        name: string(),
    }))),
    startTime: nullable(date()),
    endTime: nullable(date()),
    createdAt: nullable(date()),
    updatedAt: nullable(date()),
    deletedAt: nullable(date()),
    path: optional(nullable(array(string()))),
});

export const CreateFeatureFlagSchema = object({
    userId: number(),
    name: string(),
    isActive: boolean(),
    description: string(),
    strategy: fallback(picklist(strategyValues), "NO_STRATEGY"),
    whiteListId: optional(nullable(number())),
    startTime: optional(nullable(date())),
    endTime: optional(nullable(date())),
    path: optional(nullable(array(string()))),
});

export const EditFeatureFlagSchema = object({
    id: number(),
    userId: number(),
    name: optional(string()),
    isActive: optional(boolean()),
    description: optional(string()),
    strategy: optional(picklist(strategyValues)),
    whiteListId: optional(nullable(number())),
    whiteList: optional(nullable(object({
        id: number(),
        name: string(),
    }))),
    startTime: optional(nullable(date())),
    endTime: optional(nullable(date())),
    path: optional(nullable(array(string()))),
});

export const GetFeatureFlagsSchema = array(FeatureFlagSchema);