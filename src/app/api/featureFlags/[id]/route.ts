import {NextRequest, NextResponse} from "next/server";
import * as schema from "@/db/schema";
import {featureFlagsTable} from "@/db/schema"
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {drizzle} from "drizzle-orm/node-postgres";

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

    return NextResponse.json(featureFlag[0]);
  }



export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    const deletedFlag = await db
        .update(featureFlagsTable)
        .set({
            deleted_at: new Date()
        })
        .where(eq(featureFlagsTable.id, id))
        .returning();

    return NextResponse.json(deletedFlag[0]);
}