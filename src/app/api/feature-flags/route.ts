import {type NextRequest, NextResponse} from "next/server";
import {featureFlagsTable} from "@/db/schema";
import {asc} from "drizzle-orm";
import {isNull} from "drizzle-orm/sql/expressions/conditions";
import {parse} from "valibot";
import {CreateFeatureFlagSchema, GetFeatureFlagsSchema} from "@/lib/schemas/featureFlag.schema";
import {logFeatureFlagCreated} from "@/lib/helpers/featureFlagHistory";
import {getUserRole} from "@/lib/helpers/user";
import {
    hasAccessToCreateFeatureFlag,
} from "@/access-control/featureFlagAccess";
import {db} from "@/db";
import {parseApiDates} from "@/lib/utils/dateConversion";

export async function GET() {
    const flags = await db.query.featureFlagsTable.findMany({
        where: (flag) => isNull(flag.deleted_at),
        with: {user: true},
        orderBy: [asc(featureFlagsTable.name)],
    });

    const validated = parse(GetFeatureFlagsSchema, flags);

    return NextResponse.json(validated);
}

export async function POST(req: NextRequest) {
    const raw = await req.json();
    const role = await getUserRole(raw.user_id);
    const body = parseApiDates(raw);

    if (!role) {
        return NextResponse.json({error: "User not found"}, {status: 404});
    }

    if (!hasAccessToCreateFeatureFlag(role)) {
        return NextResponse.json({error: "Unauthorized action"}, {status: 401});
    }

    const validated = parse(CreateFeatureFlagSchema, body);

    try {
        const newFlag = await db
            .insert(featureFlagsTable)
            .values(validated)
            .returning();

        await logFeatureFlagCreated(newFlag[0].id, newFlag[0].user_id);

        return NextResponse.json(newFlag[0]);
    } catch (dbError: any) {
        if (dbError.code === "23505") {
            return NextResponse.json(
                {error: "Feature flag name already exists"},
                {status: 400}
            );
        }
        throw dbError;
    }
}



