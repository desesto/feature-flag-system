import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import {featureFlagsTable} from "@/db/schema";
import * as schema from "@/db/schema";

const db = drizzle(process.env.DATABASE_URL!, { schema });

export async function GET(req: NextRequest) {

    const featureFlags = await db.query.featureFlagsTable.findMany({
        with: {
            user: true,
        },
    });

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
