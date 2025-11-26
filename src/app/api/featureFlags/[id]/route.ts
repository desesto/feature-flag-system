import { and, eq, isNull } from "drizzle-orm";
import {EditFeatureFlagSchema, FeatureFlagSchema} from "@/lib/schemas/featureFlag.schema";
import {parse} from "valibot";
import {featureFlagsTable} from "@/db/schema"
import {type NextRequest, NextResponse} from "next/server";
import {logFeatureFlagDeleted, logFeatureFlagUpdated} from "@/lib/helpers/featureFlagHistory";
import { db } from "@/db";
import {getUserRole} from "@/lib/helpers/user";
import {hasAccessToDeleteFeatureFlag, hasAccessToEditFeatureFlag} from "@/access-control/featureFlagAccess";
import type {FeatureFlagDto} from "@/lib/dto/featureFlag.dto";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const featureFlagId = Number(id);

    if (isNaN(featureFlagId)) {
        return NextResponse.json({ error: "Invalid feature flag ID" }, { status: 400 });
    }

    const featureFlag = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.id, featureFlagId),
        with: {
            whitelist: true,
        },
    });

    if (!featureFlag) {
        return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    const serializedFlag = {
        ...featureFlag,
        start_time: featureFlag.start_time?.toISOString() ?? null,
        end_time: featureFlag.end_time?.toISOString() ?? null,
        created_at: featureFlag.created_at?.toISOString() ?? null,
        updated_at: featureFlag.updated_at?.toISOString() ?? null,
        deleted_at: featureFlag.deleted_at?.toISOString() ?? null,
    };


    const validated = parse(FeatureFlagSchema, serializedFlag);

    return NextResponse.json(validated);
  }



export async function DELETE(req: NextRequest) {
    const { id, userId } = await req.json();

    const role = await getUserRole(userId);


    if (!role) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if(!hasAccessToDeleteFeatureFlag(role)) {
        return NextResponse.json({ error: "Unauthorized action: only authorized users can delete flags" }, { status: 401 });
    }

    const deletedFlag = await db
        .update(featureFlagsTable)
        .set({
            deleted_at: new Date()
        })
        .where(eq(featureFlagsTable.id, id))
        .returning();

    await logFeatureFlagDeleted(id, userId);

    return NextResponse.json(deletedFlag[0]);
}

// POST request to check if a feature flag is enabled by its name
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const flagName = decodeURIComponent(id).trim();
    const apiKey = req.headers.get("x-api-key");

    if (apiKey !== process.env.FEATURE_FLAG_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const featureFlag = await db
        .select()
        .from(featureFlagsTable)
        .where(and(eq(featureFlagsTable.name, flagName), isNull(featureFlagsTable.deleted_at)));

    if (featureFlag.length === 0) {
        return NextResponse.json({ enabled: false });
    }

    const isEnabled = !!featureFlag[0].is_active;
    return NextResponse.json({ enabled: isEnabled });
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
    const oldFlag = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.id, body.id),
        with: {
            whitelist: true,
        },
    });

    const parseDate = (v: string | null | undefined) => (v ? new Date(v) : undefined);


    const updateData = Object.fromEntries(
        Object.entries({
            name: updates.name,
            is_active: updates.is_active,
            description: updates.description,
            strategy: updates.strategy,
            whitelist_id: updates.whitelist_id,
            start_time: parseDate(updates.start_time),
            end_time: parseDate(updates.end_time),
            updated_at: new Date(),
        }).filter(([_, value]) => value !== undefined)
    );

    if (updates.strategy && updates.strategy !== 'CANARY') {
        updateData.whitelist_id = null;
    }

    await db
        .update(featureFlagsTable)
        .set(updateData)
        .where(eq(featureFlagsTable.id, id));

    //kun til at hente opdateret whitelist
    const newFlag = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.id, body.id),
        with: {
            whitelist: true,
        },
    })

    await logFeatureFlagUpdated(
        id,
        user_id,
        oldFlag as FeatureFlagDto,
        newFlag as FeatureFlagDto
    );


    return NextResponse.json(newFlag);
}



