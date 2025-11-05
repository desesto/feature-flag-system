import { drizzle } from "drizzle-orm/node-postgres";
import { NextRequest, NextResponse } from "next/server";
import {featureFlagsTable} from "@/db/schema";
import * as schema from "@/db/schema";
import {asc} from "drizzle-orm";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {asc} from "drizzle-orm";
import {eq, isNull} from "drizzle-orm/sql/expressions/conditions";


const db = drizzle(process.env.DATABASE_URL!, { schema });

    
export async function GET() {
    const flags = await db.query.featureFlagsTable.findMany({
        where: (flag, { isNull }) => isNull(flag.deleted_at),
        with: { user: true },
      orderBy: [asc(featureFlagsTable.name)],
    });

    return NextResponse.json(flags);
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

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const parseDate = (v: string | null | undefined) => (v ? new Date(v) : undefined);


    const updateData = Object.fromEntries(
        Object.entries({
            name: updates.name,
            is_active: updates.is_active,
            description: updates.description,
            strategy: updates.strategy,
            start_time: parseDate(updates.start_time),
            end_time: parseDate(updates.end_time),
            updated_at: new Date(),
        }).filter(([_, value]) => value !== undefined)
    );

    const updatedFlag = await db
        .update(featureFlagsTable)
        .set(updateData)
        .where(eq(featureFlagsTable.id, id))
        .returning();

    if (updatedFlag.length === 0) {
        return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    return NextResponse.json(updatedFlag[0]);
}



