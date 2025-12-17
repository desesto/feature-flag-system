import {type NextRequest, NextResponse} from "next/server";
import {checkFeatureFlagAccess} from "@/lib/helpers/featureFlagChecker";
import {featureFlagsTable} from "@/db/schema";
import {db} from "@/db";
import {and} from "drizzle-orm";
import {eq, isNull} from "drizzle-orm/sql/expressions/conditions";

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key");

    if (apiKey !== process.env.FEATURE_FLAG_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { featureFlagName, userEmail } = body;

    if (!featureFlagName) {
        return NextResponse.json({
            error: "Missing featureFlagName"
        }, { status: 400 });
    }
    const featureFlag = await db
        .select()
        .from(featureFlagsTable)
        .where(and(eq(featureFlagsTable.name, featureFlagName), isNull(featureFlagsTable.deletedAt)));

    if (featureFlag.length === 0) {
        return NextResponse.json({ enabled: false });
    }
    const isEnabled = await checkFeatureFlagAccess(featureFlagName, userEmail);

    return NextResponse.json({ enabled: isEnabled });
}