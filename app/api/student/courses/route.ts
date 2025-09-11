
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { enrollCourseTable } from '@/config/schema';
import { coursesTable } from '@/config/schema';
import { eq } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = verifyAccessToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        estimatedTime: coursesTable.estimatedDuration,
        lastAccessed: enrollCourseTable.updatedAt,
        image: coursesTable.bannerImage,
      })
      .from(enrollCourseTable)
      .innerJoin(coursesTable, eq(enrollCourseTable.courseId, coursesTable.id))
      .where(eq(enrollCourseTable.userId, user.id));

    return NextResponse.json(enrolledCourses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
