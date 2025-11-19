import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq, desc, and } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // ===== OBTENER ENROLLMENTS DE LA BASE DE DATOS =====
    const enrollments = await db
      .select({
        id: schema.enrollCourseTable.id,
        courseId: schema.enrollCourseTable.courseId,
        userId: schema.enrollCourseTable.userId,
        companyId: schema.enrollCourseTable.companyId,
        progress: schema.enrollCourseTable.progress,
        isCompleted: schema.enrollCourseTable.isCompleted,
        completedAt: schema.enrollCourseTable.completedAt,
        enrolledAt: schema.enrollCourseTable.enrolledAt,
        // Datos del usuario
        userName: schema.usersTable.name,
        userEmail: schema.usersTable.email,
        // Datos del curso
        courseName: schema.coursesTable.name,
        // Datos de la empresa
        companyName: schema.companiesTable.name,
      })
      .from(schema.enrollCourseTable)
      .leftJoin(
        schema.usersTable,
        eq(schema.enrollCourseTable.userId, schema.usersTable.id)
      )
      .leftJoin(
        schema.coursesTable,
        eq(schema.enrollCourseTable.courseId, schema.coursesTable.id)
      )
      .leftJoin(
        schema.companiesTable,
        eq(schema.enrollCourseTable.companyId, schema.companiesTable.id)
      )
      .orderBy(desc(schema.enrollCourseTable.enrolledAt));

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error obteniendo enrollments:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // ===== OBTENER DATOS DEL BODY =====
    const body = await request.json();
    const { userId, courseId, companyId } = body;

    // ===== VALIDAR CAMPOS REQUERIDOS =====
    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "userId y courseId son requeridos" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE EL USUARIO EXISTE =====
    const user = await db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR QUE EL CURSO EXISTE =====
    const course = await db
      .select()
      .from(schema.coursesTable)
      .where(eq(schema.coursesTable.id, courseId))
      .limit(1);

    if (course.length === 0) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR SI YA EXISTE EL ENROLLMENT =====
    const existingEnrollment = await db
      .select()
      .from(schema.enrollCourseTable)
      .where(
        and(
          eq(schema.enrollCourseTable.userId, userId),
          eq(schema.enrollCourseTable.courseId, courseId)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return NextResponse.json(
        { error: "El usuario ya está inscrito en este curso" },
        { status: 409 }
      );
    }

    // ===== CREAR ENROLLMENT =====
    const newEnrollment = await db
      .insert(schema.enrollCourseTable)
      .values({
        userId,
        courseId,
        companyId: companyId || null,
        progress: 0,
        isCompleted: false,
        completedChapters: {},
        userEmail: user[0].email,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newEnrollment[0],
    });
  } catch (error) {
    console.error("Error creando enrollment:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}
