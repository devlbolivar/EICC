import { coursesTable, usersTable } from "@/config/schema";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import db from "@/config/db";
import crypto from "crypto";
import axios from "axios";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
const prompt = `Genera un curso de aprendizaje basado en los siguientes detalles. Asegúrate de incluir:
Nombre del curso
Descripción, Nombre de cada capítulo,Prompt para imagen (Crea una ilustración digital 2D moderna, de estilo plano, que represente el tema del usuario. Incluye elementos de UI/UX como pantallas de maquetas, bloques de texto, íconos, botones y herramientas creativas de trabajo. Agrega elementos simbólicos relacionados con el curso del usuario, como notas adhesivas, componentes de diseño y ayudas visuales. Usa una paleta de colores vibrante (azul, púrpura, naranja) con una apariencia limpia y profesional. La ilustración debe sentirse creativa, tecnológica y educativa, ideal para visualizar conceptos del curso del usuario.), 
Banner del curso en formato 3D, Temas de cada capítulo, Duración de cada capítulo
Devuelve el resultado únicamente en formato JSON, siguiendo este esquema:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "difficulty": "string",
    "includeVideos": "boolean",
    "numberOfChapters": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topic": ["string"],
        "imagePrompt": "string"
      }
    ]
  }
}

User Input: 
`;

export async function POST(req: Request) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  try {
    const formData = await req.json();

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

    // Verificar acceso premium (simplificado por ahora)
    const hasPremiumAccess = false; // TODO: Implementar verificación de plan premium

    const config = {
      responseMimeType: "text/plain",
    };
    const model = "gemini-2.0-flash";
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `${prompt} ${JSON.stringify(formData)}`,
          },
        ],
      },
    ];

    if (!hasPremiumAccess) {
      const result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.userEmail, user.email));
      if (result.length >= 1) {
        return NextResponse.json({ response: "Limit exceeded" });
      }
    }

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("No response from Gemini API");
    }

    const rawResponse = response.candidates[0].content.parts[0].text;
    const rawJson = rawResponse.replace("```json", "").replace("```", "");
    const jsonResponse = JSON.parse(rawJson);
    const courseId = crypto.randomUUID();

    const imagePrompt = jsonResponse.course.bannerImagePrompt;

    const bannerImage = await generateBannerImage(imagePrompt);

    await db.insert(coursesTable).values({
      cid: courseId,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      includeVideos: formData.includeVideos,
      numberOfChapters: formData.chapters,
      userEmail: user.email,
      courseJson: jsonResponse,
      bannerImage: bannerImage,
      createdBy: user.id,
    });

    return NextResponse.json({ courseId });
  } catch (error) {
    console.error("Error generating course layout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

const generateBannerImage = async (imagePrompt: string) => {
  const BASE_URL = "https://aigurulab.tech";
  const result = await axios.post(
    BASE_URL + "/api/generate-image",
    {
      width: 1024,
      height: 1024,
      input: imagePrompt,
      model: "flux",
      aspectRatio: "16:9",
    },
    {
      headers: {
        "x-api-key": process.env.AI_GURU_LAB_API,
        "Content-Type": "application/json",
      },
    }
  );
  return result.data.image;
};
