import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "@/db/schema";
import {CreateUserSchema, GetUsersSchema} from "@/lib/schemas/user.schema";
import {parse} from "valibot";


const db = drizzle(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
    const users = await db.select().from(usersTable);

    const validatedUsers = parse(GetUsersSchema, users);

    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const body= await req.json();

    const validatedData = parse(CreateUserSchema, body);

    const newUser = await db.insert(usersTable).values(validatedData).returning();
    return NextResponse.json(newUser[0]);
}
