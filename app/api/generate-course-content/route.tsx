import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { verifyAccessToken } from "@/lib/auth";
import { validateUUID, sanitizeString } from "@/lib/utils";

const Prompt = `
Depende del nombre del capítulo y del tema. Genera contenido para cada tema en formato HTML y da la respuesta en formato JSON.
Schema:{
chapterName:<>,
{
topic:<>,
content:<>
}
}
: User Input:`;

// Helper function to sanitize JSON string
function sanitizeJsonString(str: string): string {
  // Remove any markdown code block markers
  let sanitized = str
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Handle HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Ensure the string is properly terminated
  if (!sanitized.endsWith("}")) {
    sanitized += "}";
  }

  return sanitized;
}

export async function POST(req: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN =====
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token de acceso requerido" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token de acceso inválido" },
        { status: 401 }
      );
    }

    const { courseJson, courseTitle, courseId } = await req.json();

    // ===== VALIDAR ENTRADA =====
    if (!courseJson || !courseTitle || !courseId) {
      return NextResponse.json(
        { error: "Datos requeridos faltantes" },
        { status: 400 }
      );
    }

    if (!validateUUID(courseId)) {
      return NextResponse.json(
        { error: "ID de curso inválido" },
        { status: 400 }
      );
    }

    if (typeof courseTitle !== "string" || courseTitle.length < 1) {
      return NextResponse.json(
        { error: "Título de curso inválido" },
        { status: 400 }
      );
    }

    if (!Array.isArray(courseJson.chapters)) {
      return NextResponse.json(
        { error: "Estructura de curso inválida" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const promises = courseJson.chapters.map(async (chapter: unknown) => {
      const config = {
        responseMimeType: "text/plain",
      };
      const model = "gemini-2.0-flash";
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: `${Prompt} ${JSON.stringify(chapter)}`,
            },
          ],
        },
      ];

      try {
        const response = await ai.models.generateContent({
          model,
          config,
          contents,
        });

        if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error("No response from AI");
        }

        const rawResponse = response.candidates[0].content.parts[0].text;
        const sanitizedJson = sanitizeJsonString(rawResponse);

        try {
          const jsonResponse = JSON.parse(sanitizedJson);
          const youtubeData = await getYoutubeVideo(
            (chapter as { chapterName: string })?.chapterName
          );
          jsonResponse.youtubeVideo = youtubeData;
          return jsonResponse;
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          throw new Error("Invalid JSON response from AI");
        }
      } catch (error) {
        console.error("Error processing chapter:", error);
        throw error;
      }
    });

    const courseContent = await Promise.all(promises);

    return NextResponse.json({
      courseName: sanitizeString(courseTitle),
      courseId,
      courseContent,
    });
  } catch (error) {
    console.error("Error generating course content:", error);
    return NextResponse.json(
      { error: "Failed to generate course content" },
      { status: 500 }
    );
  }
}

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";
const getYoutubeVideo = async (topic: string) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn("YouTube API key not configured");
      return [];
    }

    const params = {
      part: "snippet",
      q: sanitizeString(topic),
      maxResults: 4,
      type: "video",
      key: process.env.YOUTUBE_API_KEY,
    };

    const response = await axios.get(YOUTUBE_BASE_URL, { params });

    const youtubeVideoListResponse = response.data.items;
    const youtubeVideoList: unknown[] = [];

    if (Array.isArray(youtubeVideoListResponse)) {
      youtubeVideoListResponse.forEach((item: unknown) => {
        const data = {
          videoId: (item as { id: { videoId: string } }).id.videoId,
          title: (item as { snippet: { title: string } }).snippet.title,
          thumbnail: (
            item as { snippet: { thumbnails: { default: { url: string } } } }
          ).snippet.thumbnails.default.url,
        };
        youtubeVideoList.push(data);
      });
    }

    return youtubeVideoList;
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
};
