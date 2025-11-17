import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

// Valores por defecto de las configuraciones
const DEFAULT_SETTINGS = {
  // General
  appName: "EICCC",
  appUrl: "https://eiccc.com",
  timezone: "america/santiago",
  language: "es",

  // Security
  sessionTimeout: "120",
  maxLoginAttempts: "5",
  require2FA: "false",
  requireEmailVerification: "true",

  // Email
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  fromEmail: "noreply@eiccc.com",

  // Database
  autoBackup: "true",
  backupRetention: "30",
  autoOptimize: "true",
  maxConnections: "100",
};

/**
 * GET /api/admin/settings
 * Obtiene todas las configuraciones del sistema
 */
export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // ===== OBTENER CONFIGURACIONES DE LA BASE DE DATOS =====
    const settingsFromDb = await db
      .select()
      .from(schema.settingsTable);

    // Convertir array de settings a objeto key-value
    const settingsObject: Record<string, string> = {};
    settingsFromDb.forEach((setting) => {
      settingsObject[setting.key] = setting.value || "";
    });

    // Combinar con valores por defecto (para settings que no existen aún)
    const allSettings = {
      ...DEFAULT_SETTINGS,
      ...settingsObject,
    };

    return NextResponse.json({
      success: true,
      data: allSettings,
    });
  } catch (error) {
    console.error("Error obteniendo configuraciones:", error);
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

/**
 * POST /api/admin/settings
 * Guarda/actualiza las configuraciones del sistema
 */
export async function POST(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // ===== VALIDAR BODY =====
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Datos de configuración inválidos" },
        { status: 400 }
      );
    }

    // ===== CATEGORIZAR SETTINGS =====
    const categoryMap: Record<string, string> = {
      appName: "general",
      appUrl: "general",
      timezone: "general",
      language: "general",
      sessionTimeout: "security",
      maxLoginAttempts: "security",
      require2FA: "security",
      requireEmailVerification: "security",
      smtpHost: "email",
      smtpPort: "email",
      smtpUser: "email",
      smtpPass: "email",
      fromEmail: "email",
      autoBackup: "database",
      backupRetention: "database",
      autoOptimize: "database",
      maxConnections: "database",
    };

    // ===== GUARDAR CONFIGURACIONES =====
    const updatePromises = Object.entries(body).map(async ([key, value]) => {
      const category = categoryMap[key] || "general";
      const isEncrypted = key === "smtpPass"; // Encriptar contraseñas (puedes agregar lógica de encriptación real)

      // Verificar si la configuración ya existe
      const existingSetting = await db.query.settingsTable.findFirst({
        where: eq(schema.settingsTable.key, key),
      });

      if (existingSetting) {
        // Actualizar configuración existente
        return db
          .update(schema.settingsTable)
          .set({
            value: String(value),
            category,
            isEncrypted,
            updatedAt: new Date(),
          })
          .where(eq(schema.settingsTable.key, key));
      } else {
        // Insertar nueva configuración
        return db.insert(schema.settingsTable).values({
          key,
          value: String(value),
          category,
          isEncrypted,
          description: `Configuración de ${category}`,
        });
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Configuraciones guardadas exitosamente",
    });
  } catch (error) {
    console.error("Error guardando configuraciones:", error);
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

/**
 * PUT /api/admin/settings
 * Alias para POST (actualizar configuraciones)
 */
export async function PUT(request: NextRequest) {
  return POST(request);
}
