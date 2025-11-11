import {type NextRequest, NextResponse} from "next/server";
import {featureFlagHistoryTable} from "@/db/schema";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {drizzle} from "drizzle-orm/node-postgres";
import {desc} from "drizzle-orm";
import {GetFeatureFlagHistoriesSchema} from "@/lib/schemas/featureFlagHistory.schema";
import {parse} from "valibot";

const db = drizzle(process.env.DATABASE_URL!);

export async function GET(req: NextRequest, { params }: { params: Promise<{id: string}>}) {

    try{
        const { id } =  await params;
        const featureFlagId = Number(id);

        if (isNaN(featureFlagId)) {
            return NextResponse.json({ error: "Invalid feature flag ID" }, { status: 400 });
        }
        const histories = await db
            .select()
            .from(featureFlagHistoryTable)
            .where(eq(featureFlagHistoryTable.feature_flag_id, featureFlagId))
            .orderBy(desc(featureFlagHistoryTable.timestamp));

        const validated = parse(GetFeatureFlagHistoriesSchema, histories);

        return NextResponse.json(validated);
    } catch (error) {
        console.error("Error fetching feature flag histories:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

