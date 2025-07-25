import db from "@/config/db";
import { coursesTable, enrollCourseTable, usersTable } from "@/config/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { courseId } = await req.json();

    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Obtener usuario de la base de datos
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, payload.userId),
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 401 }
      );
    }

    const enrollCourses = await db
      .select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(enrollCourseTable.userEmail, user.email),
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
        userId: user.id,
        courseId: courseId,
        cid: courseId,
        userEmail: user.email,
        enrolledAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: enrollCourseTable.id,
        cid: enrollCourseTable.cid,
        userEmail: enrollCourseTable.userEmail,
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Obtener usuario de la base de datos
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, payload.userId),
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (courseId) {
      const result = await db
        .select()
        .from(coursesTable)
        .innerJoin(
          enrollCourseTable,
          eq(coursesTable.cid, enrollCourseTable.cid)
        )
        .where(
          and(
            eq(enrollCourseTable.userEmail, user.email),
            eq(enrollCourseTable.cid, courseId)
          )
        );
      return NextResponse.json(result[0]);
    } else {
      const result = await db
        .select()
        .from(coursesTable)
        .innerJoin(
          enrollCourseTable,
          eq(coursesTable.cid, enrollCourseTable.cid)
        )
        .where(eq(enrollCourseTable.userEmail, user.email))
        .orderBy(desc(enrollCourseTable.id));
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error getting enrolled courses:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { courseId, completedChapter } = await req.json();

    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Obtener usuario de la base de datos
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, payload.userId),
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 401 }
      );
    }

    const result = await db
      .update(enrollCourseTable)
      .set({
        completedChapters: completedChapter,
      })
      .where(
        and(
          eq(enrollCourseTable.userEmail, user.email),
          eq(enrollCourseTable.cid, courseId)
        )
      )
      .returning({
        id: enrollCourseTable.id,
        cid: enrollCourseTable.cid,
        userEmail: enrollCourseTable.userEmail,
        completedChapters: enrollCourseTable.completedChapters,
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating course progress:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
