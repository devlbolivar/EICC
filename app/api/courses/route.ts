import { NextRequest, NextResponse } from "next/server";
import db from "@/config/db";
import { courses } from "@/config/schema";
import { verifyAccessTokenEdge } from "@/lib/auth";
import { Module, Lesson, Permission } from "@/app/types";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Iniciando creación de curso...");

    // Verificar autenticación
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const payload = await verifyAccessTokenEdge(token);
    if (!payload) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Verificar permisos de administrador
    const requiredPermissions: Permission[] = [
      "platform:admin",
      "courses:create",
    ];
    const hasAdminPermission = payload.permissions.some(
      (permission: Permission) => requiredPermissions.includes(permission)
    );

    if (!hasAdminPermission) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.FORBIDDEN },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("📝 Datos recibidos:", body);

    const {
      name,
      description,
      category,
      level,
      status,
      estimatedDuration,
      bannerImage,
      visibility,
      targetCompanies,
      modules,
    } = body;

    // Validaciones básicas
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.VALIDATION_ERROR },
        { status: 400 }
      );
    }

    // Validar que haya al menos un módulo con una lección válida
    const hasValidModules = modules?.some((module: Module) =>
      module.lessons?.some(
        (lesson: Lesson) => lesson.title && (lesson.text || lesson.video)
      )
    );

    if (!hasValidModules) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.VALIDATION_ERROR,
        },
        { status: 400 }
      );
    }

    // Generar CID único
    const cid = `course_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("📊 Guardando en base de datos...");

    // Insertar el curso en la base de datos
    const newCourse = await db
      .insert(courses)
      .values({
        cid,
        name,
        description,
        category,
        level: level || "Básico",
        status: status || "Borrador",
        estimatedDuration,
        bannerImage: bannerImage || "",
        visibility: visibility || "Público",
        targetCompanies: targetCompanies || [],
        modules: modules || [],
        createdBy: payload.userId,
        companyId: payload.companyId || null,
        userEmail: payload.email,
        isPublic: visibility === "Público",
        isActive: true,
        // Campos legacy para compatibilidad
        numberOfChapters: modules?.length || 0,
        includeVideos:
          modules?.some((module: Module) =>
            module.lessons?.some((lesson: Lesson) => lesson.video)
          ) || false,
        difficulty: level || "Básico",
        courseJson: {},
        courseContent: {},
      })
      .returning();

    console.log("✅ Curso guardado exitosamente en BD:", newCourse[0]);

    return NextResponse.json(
      {
        success: true,
        course: newCourse[0],
        message:
          status === "Publicado"
            ? "Curso publicado exitosamente"
            : "Curso guardado como borrador",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error al crear curso:", error);
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

export async function GET() {
  try {
    console.log("📋 Obteniendo cursos de la base de datos...");

    // Obtener todos los cursos de la base de datos
    const allCourses = await db.select().from(courses);

    console.log("✅ Cursos obtenidos de BD:", allCourses.length);

    return NextResponse.json({ courses: allCourses });
  } catch (error) {
    console.error("❌ Error al obtener cursos:", error);
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
