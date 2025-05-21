import { NextRequest, NextResponse } from "next/server";
import { ai } from "../generate-course-layout/route";

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
  const { courseJson, courseTitle, courseId } = await req.json();

  const promises = courseJson.chapters.map(async (chapter: any) => {
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
        return jsonResponse;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw JSON:", rawResponse);
        console.error("Sanitized JSON:", sanitizedJson);
        throw new Error("Invalid JSON response from AI");
      }
    } catch (error) {
      console.error("Error processing chapter:", error);
      throw error;
    }
  });

  try {
    const courseContent = await Promise.all(promises);
    return NextResponse.json({
      courseName: courseTitle,
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
