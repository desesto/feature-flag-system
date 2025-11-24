import {InferInput, InferOutput} from "valibot";
import {
    AddUserToWhiteListSchema, AssignWhiteListToFeatureFlagSchema, CreateWhiteListSchema,
    GetWhiteListsSchema, GetWhiteListWithUsersSchema,
    RemoveUserFromWhiteListSchema, UpdateWhiteListSchema,
    WhiteListSchema,
    WhiteListUserSchema
} from "@/lib/schemas/whiteList.schema";

export type WhiteListDto = InferOutput<typeof WhiteListSchema>

export type WhiteListUserDto = InferOutput<typeof WhiteListUserSchema>

export type CreateWhiteListDto = InferInput<typeof CreateWhiteListSchema>

export type UpdateWhiteListDto = InferInput<typeof UpdateWhiteListSchema>

export type AssignWhiteListToFeatureFlagDto = InferInput<typeof AssignWhiteListToFeatureFlagSchema>

export type GetWhiteListWithUsersDto = InferOutput<typeof GetWhiteListWithUsersSchema>

export type GetWhiteListsDto = InferOutput<typeof GetWhiteListsSchema>

export type AddUserToWhiteListDto = InferInput<typeof AddUserToWhiteListSchema>;

export type RemoveUserFromWhiteListDto = InferInput<typeof RemoveUserFromWhiteListSchema>;