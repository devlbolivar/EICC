import db from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { courseId } = await req.json();
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!user?.primaryEmailAddress?.emailAddress) {
    return new Response("No email address found", { status: 400 });
  }

  const enrollCourses = await db
    .select()
    .from(enrollCourseTable)
    .where(
      and(
        eq(enrollCourseTable.userEmail, user.primaryEmailAddress.emailAddress),
        eq(enrollCourseTable.cid, courseId)
      )
    );

  if (enrollCourses.length > 0) {
    return NextResponse.json({
      message: "Ya estás inscrito en este curso",
    });
  }

  const result = await db
    .insert(enrollCourseTable)
    .values({
      cid: courseId,
      userEmail: user.primaryEmailAddress.emailAddress,
    })
    .returning({
      id: enrollCourseTable.id,
      cid: enrollCourseTable.cid,
      userEmail: enrollCourseTable.userEmail,
    });

  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const user = await currentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json(
      { message: "No email address found" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (courseId) {
    const result = await db
      .select()
      .from(coursesTable)
      .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
      .where(
        and(
          eq(
            enrollCourseTable.userEmail,
            user.primaryEmailAddress.emailAddress
          ),
          eq(enrollCourseTable.cid, courseId)
        )
      );
    return NextResponse.json(result[0]);
  } else {
    const result = await db
      .select()
      .from(coursesTable)
      .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
      .where(
        eq(enrollCourseTable.userEmail, user.primaryEmailAddress.emailAddress)
      )
      .orderBy(desc(enrollCourseTable.id));
    return NextResponse.json(result);
  }
}
