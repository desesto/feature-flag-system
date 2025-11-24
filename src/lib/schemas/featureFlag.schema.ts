import {nullable, number, object, picklist, string, boolean, optional, array, fallback} from "valibot";

export const strategyValues = ['NO_STRATEGY', 'CANARY', 'FUTURE_IMPLEMENTATIONS'] as const;

export const FeatureFlagSchema = object({
    id: number(),
    user_id: number(),
    name: string(),
    is_active: boolean(),
    description: string(),
    strategy: nullable(picklist(strategyValues)),
    start_time: nullable(string()),
    end_time: nullable(string()),
    created_at: nullable(string()),
    updated_at: nullable(string()),
    deleted_at: nullable(string()),
});

export const CreateFeatureFlagSchema = object({
    user_id: number(),
    name: string(),
    is_active: boolean(),
    description: string(),
    strategy: fallback(picklist(strategyValues), "NO_STRATEGY"),
    start_time: optional(nullable(string())),
    end_time: optional(nullable(string())),
});

export const EditFeatureFlagSchema = object({
    id: number(),
    user_id: number(),
    name: optional(string()),
    is_active: optional(boolean()),
    description: optional(string()),
    strategy: optional(picklist(strategyValues)),
    start_time: optional(nullable(string())),
    end_time: optional(nullable(string())),
});

export const GetFeatureFlagsSchema = array(FeatureFlagSchema);