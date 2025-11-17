import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const enrollmentId = params.id;

    // ===== OBTENER DATOS DEL BODY =====
    const body = await request.json();
    const { progress, isCompleted, completedChapters, companyId } = body;

    // ===== VERIFICAR QUE EL ENROLLMENT EXISTE =====
    const existingEnrollment = await db
      .select()
      .from(schema.enrollCourseTable)
      .where(eq(schema.enrollCourseTable.id, enrollmentId))
      .limit(1);

    if (existingEnrollment.length === 0) {
      return NextResponse.json(
        { error: "Enrollment no encontrado" },
        { status: 404 }
      );
    }

    // ===== PREPARAR DATOS A ACTUALIZAR =====
    const updateData: Partial<typeof schema.enrollCourseTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (progress !== undefined) {
      updateData.progress = progress;
    }

    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      // Si se marca como completado, actualizar fecha
      if (isCompleted && !existingEnrollment[0].isCompleted) {
        updateData.completedAt = new Date();
      }
    }

    if (completedChapters !== undefined) {
      updateData.completedChapters = completedChapters;
    }

    if (companyId !== undefined) {
      updateData.companyId = companyId;
    }

    // ===== ACTUALIZAR ENROLLMENT =====
    const updatedEnrollment = await db
      .update(schema.enrollCourseTable)
      .set(updateData)
      .where(eq(schema.enrollCourseTable.id, enrollmentId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedEnrollment[0],
    });
  } catch (error) {
    console.error("Error actualizando enrollment:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SERVER_ERROR,
        details:
          error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const enrollmentId = params.id;

    // ===== VERIFICAR QUE EL ENROLLMENT EXISTE =====
    const existingEnrollment = await db
      .select()
      .from(schema.enrollCourseTable)
      .where(eq(schema.enrollCourseTable.id, enrollmentId))
      .limit(1);

    if (existingEnrollment.length === 0) {
      return NextResponse.json(
        { error: "Enrollment no encontrado" },
        { status: 404 }
      );
    }

    // ===== ELIMINAR ENROLLMENT =====
    // Nota: Esto eliminará también los certificados relacionados debido al cascade
    await db
      .delete(schema.enrollCourseTable)
      .where(eq(schema.enrollCourseTable.id, enrollmentId));

    return NextResponse.json({
      success: true,
      message: "Enrollment eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando enrollment:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SERVER_ERROR,
        details:
          error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
      },
      { status: 500 }
    );
  }
}
