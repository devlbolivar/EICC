import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { enrollCourseTable } from "@/config/schema";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  // Get user ID from headers set by middleware
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const enrolledCourses = await db
      .select({
        id: coursesTable.id,
        title: coursesTable.name,
        description: coursesTable.description,
        progress: enrollCourseTable.progress,
        totalChapters: coursesTable.numberOfChapters,
        completedChapters: enrollCourseTable.completedChapters,
        isCompleted: enrollCourseTable.isCompleted,
        completedAt: enrollCourseTable.completedAt,
        estimatedTime: coursesTable.estimatedDuration,
        lastAccessed: enrollCourseTable.updatedAt,
        image: coursesTable.bannerImage,
        category: coursesTable.category,
        level: coursesTable.level,
      })
      .from(enrollCourseTable)
      .innerJoin(coursesTable, eq(enrollCourseTable.courseId, coursesTable.id))
      .where(eq(enrollCourseTable.userId, userId));

    return NextResponse.json({
      success: true,
      data: enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
