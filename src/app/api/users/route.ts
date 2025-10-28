import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "@/db/schema";

const db = drizzle(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
    const users = await db.select().from(usersTable);
    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const { name, email } = await req.json();
    const newUser = await db.insert(usersTable).values({ name, email }).returning();
    return NextResponse.json(newUser[0]);
}
