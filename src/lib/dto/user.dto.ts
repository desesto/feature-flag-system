import {InferInput, InferOutput} from "valibot";
import {CreateUserSchema, GetUsersSchema, UserSchema} from "@/lib/schemas/user.schema";


export type UserDto = InferOutput<typeof UserSchema>;

export type CreateUserDto = InferInput<typeof CreateUserSchema>

export type GetUsersDto = InferOutput<typeof GetUsersSchema>