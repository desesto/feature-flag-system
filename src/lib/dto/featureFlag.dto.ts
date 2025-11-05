import {InferInput, InferOutput} from "valibot";
import {CreateFeatureFlagSchema, FeatureFlagSchema} from "@/lib/schemas/featureFlag.schema";


export type FeatureFlagDto = InferOutput<typeof FeatureFlagSchema>;

export type CreateFeatureFlagDto = InferInput<typeof CreateFeatureFlagSchema>;

