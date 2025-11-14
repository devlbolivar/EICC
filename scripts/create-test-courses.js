import { db } from "../config/db.js";
import { coursesTable } from "../config/schema.js";
import { v4 as uuidv4 } from "uuid";

async function createTestCourses() {
  try {
    console.log("Creating test courses...");

    // Create test courses
    const testCourses = [
      {
        id: uuidv4(),
        cid: `course_${Date.now()}_1`,
        name: "Seguridad Informática",
        description:
          "Aprende los fundamentos de la seguridad informática y protección de datos",
        numberOfChapters: 5,
        includeVideos: true,
        difficulty: "Intermedio",
        category: "Tecnología",
        level: "Intermedio",
        status: "Publicado",
        estimatedDuration: "8 horas",
        visibility: "Público",
        targetCompanies: [],
        modules: [
          {
            title: "Introducción a la Seguridad",
            description: "Conceptos básicos de seguridad informática",
            lessons: [
              {
                title: "¿Qué es la seguridad informática?",
                text: "La seguridad informática es la práctica de proteger sistemas, redes y programas de ataques digitales.",
                video: "https://www.youtube.com/watch?v=inWWhr5tnEA",
              },
            ],
          },
        ],
        bannerImage: "/online-education.png",
        createdBy: "00000000-0000-0000-0000-000000000001", // Mock user ID
        companyId: null,
        isPublic: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        cid: `course_${Date.now()}_2`,
        name: "Gestión de Proyectos",
        description:
          "Metodologías y herramientas para la gestión efectiva de proyectos",
        numberOfChapters: 6,
        includeVideos: false,
        difficulty: "Avanzado",
        category: "Gestión",
        level: "Avanzado",
        status: "Publicado",
        estimatedDuration: "12 horas",
        visibility: "Público",
        targetCompanies: [],
        modules: [
          {
            title: "Fundamentos de Gestión de Proyectos",
            description: "Conceptos básicos y metodologías",
            lessons: [
              {
                title: "Introducción a la gestión de proyectos",
                text: "La gestión de proyectos es la aplicación de conocimientos, habilidades, herramientas y técnicas a las actividades del proyecto.",
              },
            ],
          },
        ],
        bannerImage: "/online-education.png",
        createdBy: "00000000-0000-0000-0000-000000000001",
        companyId: null,
        isPublic: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        cid: `course_${Date.now()}_3`,
        name: "Liderazgo y Comunicación",
        description:
          "Desarrolla habilidades de liderazgo y comunicación efectiva",
        numberOfChapters: 4,
        includeVideos: true,
        difficulty: "Básico",
        category: "Soft Skills",
        level: "Básico",
        status: "Publicado",
        estimatedDuration: "6 horas",
        visibility: "Público",
        targetCompanies: [],
        modules: [
          {
            title: "Fundamentos del Liderazgo",
            description: "Conceptos básicos de liderazgo",
            lessons: [
              {
                title: "¿Qué es el liderazgo?",
                text: "El liderazgo es la capacidad de influir en otros para lograr objetivos comunes.",
                video: "https://www.youtube.com/watch?v=XP5VLbSSOqk",
              },
            ],
          },
        ],
        bannerImage: "/online-education.png",
        createdBy: "00000000-0000-0000-0000-000000000001",
        companyId: null,
        isPublic: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert courses
    for (const course of testCourses) {
      await db.insert(coursesTable).values(course);
      console.log(`Created course: ${course.name} (ID: ${course.id})`);
    }

    console.log("Test courses created successfully!");
    console.log("Course IDs:");
    testCourses.forEach((course) => {
      console.log(`- ${course.name}: ${course.id}`);
    });
  } catch (error) {
    console.error("Error creating test courses:", error);
  } finally {
    process.exit(0);
  }
}

createTestCourses();
