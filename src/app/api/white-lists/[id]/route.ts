import {db} from "@/db";
import {NextRequest, NextResponse} from "next/server";
import {whiteListsTable, whiteListUsersTable} from "@/db/schema";
import {and, eq} from "drizzle-orm";
import {GetWhiteListWithUsersSchema, UpdateWhiteListSchema} from "@/lib/schemas/whiteList.schema";
import {parse} from "valibot";

export async function GET(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const whitelistId = Number(id);

        if (isNaN(whitelistId)) {
            return NextResponse.json({error: "Invalid whitelist ID"}, {status: 400});
        }

        const whitelist = await db.query.whiteListsTable.findFirst({
            where: eq(whiteListsTable.id, whitelistId),
            with: {
                whitelistUsers: {
                    with: {
                        user: true,
                    },
                },
            },
        });

        if (!whitelist) {
            return NextResponse.json({error: "Whitelist not found"}, {status: 404});
        }

        const response = {
            id: whitelist.id,
            name: whitelist.name,
            users: whitelist.whitelistUsers.map((whiteListUsers) => whiteListUsers.user),
        };

        const validated = parse(GetWhiteListWithUsersSchema, response);

        return NextResponse.json(validated);
    } catch (error) {
        console.error("Error fetching whitelist:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function PATCH(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const whitelistId = Number(id);

        if (isNaN(whitelistId)) {
            return NextResponse.json({error: "Invalid whitelist ID"}, {status: 400});
        }

        const body = await req.json();
        const validatedData = parse(UpdateWhiteListSchema, body);

        await db
            .delete(whiteListUsersTable)
            .where(eq(whiteListUsersTable.whitelist_id, whitelistId));


        if (validatedData.user_ids.length > 0) {
            await db.insert(whiteListUsersTable).values(
                validatedData.user_ids.map((userId) => ({
                    whitelist_id: whitelistId,
                    user_id: userId,
                }))
            );
        }

        return NextResponse.json({message: "Whitelist updated successfully"});
    } catch (error) {
        console.error("Error updating whitelist:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
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
