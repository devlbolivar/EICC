import { NextRequest, NextResponse } from "next/server";
import db from "@/config/db";
import { courses } from "@/config/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Iniciando creación de curso...");

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
        { error: "Nombre, descripción y categoría son requeridos" },
        { status: 400 }
      );
    }

    // Validar que haya al menos un módulo con una lección válida
    const hasValidModules = modules?.some((module: any) =>
      module.lessons?.some(
        (lesson: any) => lesson.title && (lesson.text || lesson.video)
      )
    );

    if (!hasValidModules) {
      return NextResponse.json(
        {
          error:
            "El curso debe tener al menos un módulo con una lección válida",
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
        createdBy: uuidv4(), // Generar UUID válido
        companyId: uuidv4(), // Generar UUID válido
        userEmail: "temp@example.com",
        isPublic: visibility === "Público",
        isActive: true,
        // Campos legacy para compatibilidad
        numberOfChapters: modules?.length || 0,
        includeVideos:
          modules?.some((module: any) =>
            module.lessons?.some((lesson: any) => lesson.video)
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
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
