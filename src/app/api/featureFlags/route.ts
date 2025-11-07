import { drizzle } from "drizzle-orm/node-postgres";
import { NextRequest, NextResponse } from "next/server";
import {featureFlagsTable} from "@/db/schema";
import * as schema from "@/db/schema";
import {asc} from "drizzle-orm";
import {eq, isNull} from "drizzle-orm/sql/expressions/conditions";
import {parse} from "valibot";
import {CreateFeatureFlagSchema, EditFeatureFlagSchema, GetFeatureFlagsSchema} from "@/lib/schemas/featureFlag.schema";


const db = drizzle(process.env.DATABASE_URL!, { schema });

    
export async function GET() {
    const flags = await db.query.featureFlagsTable.findMany({
        where: (flag, { isNull }) => isNull(flag.deleted_at),
        with: { user: true },
        orderBy: [asc(featureFlagsTable.name)],
    });

    const serializedFlags = flags.map(flag => ({
        ...flag,
        start_time: flag.start_time?.toISOString() ?? null,
        end_time: flag.end_time?.toISOString() ?? null,
        created_at: flag.created_at?.toISOString() ?? null,
        updated_at: flag.updated_at?.toISOString() ?? null,
        deleted_at: flag.deleted_at?.toISOString() ?? null,
    }));


    const validated = parse(GetFeatureFlagsSchema, serializedFlags);

    return NextResponse.json(validated);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const parseDate = (v: string | null) => (v ? new Date(v) : null);

    const validatedData = parse(CreateFeatureFlagSchema, body)

    const newFlag = await db
        .insert(featureFlagsTable)
        .values({
            user_id: validatedData.user_id,
            name: validatedData.name,
            is_active: validatedData.is_active,
            description: validatedData.description,
            strategy: validatedData.strategy,
            start_time: parseDate(validatedData.start_time ?? null),
            end_time: parseDate(validatedData.end_time ?? null),
        })
        .returning();

    return NextResponse.json(newFlag[0]);
}

export async function PATCH(req: NextRequest) {
    const body = await req.json();

    const validated = parse(EditFeatureFlagSchema, body)
    const { id, ...updates } = validated;

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



