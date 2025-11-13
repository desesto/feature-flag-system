import { and, eq, isNull } from "drizzle-orm";
import {drizzle} from "drizzle-orm/node-postgres";
import {FeatureFlagSchema} from "@/lib/schemas/featureFlag.schema";
import {parse} from "valibot";
import {featureFlagsTable} from "@/db/schema"
import {type NextRequest, NextResponse} from "next/server";
import {logFeatureFlagDeleted} from "@/lib/helpers/featureFlagHistory";

const db = drizzle(process.env.DATABASE_URL!);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const featureFlagId = Number(id);

    if (isNaN(featureFlagId)) {
        return NextResponse.json({ error: "Invalid feature flag ID" }, { status: 400 });
    }

    const featureFlag = await db.select().from(featureFlagsTable).where(eq(featureFlagsTable.id, featureFlagId));
    console.log('Fetched feature flag:', featureFlag);

    if (featureFlag.length === 0) {
        return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    const serializedFlag = {
        ...featureFlag[0],
        start_time: featureFlag[0].start_time?.toISOString() ?? null,
        end_time: featureFlag[0].end_time?.toISOString() ?? null,
        created_at: featureFlag[0].created_at?.toISOString() ?? null,
        updated_at: featureFlag[0].updated_at?.toISOString() ?? null,
        deleted_at: featureFlag[0].deleted_at?.toISOString() ?? null,
    };


    const validated = parse(FeatureFlagSchema, serializedFlag);

    return NextResponse.json(validated);
  }



export async function DELETE(req: NextRequest) {
    const { id, user_id } = await req.json();

    const deletedFlag = await db
        .update(featureFlagsTable)
        .set({
            deleted_at: new Date()
        })
        .where(eq(featureFlagsTable.id, id))
        .returning();

    await logFeatureFlagDeleted(id, user_id);

    return NextResponse.json(deletedFlag[0]);
}

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
