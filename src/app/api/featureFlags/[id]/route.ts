import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {featureFlagsTable} from "@/db/schema";


const db = drizzle(process.env.DATABASE_URL!, { schema });


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