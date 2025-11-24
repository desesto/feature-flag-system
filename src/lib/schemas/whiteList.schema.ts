import {array, number, object, optional, string} from "valibot";
import {UserSchema} from "@/lib/schemas/user.schema";

export const WhiteListSchema = object({
    id: number(),
    name: string(),
});

export const WhiteListUserSchema = object({
    id: number(),
    whitelist_id: number(),
    user_id: number(),
});


export const CreateWhiteListSchema = object({
    name: string(),
    user_ids: array(number()),
});

export const UpdateWhiteListSchema = object({
    name: optional(string()),
    user_ids: optional(array(number())),
});

export const AssignWhiteListToFeatureFlagSchema = object({
    whitelist_id: number(),
});

export const AddUserToWhiteListSchema = object({
    user_id: number(),
});

export const RemoveUserFromWhiteListSchema = object({
    user_id: number(),
});

export const GetWhiteListWithUsersSchema = object({
    id: number(),
    name: string(),
    users: array(UserSchema),
});

export const GetWhiteListsSchema = array(WhiteListSchema);
