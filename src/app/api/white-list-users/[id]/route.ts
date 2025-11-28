import { db } from "@/db";
import { whiteListUsersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const whitelistId = Number(id);

        if (isNaN(whitelistId)) {
            return NextResponse.json({ error: "Invalid whitelist ID" }, { status: 400 });
        }

        const whitelistUsers = await db.query.whiteListUsersTable.findMany({
            where: eq(whiteListUsersTable.whitelist_id, whitelistId),
            with: { user: true },
        });

        if (!whitelistUsers || whitelistUsers.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const users = whitelistUsers.map((w) => w.user);

        return NextResponse.json(users);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
