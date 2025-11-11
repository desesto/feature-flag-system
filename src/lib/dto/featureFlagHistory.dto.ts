import {FeatureFlagHistorySchema} from "@/lib/schemas/featureFlagHistory.schema";

export type FeatureFlagHistoryDto = InferOutput<typeof FeatureFlagHistorySchema>