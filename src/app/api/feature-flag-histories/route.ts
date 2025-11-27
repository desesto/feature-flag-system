import {drizzle} from "drizzle-orm/node-postgres";
import {NextRequest, NextResponse} from "next/server";
import {parse} from "valibot";
import {featureFlagHistoryTable} from "@/db/schema";
import {CreateFeatureFlagHistorySchema} from "@/lib/schemas/featureFlagHistory.schema";

const db = drizzle(process.env.DATABASE_URL!);

export async function POST(req: NextRequest)
{
    try {

    const body = await req.json();

    const validatedData = parse(CreateFeatureFlagHistorySchema, body);

    const newFeatureFlagHistory = await db
        .insert(featureFlagHistoryTable)
        .values(validatedData)
        .returning();

    return NextResponse.json(newFeatureFlagHistory[0]);
    } catch (error) {
    console.error("Error logging history", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
