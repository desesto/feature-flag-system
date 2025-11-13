import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import {auditLogsTable, featureFlagsTable} from "@/db/schema";
import * as schema from "@/db/schema";
import {desc} from "drizzle-orm";


const db = drizzle(process.env.DATABASE_URL!, { schema });

function serializeJson(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(serializeJson);
    if (typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, serializeJson(v)])
        );
    }
    return obj;
}

export async function GET() {
    const logs = await db.query.auditLogsTable.findMany({
        with: { user: true },
        orderBy: [desc(auditLogsTable.created_at)],
    });

    const serializedLogs = logs.map(log => ({
        ...log,
        created_at: log.created_at?.toISOString() ?? null,
        old_value: serializeJson(log.old_value),
        new_value: serializeJson(log.new_value),
    }));

    return NextResponse.json(serializedLogs);
}
