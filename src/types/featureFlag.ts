export type FeatureFlag = {
    id: number,
    user_id: number,
    name: string,
    is_active: boolean,
    description: string,
    strategy: "NO_STRATEGY" | "FUTURE_IMPLEMENTATIONS",
    start_time: string,
    end_time: string,
    created_at: string,
    updated_at: | null,
    deleted_at: | null
};

//Maybe use infer to create automatically from db schema later

export type CreateFeatureFlagInput = {
    user_id: number,
    name: string,
    is_active: boolean,
    description: string,
    strategy: "NO_STRATEGY" | "FUTURE_IMPLEMENTATIONS",
    start_time: string,
    end_time: string,
    created_at: string
    updated_at: string,
};


