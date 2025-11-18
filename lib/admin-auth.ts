import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";
import type { Permission } from "@/app/types";

/**
 * Verifica que el usuario esté autenticado Y tenga permisos de administrador
 * Uso:
 *
 * const authResult = await verifyAdminAuth(request);
 * if (!authResult.authorized) {
 *   return authResult.response;
 * }
 * const payload = authResult.payload;
 */
export async function verifyAdminAuth(request: NextRequest) {
  // Extraer token
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("accessToken")?.value;

  if (!token) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Token de autenticación requerido" },
        { status: 401 }
      ),
    };
  }

  // Verificar token
  const payload = verifyAccessToken(token);

  if (!payload) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Token de acceso inválido o expirado" },
        { status: 401 }
      ),
    };
  }

  // Verificar permisos de administrador
  const permissions = payload.permissions as Permission[];

  const hasAdminPermissions = hasAnyPermission(permissions, [
    "users:manage",
    "company:admin",
    "platform:admin",
    "courses:manage",
  ]);

  if (!hasAdminPermissions) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          error: "Permisos insuficientes. Se requiere rol de administrador",
          requiredPermissions: ["users:manage", "company:admin", "platform:admin", "courses:manage"]
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    payload,
  };
}

/**
 * Verifica que el usuario esté autenticado (sin verificar rol específico)
 */
export async function verifyAuth(request: NextRequest) {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("accessToken")?.value;

  if (!token) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Token de autenticación requerido" },
        { status: 401 }
      ),
    };
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Token de acceso inválido o expirado" },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true as const,
    payload,
  };
}

/**
 * Verifica que el usuario tenga un permiso específico
 */
export async function verifyPermission(
  request: NextRequest,
  requiredPermission: Permission
) {
  const authResult = await verifyAuth(request);

  if (!authResult.authorized) {
    return authResult;
  }

  const permissions = authResult.payload.permissions as Permission[];

  if (!hasPermission(permissions, requiredPermission)) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          error: "Permisos insuficientes",
          requiredPermission
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    payload: authResult.payload,
  };
}

/**
 * Verifica que el usuario esté autenticado Y tenga permisos de estudiante
 * Los estudiantes deben tener el permiso "courses:enroll"
 */
export async function verifyStudentAuth(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if (!authResult.authorized) {
    return authResult;
  }

  const permissions = authResult.payload.permissions as Permission[];

  // Verificar que tiene permiso de estudiante (courses:enroll es único para estudiantes)
  if (!hasPermission(permissions, "courses:enroll")) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          error: "Acceso denegado. Se requiere rol de estudiante",
          requiredPermission: "courses:enroll"
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    payload: authResult.payload,
  };
}

/**
 * Verifica que el usuario esté autenticado Y tenga permisos de empresa
 */
export async function verifyCompanyAuth(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if (!authResult.authorized) {
    return authResult;
  }

  const permissions = authResult.payload.permissions as Permission[];

  if (!hasPermission(permissions, "company:admin")) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          error: "Acceso denegado. Se requiere rol de empresa",
          requiredPermission: "company:admin"
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    payload: authResult.payload,
  };
}
