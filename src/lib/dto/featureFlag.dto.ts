import type {InferInput, InferOutput} from "valibot";
import type {
    CreateFeatureFlagSchema,
    EditFeatureFlagSchema,
    FeatureFlagSchema, GetFeatureFlagsSchema,
} from "@/lib/schemas/featureFlag.schema";


export type FeatureFlagDto = InferOutput<typeof FeatureFlagSchema>;

export type CreateFeatureFlagDto = InferInput<typeof CreateFeatureFlagSchema>;

export type EditFeatureFlagDto = InferOutput<typeof EditFeatureFlagSchema>;

export type GetFeatureFlagsDto = InferOutput<typeof GetFeatureFlagsSchema>