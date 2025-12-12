import {nullable, number, object, picklist, string, boolean, optional, array, fallback, date} from "valibot";

export const strategyValues = ['NO_STRATEGY', 'CANARY', 'FUTURE_IMPLEMENTATIONS'] as const;

export const FeatureFlagSchema = object({
    id: number(),
    user_id: number(),
    name: string(),
    is_active: boolean(),
    description: string(),
    strategy: nullable(picklist(strategyValues)),
    white_list_id: nullable(number()),
    white_list: optional(nullable(object({
        id: number(),
        name: string(),
    }))),
    start_time: nullable(date()),
    end_time: nullable(date()),
    created_at: nullable(date()),
    updated_at: nullable(date()),
    deleted_at: nullable(date()),
    path: optional(nullable(array(string()))),
});

export const CreateFeatureFlagSchema = object({
    user_id: number(),
    name: string(),
    is_active: boolean(),
    description: string(),
    strategy: fallback(picklist(strategyValues), "NO_STRATEGY"),
    white_list_id: optional(nullable(number())),
    start_time: optional(nullable(date())),
    end_time: optional(nullable(date())),
    path: optional(nullable(array(string()))),
});

export const EditFeatureFlagSchema = object({
    id: number(),
    user_id: number(),
    name: optional(string()),
    is_active: optional(boolean()),
    description: optional(string()),
    strategy: optional(picklist(strategyValues)),
    white_list_id: optional(nullable(number())),
    white_list: optional(nullable(object({
        id: number(),
        name: string(),
    }))),
    start_time: optional(nullable(date())),
    end_time: optional(nullable(date())),
    path: optional(nullable(array(string()))),
});

export const GetFeatureFlagsSchema = array(FeatureFlagSchema);