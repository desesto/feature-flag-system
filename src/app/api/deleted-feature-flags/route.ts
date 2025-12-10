import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import * as schema from "@/db/schema";

const db = drizzle(process.env.DATABASE_URL!, { schema });

export async function GET() {
    const flags = await db.query.featureFlagsTable.findMany({
        where: (featureFlags, { isNotNull }) => isNotNull(featureFlags.deleted_at),
        with: {
            user: true,
        },
    });

    return NextResponse.json(flags);
}