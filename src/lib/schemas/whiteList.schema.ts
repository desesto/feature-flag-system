import {array, number, object, optional, string} from "valibot";
import {UserSchema} from "@/lib/schemas/user.schema";

export const WhiteListSchema = object({
    id: number(),
    name: string(),
});

export const CreateWhiteListSchema = object({
    name: string(),
    userIds: optional(array(number())),
});

export const UpdateWhiteListSchema = object({
    userIds: array(number()),
});

export const GetWhiteListWithUsersSchema = object({
    id: number(),
    name: string(),
    users: array(UserSchema),
});

export const GetWhiteListsSchema = array(WhiteListSchema);
