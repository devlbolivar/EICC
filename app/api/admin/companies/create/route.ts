import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function POST(request: NextRequest) {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

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

    const { name, rut, email, phone, address, industry, plan } = await request.json();

    if (!name || !rut || !email) {
      return NextResponse.json(
        { error: "Nombre, RUT y email son requeridos" },
        { status: 400 }
      );
    }

    const newCompany = await db
      .insert(schema.companiesTable)
      .values({
        name,
        rut,
        email,
        phone,
        address,
        industry,
        plan,
      })
      .returning();

    return NextResponse.json({ company: newCompany[0] });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
