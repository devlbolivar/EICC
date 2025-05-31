import { coursesTable } from "@/config/schema";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import db from "@/config/db";
import crypto from "crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import { eq } from "drizzle-orm";

// Types
interface CourseFormData {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  includeVideos: boolean;
  chapters: number;
}

interface GeminiResponse {
  course: {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    includeVideos: boolean;
    numberOfChapters: number;
    bannerImagePrompt: string;
    chapters: Array<{
      chapterName: string;
      duration: string;
      topic: string[];
      imagePrompt: string;
    }>;
  };
}

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

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY || !process.env.AI_GURU_LAB_API) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const formData = (await req.json()) as CourseFormData;

    // Validate required fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.category ||
      !formData.difficulty
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    const { has } = await auth();
    const hasPremiumAccess = has({ plan: "basico" });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: "No email address found" },
        { status: 400 }
      );
    }

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
        .where(
          eq(coursesTable.userEmail, user.primaryEmailAddress.emailAddress)
        );
      if (result.length >= 1) {
        return NextResponse.json(
          { error: "Course limit exceeded" },
          { status: 403 }
        );
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
    let jsonResponse: GeminiResponse;

    try {
      jsonResponse = JSON.parse(rawJson);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json(
        { error: "Invalid response from AI model" },
        { status: 500 }
      );
    }

    const courseId = crypto.randomUUID();
    const imagePrompt = jsonResponse.course.bannerImagePrompt;

    let bannerImage: string;
    try {
      bannerImage = await generateBannerImage(imagePrompt);
    } catch (error) {
      console.error("Error generating banner image:", error);
      return NextResponse.json(
        { error: "Failed to generate banner image" },
        { status: 500 }
      );
    }

    try {
      await db.insert(coursesTable).values({
        cid: courseId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        includeVideos: formData.includeVideos,
        numberOfChapters: formData.chapters,
        userEmail: user.primaryEmailAddress.emailAddress,
        courseJson: jsonResponse,
        bannerImage: bannerImage,
      });
    } catch (error) {
      console.error("Error saving course to database:", error);
      return NextResponse.json(
        { error: "Failed to save course to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ courseId });
  } catch (error) {
    console.error("Error in course generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const generateBannerImage = async (imagePrompt: string): Promise<string> => {
  const BASE_URL = "https://aigurulab.tech";
  try {
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
  } catch (error) {
    console.error("Error generating banner image:", error);
    throw new Error("Failed to generate banner image");
  }
};
