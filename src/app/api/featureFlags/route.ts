import { drizzle } from "drizzle-orm/node-postgres";
import { NextRequest, NextResponse } from "next/server";
import {featureFlagsTable} from "@/db/schema";
import * as schema from "@/db/schema";
import {asc} from "drizzle-orm";
import {eq, isNull} from "drizzle-orm/sql/expressions/conditions";
import {parse} from "valibot";
import {CreateFeatureFlagSchema, EditFeatureFlagSchema, GetFeatureFlagsSchema} from "@/lib/schemas/featureFlag.schema";
import {logFeatureFlagCreated, logFeatureFlagUpdated} from "@/lib/helpers/featureFlagHistory";
import {getUserRole} from "@/lib/helpers/user";
import type {EditFeatureFlagDto, FeatureFlagDto} from "@/lib/dto/featureFlag.dto";
import {
    hasAccessToCreateFeatureFlag,
    hasAccessToEditFeatureFlag,
    hasAccessToToggleFeatureFlag
} from "@/access-control/featureFlagAccess";


const db = drizzle(process.env.DATABASE_URL!, { schema });

    
export async function GET() {
    const flags = await db.query.featureFlagsTable.findMany({
        where: (flag) => isNull(flag.deleted_at),
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
    const role = await getUserRole(body.user_id);

    if (!role) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const parseDate = (v: string | null) => (v ? new Date(v) : null);


    if(!hasAccessToCreateFeatureFlag(role)) {
        return NextResponse.json({ error: "Unauthorized action: only developers can create flags" }, { status: 401 });
    }
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

    await logFeatureFlagCreated(newFlag[0].id, newFlag[0].user_id);

    return NextResponse.json(newFlag[0]);
}

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const validated = parse(EditFeatureFlagSchema, body)
    const { id, user_id, ...updates } = validated;

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const role = await getUserRole(user_id);

    if (!role) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

        if (!hasAccessToEditFeatureFlag(role)) {
            return NextResponse.json(
                { error: "Du har ikke adgang til at redigere feature flags" },
                { status: 403 }
            );
        }


    //til historik - hent gamle flag inden opdatering
    const oldFlag = await db
        .select()
        .from(featureFlagsTable)
        .where(eq(featureFlagsTable.id, id));

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

    const newFlag = await db
        .update(featureFlagsTable)
        .set(updateData)
        .where(eq(featureFlagsTable.id, id))
        .returning();


    await logFeatureFlagUpdated(
        id,
        user_id,
        oldFlag[0] as FeatureFlagDto,
        updates as EditFeatureFlagDto
    );


    return NextResponse.json(newFlag[0]);
}



