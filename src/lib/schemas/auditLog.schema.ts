import {nullable, number, object, string, optional, array} from "valibot";

export const AuditLogSchema = object({
    id: number(),
    user_id: number(),
    user_email: string(),
    action: string(),
    entity: string(),
    entity_id: number(),
    entity_name: string(),
    old_value: string(),
    new_value: string(),
    created_at: optional(nullable(string())),
});

export const CreateAuditLogSchema = object({
    user_id: number(),
    user_email: string(),
    action: string(),
    entity: string(),
    entity_id: number(),
    entity_name: string(),
    old_value: string(),
    new_value: string(),
});

export const GetAuditLogSchema = array(AuditLogSchema);