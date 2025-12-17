import type {InferInput, InferOutput} from "valibot";
import type {CreateUserSchema, GetUsersSchema, UserSchema} from "@/lib/schemas/user.schema";

export type UserDto = InferOutput<typeof UserSchema>;

export type CreateUserDto = InferInput<typeof CreateUserSchema>

export type GetUsersDto = InferOutput<typeof GetUsersSchema>