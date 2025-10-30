import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import {featureFlagsTable, usersTable} from "@/db/schema";
import {eq} from "drizzle-orm/sql/expressions/conditions";

const db = drizzle(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
    const featureFlags = await db
        .select({
            id: featureFlagsTable.id,
            name: featureFlagsTable.name,
            is_active: featureFlagsTable.is_active,
            description: featureFlagsTable.description,
            strategy: featureFlagsTable.strategy,
            start_time: featureFlagsTable.start_time,
            end_time: featureFlagsTable.end_time,
            created_at: featureFlagsTable.created_at,
            updated_at: featureFlagsTable.updated_at,
            deleted_at: featureFlagsTable.deleted_at,
            user_id: featureFlagsTable.user_id,
            user_name: usersTable.name,
        })
        .from(featureFlagsTable)
        .leftJoin(usersTable, eq(featureFlagsTable.user_id, usersTable.id));

    return NextResponse.json(featureFlags);
}

export async function POST(req: NextRequest) {
    const { user_id, name, is_active, description, strategy, start_time, end_time, created_at, updated_at, deleted_at } = await req.json();
    const parseDate = (v: string | null) => (v ? new Date(v) : null);

    const newFlag = await db
        .insert(featureFlagsTable)
        .values({
            user_id,
            name,
            is_active,
            description,
            strategy,
            start_time: parseDate(start_time),
            end_time: parseDate(end_time),
            created_at: parseDate(created_at),
            updated_at: parseDate(updated_at),
            deleted_at: parseDate(deleted_at),
        })
        .returning();

    return NextResponse.json(newFlag[0]);
}
