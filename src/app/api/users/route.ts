import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import {auditLogsTable, usersTable} from "@/db/schema";
import {CreateUserSchema, GetUsersSchema} from "@/lib/schemas/user.schema";
import {parse} from "valibot";


const db = drizzle(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
    try {
        const users = await db.select().from(usersTable);

        const validatedUsers = parse(GetUsersSchema, users);

        return NextResponse.json(validatedUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validatedData = parse(CreateUserSchema, body);

        const newUser = await db
            .insert(usersTable)
            .values(validatedData)
            .returning();

        await db
            .insert(auditLogsTable)
            .values({
                user_id: newUser[0].id,
                action: "CREATE",
                entity: "user",
                entity_id: newUser[0].id,
                entity_name: newUser[0].email,
                new_value: newUser[0],
            })
            .returning();

        return NextResponse.json(newUser[0]);
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
