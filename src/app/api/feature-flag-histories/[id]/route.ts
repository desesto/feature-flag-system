import {type NextRequest, NextResponse} from "next/server";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {drizzle} from "drizzle-orm/node-postgres";
import {desc} from "drizzle-orm";
import {GetFeatureFlagHistoriesSchema} from "@/lib/schemas/featureFlagHistory.schema";
import {parse} from "valibot";
import * as schema from "@/db/schema";
import {Pool} from "pg";


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export async function GET(req: NextRequest, { params }: { params: Promise<{id: number}>}) {

    try{
        const { id } =  await params;

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid feature flag ID" }, { status: 400 });
        }
        const histories = await db.query.featureFlagHistoryTable.findMany({
            where: eq(schema.featureFlagHistoryTable.featureFlagId, id),
            with: {
                user: true
            },
            orderBy: [desc(schema.featureFlagHistoryTable.timestamp)]
        });


        const validated = parse(GetFeatureFlagHistoriesSchema, histories);

        return NextResponse.json(validated);
    } catch (error) {
        console.error("Error fetching feature flag histories:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

