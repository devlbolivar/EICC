import db from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq, desc, ne, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await currentUser();

  if (!user || !user.primaryEmailAddress) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (courseId === "0") {
    const result = await db
      .select()
      .from(coursesTable)
      .where(sql`${coursesTable.courseContent}::jsonb != '{}'::jsonb`);

    return NextResponse.json(result);
  }

  if (courseId) {
    const result = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json(result[0]);
  } else {
    const result = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userEmail, user.primaryEmailAddress.emailAddress))
      .orderBy(desc(coursesTable.createdAt));

    return NextResponse.json(result);
  }
}
