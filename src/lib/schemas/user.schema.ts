import {array, number, object, optional, picklist, pipe, string, trim} from "valibot";

export const UserSchema = object({
    id: number(),
    name: string(),
    email: string(),
    role: picklist(["Product-Manager", "Developer"]),
})

export const CreateUserSchema = object({
    name: string(),
    email: string(),
    role: optional(picklist(["Product-Manager", "Developer"]), "Developer"),
});


export const GetUsersSchema = array(UserSchema);