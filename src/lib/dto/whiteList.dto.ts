import type {InferInput, InferOutput} from "valibot";
import type {
    CreateWhiteListSchema,
    GetWhiteListsSchema, GetWhiteListWithUsersSchema,
    UpdateWhiteListSchema,
    WhiteListSchema,
} from "@/lib/schemas/whiteList.schema";

export type WhiteListDto = InferOutput<typeof WhiteListSchema>

export type CreateWhiteListDto = InferInput<typeof CreateWhiteListSchema>

export type UpdateWhiteListDto = InferInput<typeof UpdateWhiteListSchema>

export type GetWhiteListWithUsersDto = InferOutput<typeof GetWhiteListWithUsersSchema>

export type GetWhiteListsDto = InferOutput<typeof GetWhiteListsSchema>

