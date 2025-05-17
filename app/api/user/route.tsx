import { eq } from "drizzle-orm";
import db from "@/config/db";
import { usersTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { name, email } = await request.json();

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (users.length === 0) {
    const result = await db
      .insert(usersTable)
      .values({ name, email })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      });

    console.log(result);
    return NextResponse.json(result);
  }

  return NextResponse.json(users[0]);
}
