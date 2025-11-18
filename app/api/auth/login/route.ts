import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { comparePassword, generateTokenPair, validateEmail } from "@/lib/auth";
import { validateAndSanitizeEmail } from "@/lib/utils";
import { sql } from "drizzle-orm";
import type { Permission } from "../../../types/index";
import { authRateLimit } from "@/lib/rate-limit";

// ===== PERMISOS VÁLIDOS =====
const VALID_PERMISSIONS: readonly Permission[] = [
  // Permisos globales
  "platform:read",
  "platform:write",
  "platform:admin",
  // Permisos de empresa
  "company:read",
  "company:write",
  "company:admin",
  "company:billing",
  // Permisos de usuarios
  "users:read",
  "users:write",
  "users:invite",
  "users:remove",
  "users:manage",
  // Permisos de cursos
  "courses:read",
  "courses:write",
  "courses:create",
  "courses:delete",
  "courses:publish",
  "courses:enroll",
  "courses:edit",
  "courses:view",
  "courses:manage",
  // Permisos de contenido
  "content:read",
  "content:write",
  "content:create",
  "content:delete",
] as const;

/**
 * Valida que un valor sea un permiso válido
 */
function isValidPermission(value: unknown): value is Permission {
  return (
    typeof value === "string" &&
    (VALID_PERMISSIONS as readonly string[]).includes(value)
  );
}

/**
 * Valida y extrae permisos de datos desconocidos de la base de datos.
 * Filtra permisos inválidos y retorna solo los válidos.
 *
 * @param data - Datos desconocidos (típicamente de JSONB)
 * @returns Array de permisos válidos
 * @throws Error si los datos no son un array
 */
function validatePermissions(data: unknown): Permission[] {
  if (data === null || data === undefined) {
    return [];
  }

  if (!Array.isArray(data)) {
    console.warn("validatePermissions: Expected array but received:", typeof data);
    return [];
  }

  const validPermissions: Permission[] = [];
  const invalidPermissions: unknown[] = [];

  for (const item of data) {
    if (isValidPermission(item)) {
      validPermissions.push(item);
    } else {
      invalidPermissions.push(item);
    }
  }

  if (invalidPermissions.length > 0) {
    console.warn(
      "validatePermissions: Found invalid permissions:",
      invalidPermissions
    );
  }

  return validPermissions;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 intentos por 15 minutos
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email, password } = body;

    // ===== VALIDACIONES BÁSICAS =====
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // ===== VALIDAR Y SANITIZAR EMAIL =====
    const sanitizedEmail = validateAndSanitizeEmail(email);
    if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // ===== VALIDAR CONTRASEÑA =====
    if (typeof password !== "string" || password.length < 1) {
      return NextResponse.json(
        { error: "Contraseña inválida" },
        { status: 400 }
      );
    }

    // ===== BUSCAR USUARIO CON SQL DIRECTO =====
    const userResult = await db.execute(
      sql`SELECT * FROM users WHERE email = ${sanitizedEmail}`
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // ===== VERIFICAR SI EL USUARIO ESTÁ ACTIVO =====
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Cuenta desactivada" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR CONTRASEÑA =====
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(
      password,
      String(user.passwordHash)
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // ===== OBTENER RELACIONES USUARIO-EMPRESA CON SQL DIRECTO =====
    const userCompaniesResult = await db.execute(
      sql`
        SELECT 
          uc.id,
          uc."userId",
          uc."companyId",
          uc."roleId",
          uc."isActive",
          uc."joinedAt",
          uc."invitedBy",
          uc."acceptedAt",
          c.id as company_id,
          c.name as company_name,
          c.rut as company_rut,
          c.description as company_description,
          c.logo as company_logo,
          c.website as company_website,
          c.industry as company_industry,
          c.size as company_size,
          c."isActive" as company_is_active,
          c."subscriptionPlan" as company_subscription_plan,
          c."subscriptionExpiresAt" as company_subscription_expires_at,
          c."createdAt" as company_created_at,
          c."updatedAt" as company_updated_at,
          r.id as role_id,
          r.name as role_name,
          r.description as role_description,
          r.permissions as role_permissions,
          r."isSystemRole" as role_is_system_role,
          r."createdAt" as role_created_at,
          r."updatedAt" as role_updated_at
        FROM user_companies uc
        LEFT JOIN companies c ON uc."companyId" = c.id
        LEFT JOIN roles r ON uc."roleId" = r.id
        WHERE uc."userId" = ${user.id} AND uc."isActive" = true
      `
    );

    const userCompanies = userCompaniesResult.rows;

    if (userCompanies.length === 0) {
      return NextResponse.json(
        { error: "Usuario sin roles asignados" },
        { status: 401 }
      );
    }

    // ===== DETERMINAR ROL PRINCIPAL Y EMPRESA =====
    // Prioridad: admin > company > student
    const rolePriority = { admin: 3, company: 2, student: 1 };

    let primaryUserCompany = userCompanies[0];
    let highestPriority =
      rolePriority[primaryUserCompany.role_name as keyof typeof rolePriority] ||
      0;

    for (const userCompany of userCompanies) {
      const priority =
        rolePriority[userCompany.role_name as keyof typeof rolePriority] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        primaryUserCompany = userCompany;
      }
    }

    // ===== ACTUALIZAR ÚLTIMO LOGIN =====
    await db.execute(
      sql`UPDATE users SET "lastLoginAt" = NOW() WHERE id = ${user.id}`
    );

    // ===== VALIDAR PERMISOS DEL ROL PRINCIPAL =====
    const primaryPermissions = validatePermissions(
      primaryUserCompany.role_permissions
    );

    // ===== GENERAR TOKENS =====
    const tokenPayload = {
      userId: String(user.id),
      email: String(user.email),
      name: String(user.name),
      companyId: primaryUserCompany.company_id
        ? String(primaryUserCompany.company_id)
        : undefined,
      roleId: String(primaryUserCompany.role_id),
      permissions: primaryPermissions,
    };

    const tokens = generateTokenPair(tokenPayload);

    // ===== PREPARAR RESPUESTA =====
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      currentCompany: primaryUserCompany.company_id
        ? {
            id: primaryUserCompany.company_id,
            name: primaryUserCompany.company_name,
            rut: primaryUserCompany.company_rut,
          }
        : null,
      currentRole: {
        id: primaryUserCompany.role_id,
        name: primaryUserCompany.role_name,
        permissions: primaryPermissions,
      },
      permissions: primaryPermissions,
      userCompanies: userCompanies.map((uc) => ({
        id: uc.id,
        company: uc.company_id
          ? {
              id: uc.company_id,
              name: uc.company_name,
              rut: uc.company_rut,
            }
          : null,
        role: {
          id: uc.role_id,
          name: uc.role_name,
          permissions: validatePermissions(uc.role_permissions),
        },
        isActive: uc.isActive,
        joinedAt: uc.joined_at,
      })),
    };

    const response = NextResponse.json(
      {
        success: true,
        message: "Inicio de sesión exitoso",
        data: responseData,
      },
      { status: 200 }
    );

    // ===== SETEAR COOKIES CON CONFIGURACIÓN SEGURA =====
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
