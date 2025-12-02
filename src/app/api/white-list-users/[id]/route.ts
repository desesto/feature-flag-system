import { db } from "@/db";
import { whiteListUsersTable } from "@/db/schema";
import {and, eq} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";

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


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const whitelistId = Number(id);

        if (isNaN(whitelistId)) {
            return NextResponse.json({ error: "Invalid whitelist ID" }, { status: 400 });
        }

        const body = await req.json();
        const { userId } = body;

        if (!userId || isNaN(Number(userId))) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        await db.insert(whiteListUsersTable).values({
            whitelist_id: whitelistId,
            user_id: Number(userId),
        });

        return NextResponse.json({ message: "User added successfully" });
    } catch (error) {
        console.error("Error adding user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const whitelistId = Number(id);

        if (isNaN(whitelistId)) {
            return NextResponse.json({error: "Invalid whitelist ID"}, {status: 400});
        }

        const body = await req.json();
        const {userId} = body;

        if (!userId || isNaN(Number(userId))) {
            return NextResponse.json({error: "Invalid user ID"}, {status: 400});
        }

        const result = await db
            .delete(whiteListUsersTable)
            .where(
                and(
                    eq(whiteListUsersTable.whitelist_id, whitelistId),
                    eq(whiteListUsersTable.user_id, Number(userId))
                )
            );

        return NextResponse.json({message: "User removed from whitelist successfully"});
    } catch (error) {
        console.error("Error deleting user from whitelist:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}