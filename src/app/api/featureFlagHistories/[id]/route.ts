import {type NextRequest, NextResponse} from "next/server";
import {featureFlagHistoryTable, usersTable} from "@/db/schema";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {drizzle} from "drizzle-orm/node-postgres";
import {desc} from "drizzle-orm";
import {GetFeatureFlagHistoriesSchema} from "@/lib/schemas/featureFlagHistory.schema";
import {parse} from "valibot";
import {Pool} from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export async function GET(req: NextRequest, { params }: { params: Promise<{id: number}>}) {

    try{
        const { id } =  await params;

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid feature flag ID" }, { status: 400 });
        }
        const histories = await db
            .select({
                id: featureFlagHistoryTable.id,
                feature_flag_id: featureFlagHistoryTable.feature_flag_id,
                user_id: featureFlagHistoryTable.user_id,
                user_name: usersTable.name,
                timestamp: featureFlagHistoryTable.timestamp,
                action_type: featureFlagHistoryTable.action_type,
                changed_fields: featureFlagHistoryTable.changed_fields,
                old_values: featureFlagHistoryTable.old_values,
                new_values: featureFlagHistoryTable.new_values,
            })
            .from(featureFlagHistoryTable)
            .leftJoin(usersTable, eq(featureFlagHistoryTable.user_id, usersTable.id))
            .where(eq(featureFlagHistoryTable.feature_flag_id, id))
            .orderBy(desc(featureFlagHistoryTable.timestamp));

        const serializedHistories = histories.map(history => ({
            ...history,
            timestamp: history.timestamp.toISOString(),
        }));

        const validated = parse(GetFeatureFlagHistoriesSchema, serializedHistories);

        return NextResponse.json(validated);
    } catch (error) {
        console.error("Error fetching feature flag histories:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

