import type {InferInput, InferOutput} from "valibot";
import type {
    CreateFeatureFlagHistorySchema,
    FeatureFlagHistorySchema,
    GetFeatureFlagHistoriesSchema
} from "@/lib/schemas/featureFlagHistory.schema";


export type FeatureFlagHistoryDto = InferOutput<typeof FeatureFlagHistorySchema>;

export type CreateFeatureFlagHistoryDto = InferInput<typeof CreateFeatureFlagHistorySchema>;

export type GetFeatureFlagHistoriesDto = InferOutput<typeof GetFeatureFlagHistoriesSchema>;