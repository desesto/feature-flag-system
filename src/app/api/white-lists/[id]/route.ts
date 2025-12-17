import {db} from "@/db";
import {NextRequest, NextResponse} from "next/server";
import {whiteListsTable, whiteListUsersTable} from "@/db/schema";
import {eq} from "drizzle-orm";
import {GetWhiteListWithUsersSchema, UpdateWhiteListSchema} from "@/lib/schemas/whiteList.schema";
import {parse} from "valibot";

export async function GET(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const whitelistId = Number(id);

        if (isNaN(whitelistId)) {
            return NextResponse.json({error: "Invalid whiteList ID"}, {status: 400});
        }

        const whitelist = await db.query.whiteListsTable.findFirst({
            where: eq(whiteListsTable.id, whitelistId),
            with: {
                whiteListUsers: {
                    with: {
                        user: true,
                    },
                },
            },
        });

        if (!whitelist) {
            return NextResponse.json({error: "WhiteList not found"}, {status: 404});
        }

        const response = {
            id: whitelist.id,
            name: whitelist.name,
            users: whitelist.whiteListUsers.map((whiteListUsers) => whiteListUsers.user),
        };

        const validated = parse(GetWhiteListWithUsersSchema, response);

        return NextResponse.json(validated);
    } catch (error) {
        console.error("Error fetching whiteList:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function PATCH(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const whitelistId = Number(id);

        if (isNaN(whitelistId)) {
            return NextResponse.json({error: "Invalid whiteList ID"}, {status: 400});
        }

        const body = await req.json();
        const validatedData = parse(UpdateWhiteListSchema, body);

        await db
            .delete(whiteListUsersTable)
            .where(eq(whiteListUsersTable.whiteListId, whitelistId));

        if (validatedData.userIds.length > 0) {
            await db.insert(whiteListUsersTable).values(
                validatedData.userIds.map((userId) => ({
                    whiteListId: whitelistId,
                    userId: userId,
                }))
            );
        }

        return NextResponse.json({message: "Whitelist updated successfully"});
    } catch (error) {
        console.error("Error updating whiteList:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const whitelistId = Number(id);

        if (isNaN(whitelistId)) {
            return NextResponse.json({ error: "Invalid whiteList ID" }, { status: 400 });
        }

        const whitelist = await db.query.whiteListsTable.findFirst({
            where: eq(whiteListsTable.id, whitelistId),
        });

        if (!whitelist) {
            return NextResponse.json({ error: "WhiteList not found" }, { status: 404 });
        }

        await db
            .delete(whiteListsTable)
            .where(eq(whiteListsTable.id, whitelistId));

        return NextResponse.json({ message: "WhiteList deleted successfully" });
    } catch (error) {
        console.error("Error deleting whiteList:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
