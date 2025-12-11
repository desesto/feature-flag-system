import { eq } from "drizzle-orm";
import {EditFeatureFlagSchema, FeatureFlagSchema} from "@/lib/schemas/featureFlag.schema";
import {parse} from "valibot";
import {featureFlagsTable} from "@/db/schema"
import {type NextRequest, NextResponse} from "next/server";
import {logFeatureFlagDeleted, logFeatureFlagUpdated} from "@/lib/helpers/featureFlagHistory";
import { db } from "@/db";
import {getUserRole} from "@/lib/helpers/user";
import {hasAccessToDeleteFeatureFlag, hasAccessToEditFeatureFlag} from "@/access-control/featureFlagAccess";
import type {FeatureFlagDto} from "@/lib/dto/featureFlag.dto";
import {parseApiDates} from "@/lib/utils/dateConversion";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const featureFlagId = Number(id);

    if (isNaN(featureFlagId)) {
        return NextResponse.json({ error: "Invalid feature flag ID" }, { status: 400 });
    }

    const featureFlag = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.id, featureFlagId),
        with: {
            whiteList: true,
        },
    });

    if (!featureFlag) {
        return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }


    const validated = parse(FeatureFlagSchema, featureFlag);

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

export async function PATCH(req: NextRequest) {
    const raw = await req.json();
    const body = parseApiDates(raw);
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

    const oldFlag = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.id, body.id),
        with: {
            whiteList: true,
        },
    });

    const updateData = Object.fromEntries(
        Object.entries({
            name: updates.name,
            is_active: updates.is_active,
            description: updates.description,
            strategy: updates.strategy,
            white_list_id: updates.white_list_id,
            start_time: updates.start_time,
            end_time: updates.end_time,
            updated_at: new Date(),
        }).filter(([_, value]) => value !== undefined)
    );

    if (updates.strategy && updates.strategy !== 'CANARY') {
        updateData.white_list_id = null;
    }

    await db
        .update(featureFlagsTable)
        .set(updateData)
        .where(eq(featureFlagsTable.id, id));

    const newFlag = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.id, body.id),
        with: {
            whiteList: true,
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
