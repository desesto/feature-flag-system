import { NextRequest, NextResponse } from "next/server";
import {featureFlagsTable} from "@/db/schema";
import {asc} from "drizzle-orm";
import {eq, isNull} from "drizzle-orm/sql/expressions/conditions";
import {parse} from "valibot";
import {CreateFeatureFlagSchema, GetFeatureFlagsSchema} from "@/lib/schemas/featureFlag.schema";
import {logFeatureFlagCreated} from "@/lib/helpers/featureFlagHistory";
import {getUserRole} from "@/lib/helpers/user";
import {
    hasAccessToCreateFeatureFlag,
} from "@/access-control/featureFlagAccess";
import { db } from "@/db";
    
export async function GET() {
    const flags = await db.query.featureFlagsTable.findMany({
        where: (flag) => isNull(flag.deleted_at),
        with: { user: true },
        orderBy: [asc(featureFlagsTable.name)],
    });

    const validated = parse(GetFeatureFlagsSchema, flags);

    return NextResponse.json(validated);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const role = await getUserRole(body.user_id);

    if (!role) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
            whitelist_id: validatedData.whitelist_id,
            start_time: validatedData.start_time,
            end_time: validatedData.end_time,
        })
        .returning();

    await logFeatureFlagCreated(newFlag[0].id, newFlag[0].user_id);

    return NextResponse.json(newFlag[0]);
}





