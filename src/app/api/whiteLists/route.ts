import {db} from "@/db";
import {whiteListsTable, whiteListUsersTable} from "@/db/schema";
import {CreateWhiteListSchema, GetWhiteListsSchema} from "@/lib/schemas/whiteList.schema";
import {parse} from "valibot";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest){

    try {
        const whiteLists = await db.select().from(whiteListsTable);

        const validatedWhiteLists = parse(GetWhiteListsSchema, whiteLists);

        return NextResponse.json(validatedWhiteLists);
    }
    catch (error) {
        console.error("Error fetching white lists:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });

    }
}


export async function POST(req: NextRequest){
    try {
        const body = await req.json();

        const validatedData = parse(CreateWhiteListSchema, body);

        const [newWhiteList] = await db
            .insert(whiteListsTable)
            .values(validatedData)
            .returning();

        if(validatedData.user_ids && validatedData.user_ids.length > 0){
            await db.insert(whiteListUsersTable).values(
                validatedData.user_ids.map((userId) => ({
                    whitelist_id: newWhiteList.id,
                    user_id: userId,
                }))
            )
        }

        return NextResponse.json(newWhiteList);
    } catch (error) {
        console.error("Error creating white list:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}