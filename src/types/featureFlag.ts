export type FeatureFlag = {
    id: number, user_id: number, name: string, is_active: boolean, description: string, strategy: "NO_STRATEGY" | "FEATURE_COMING", start_time: string, end_time: string, created_at: string, updated_at: string, deleted_at: string
};


export type CreateFeatureFlagInput = {
    id: number, user_id: number, name: string, is_active: boolean, description: string, strategy: "NO_STRATEGY" | "FEATURE_COMING", start_time: string, end_time: string, created_at: string, updated_at: string, deleted_at: string
};


