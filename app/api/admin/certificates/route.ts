import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq, desc } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // ===== OBTENER CERTIFICADOS DE LA BASE DE DATOS =====
    const certificates = await db
      .select({
        id: schema.certificatesTable.id,
        certificateId: schema.certificatesTable.certificateId,
        courseId: schema.certificatesTable.courseId,
        userId: schema.certificatesTable.userId,
        companyId: schema.certificatesTable.companyId,
        title: schema.certificatesTable.title,
        description: schema.certificatesTable.description,
        grade: schema.certificatesTable.grade,
        issuedDate: schema.certificatesTable.issuedDate,
        completedDate: schema.certificatesTable.completedDate,
        duration: schema.certificatesTable.duration,
        certificateUrl: schema.certificatesTable.certificateUrl,
        isActive: schema.certificatesTable.isActive,
        // Datos del usuario
        userName: schema.usersTable.name,
        userEmail: schema.usersTable.email,
        // Datos del curso
        courseName: schema.coursesTable.name,
        // Datos de la empresa
        companyName: schema.companiesTable.name,
      })
      .from(schema.certificatesTable)
      .leftJoin(
        schema.usersTable,
        eq(schema.certificatesTable.userId, schema.usersTable.id)
      )
      .leftJoin(
        schema.coursesTable,
        eq(schema.certificatesTable.courseId, schema.coursesTable.id)
      )
      .leftJoin(
        schema.companiesTable,
        eq(schema.certificatesTable.companyId, schema.companiesTable.id)
      )
      .orderBy(desc(schema.certificatesTable.issuedDate));

    return NextResponse.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Error obteniendo certificados:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}
