import {nullable, number, object, picklist, string, boolean, optional} from "valibot";


export const FeatureFlagSchema = object({
    id: number(),
    user_id: number(),
    name: string(),
    is_active: boolean(),
    description: nullable(string()),
    strategy: nullable(picklist(['NO_STRATEGY', 'FUTURE_IMPLEMENTATIONS'])),
    start_time: nullable(string()),
    end_time: nullable(string()),
    created_at: string(),
    updated_at: nullable(string()),
    deleted_at: nullable(string()),
});

export const CreateFeatureFlagSchema = object({
    user_id: number(),
    name: string(),
    is_active: boolean(),
    description: optional(nullable(string())),
    strategy: optional(picklist(['NO_STRATEGY', 'FUTURE_IMPLEMENTATIONS']), 'NO_STRATEGY'),
    start_time: optional(nullable(string())),
    end_time: optional(nullable(string())),
    created_at: string(),
});

export const UpdateFeatureFlagSchema = object({
    id: number(),
    name: optional(string()),
    is_active: optional(boolean()),
    description: optional(nullable(string())),
    strategy: optional(nullable(picklist(['NO_STRATEGY', 'FUTURE_IMPLEMENTATIONS']))),
    start_time: optional(nullable(string())),
    end_time: optional(nullable(string())),
});