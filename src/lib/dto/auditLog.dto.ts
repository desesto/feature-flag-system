import {InferInput, InferOutput} from "valibot";
import {
    AuditLogSchema, CreateAuditLogSchema, GetAuditLogSchema

} from "@/lib/schemas/auditLog.schema";


export type AuditLogDto = InferOutput<typeof AuditLogSchema>;

export type CreateAuditLogDto = InferInput<typeof CreateAuditLogSchema>;

export type GetAuditLogsDto = InferOutput<typeof GetAuditLogSchema>