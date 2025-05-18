import { coursesTable } from "@/config/schema";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import db from "@/config/db";
import crypto from "crypto";
import { currentUser } from "@clerk/nextjs/server";
import axios from "axios";
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
  const formData = await req.json();

  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.primaryEmailAddress?.emailAddress) {
    return NextResponse.json(
      { error: "No email address found" },
      { status: 400 }
    );
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
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

  console.log(bannerImage);

  const result = await db.insert(coursesTable).values({
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

  return NextResponse.json({ courseId });
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
