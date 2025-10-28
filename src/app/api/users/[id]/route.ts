import {NextRequest, NextResponse} from "next/server";
import {usersTable} from "@/db/schema";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {drizzle} from "drizzle-orm/node-postgres";

const db = drizzle(process.env.DATABASE_URL!);

export async function GET(req: NextRequest, { params }: { params: { id: string } }
) {
    const userId = Number(params.id);

    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (user.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
}