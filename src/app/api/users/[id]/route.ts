import {type NextRequest, NextResponse} from "next/server";
import {usersTable} from "@/db/schema";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {drizzle} from "drizzle-orm/node-postgres";
import {UserSchema} from "@/lib/schemas/user.schema";
import {parse} from "valibot";

const db = drizzle(process.env.DATABASE_URL!);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userId = Number(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userId));

        if (user.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const validated = parse(UserSchema, user[0]);

        return NextResponse.json(validated);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}