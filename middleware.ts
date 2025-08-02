import { NextRequest, NextResponse } from "next/server";
import { verifyAccessTokenEdge } from "@/lib/auth";
import { SYSTEM_ROLES, Permission } from "@/app/types";
import { validateRouteAccess, getMostRestrictiveRole } from "@/lib/permissions";
import { validateUserActive, logUserAccess } from "@/lib/user-validation";
import {
  API_ROUTES,
  PAGE_ROUTES,
  SYSTEM_ROLES as SYSTEM_ROLES_CONST,
  UI_TEXT,
} from "@/lib/constants";

// ===== RUTAS PÚBLICAS =====
const publicRoutes = [
  "/",
  PAGE_ROUTES.AUTH.SIGN_IN,
  PAGE_ROUTES.AUTH.SIGN_UP,
  "/accept-invite",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.REGISTER,
  API_ROUTES.AUTH.ACCEPT_INVITE,
  API_ROUTES.AUTH.FORGOT_PASSWORD,
  API_ROUTES.AUTH.RESET_PASSWORD,
  API_ROUTES.AUTH.VERIFY_EMAIL,
  API_ROUTES.AUTH.REFRESH,
];

// ===== RUTAS DE API PÚBLICAS =====
const publicApiRoutes = [
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.REGISTER,
  API_ROUTES.AUTH.ACCEPT_INVITE,
  API_ROUTES.AUTH.FORGOT_PASSWORD,
  API_ROUTES.AUTH.RESET_PASSWORD,
  API_ROUTES.AUTH.VERIFY_EMAIL,
  API_ROUTES.AUTH.REFRESH,
];

// ===== RUTAS QUE REQUIEREN AUTENTICACIÓN =====
const protectedRoutes = [
  PAGE_ROUTES.WORKSPACE.ADMIN,
  PAGE_ROUTES.WORKSPACE.COMPANY,
  PAGE_ROUTES.WORKSPACE.STUDENT,
  API_ROUTES.USER,
  API_ROUTES.COMPANIES,
  API_ROUTES.INVITATIONS,
];

// ===== FUNCIÓN PARA VERIFICAR SI UNA RUTA REQUIERE AUTENTICACIÓN =====
function isProtectedRoute(pathname: string): boolean {
  // Verificar si es una ruta protegida general
  const isGeneralProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verificar si es una ruta específica de rol
  const isRoleSpecific = Object.values(roleRoutes)
    .flat()
    .some((route) => pathname.startsWith(route));

  return isGeneralProtected || isRoleSpecific;
}

// ===== RUTAS ESPECÍFICAS POR ROL =====
const roleRoutes = {
  [SYSTEM_ROLES.ADMIN]: [PAGE_ROUTES.WORKSPACE.ADMIN, API_ROUTES.ADMIN],
  [SYSTEM_ROLES.COMPANY]: [PAGE_ROUTES.WORKSPACE.COMPANY, API_ROUTES.COMPANY],
  [SYSTEM_ROLES.STUDENT]: [PAGE_ROUTES.WORKSPACE.STUDENT],
};

// ===== FUNCIÓN PARA VERIFICAR SI UNA RUTA ES PÚBLICA =====
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

// ===== FUNCIÓN PARA VERIFICAR SI UNA RUTA DE API ES PÚBLICA =====
function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

// ===== FUNCIÓN PARA VERIFICAR SI UNA RUTA ES ESPECÍFICA DE UN ROL =====
function isRoleSpecificRoute(pathname: string, roleName: string): boolean {
  const roleSpecificRoutes =
    roleRoutes[roleName as keyof typeof roleRoutes] || [];
  return roleSpecificRoutes.some((route) => pathname.startsWith(route));
}

// ===== FUNCIÓN PARA OBTENER LA RUTA DE REDIRECCIÓN POR ROL =====
function getRedirectRouteByRole(roleName: string): string {
  switch (roleName) {
    case SYSTEM_ROLES.ADMIN:
      return PAGE_ROUTES.WORKSPACE.ADMIN;
    case SYSTEM_ROLES.COMPANY:
      return PAGE_ROUTES.WORKSPACE.COMPANY;
    case SYSTEM_ROLES.STUDENT:
      return PAGE_ROUTES.WORKSPACE.STUDENT;
    default:
      return "/";
  }
}

// ===== FUNCIÓN PARA EXTRAER TOKEN DEL HEADER =====
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// ===== FUNCIÓN PARA EXTRAER TOKEN DE COOKIES =====
function extractTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get("accessToken")?.value || null;
}

// ===== FUNCIÓN PARA OBTENER IP DEL CLIENTE =====
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ===== MIDDLEWARE PRINCIPAL =====
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // ===== MANEJAR RUTAS PÚBLICAS =====
  if (isPublicRoute(pathname)) {
    // Para rutas de auth, verificar si el usuario ya está autenticado
    if (pathname === "/sign-in" || pathname === "/sign-up") {
      const token = extractTokenFromCookies(request);

      if (token) {
        try {
          const payload = await verifyAccessTokenEdge(token);

          if (
            payload &&
            payload.permissions &&
            payload.permissions.length > 0
          ) {
            // Usuario ya autenticado, redirigir según su rol
            const roleName = getRoleNameFromPermissions(payload.permissions);
            if (roleName) {
              const redirectRoute = getRedirectRouteByRole(roleName);
              return NextResponse.redirect(new URL(redirectRoute, request.url));
            }
          }
        } catch (error) {
          // Si hay error al verificar el token, continuar normalmente
        }
      }
    }

    return NextResponse.next();
  }

  // ===== MANEJAR RUTAS DE API =====
  if (pathname.startsWith("/api/")) {
    // Rutas de API públicas
    if (isPublicApiRoute(pathname)) {
      return NextResponse.next();
    }

    // Rutas de API protegidas
    if (isProtectedRoute(pathname)) {
      const token = extractToken(request) || extractTokenFromCookies(request);

      if (!token) {
        return NextResponse.json(
          { error: UI_TEXT.MIDDLEWARE.TOKEN_REQUIRED },
          { status: 401 }
        );
      }

      const payload = await verifyAccessTokenEdge(token);
      if (!payload) {
        return NextResponse.json(
          { error: UI_TEXT.MIDDLEWARE.TOKEN_INVALID },
          { status: 401 }
        );
      }

      // Agregar información del usuario a los headers para uso en las rutas
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId);
      requestHeaders.set("x-user-email", payload.email);
      requestHeaders.set(
        "x-user-permissions",
        JSON.stringify(payload.permissions)
      );

      if (payload.companyId) {
        requestHeaders.set("x-company-id", payload.companyId);
      }
      if (payload.roleId) {
        requestHeaders.set("x-role-id", payload.roleId);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Otras rutas de API
    return NextResponse.next();
  }

  // ===== MANEJAR RUTAS DE PÁGINAS PROTEGIDAS =====
  if (isProtectedRoute(pathname)) {
    const token = extractTokenFromCookies(request);

    if (!token) {
      // Redirigir a login si no hay token
      const loginUrl = new URL("/sign-in", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAccessTokenEdge(token);

    if (!payload) {
      // Token inválido, redirigir a login
      const loginUrl = new URL("/sign-in", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ===== VALIDAR QUE EL USUARIO ESTÉ ACTIVO =====
    const isUserActive = await validateUserActive(payload.userId);
    if (!isUserActive) {
      await logUserAccess(
        payload.userId,
        pathname,
        false,
        UI_TEXT.MIDDLEWARE.USER_DISABLED
      );
      const loginUrl = new URL("/sign-in", request.url);
      loginUrl.searchParams.set("error", UI_TEXT.MIDDLEWARE.ACCOUNT_DISABLED);
      return NextResponse.redirect(loginUrl);
    }

    // ===== VALIDAR ACCESO A LA RUTA ESPECÍFICA =====
    const hasAccess = validateRouteAccess(
      payload.permissions as Permission[],
      pathname
    );

    console.log(UI_TEXT.LOGS.MIDDLEWARE_DEBUG, {
      pathname,
      permissions: payload.permissions,
      hasAccess,
      roleName: getRoleNameFromPermissions(payload.permissions),
    });

    if (!hasAccess) {
      await logUserAccess(
        payload.userId,
        pathname,
        false,
        UI_TEXT.MIDDLEWARE.UNAUTHORIZED_ACCESS
      );
      const roleName = getRoleNameFromPermissions(payload.permissions);
      const redirectRoute = getRedirectRouteByRole(roleName || "student");
      console.log(
        `${UI_TEXT.LOGS.MIDDLEWARE_REDIRECT} ${pathname}, ${UI_TEXT.LOGS.MIDDLEWARE_REDIRECTING} ${redirectRoute}`
      );
      return NextResponse.redirect(new URL(redirectRoute, request.url));
    }

    // ===== VERIFICAR ACCESO A RUTAS ESPECÍFICAS DE ROL =====
    const roleName = getRoleNameFromPermissions(payload.permissions);

    if (roleName && isRoleSpecificRoute(pathname, roleName)) {
      // El usuario tiene acceso a esta ruta específica de su rol
      await logUserAccess(payload.userId, pathname, true);
      return NextResponse.next();
    }

    // ===== REDIRECCIÓN BASADA EN ROL - SOLO SI NO ESTÁ EN SU RUTA CORRECTA =====
    if (roleName) {
      const userRedirectRoute = getRedirectRouteByRole(roleName);

      // Solo redirigir si está en una ruta que no le corresponde
      // y no está ya en su ruta correcta
      if (
        pathname !== userRedirectRoute &&
        !pathname.startsWith(userRedirectRoute) &&
        !pathname.startsWith("/workspace/admin") &&
        !pathname.startsWith("/workspace/company") &&
        !pathname.startsWith("/workspace/student")
      ) {
        await logUserAccess(
          payload.userId,
          pathname,
          false,
          UI_TEXT.MIDDLEWARE.ROLE_REDIRECT
        );
        return NextResponse.redirect(new URL(userRedirectRoute, request.url));
      }
    }

    // Token válido y acceso permitido, continuar
    await logUserAccess(payload.userId, pathname, true);
    return NextResponse.next();
  }

  // ===== RUTAS NO ESPECIFICADAS =====
  return NextResponse.next();
}

// ===== FUNCIÓN PARA OBTENER EL NOMBRE DEL ROL DESDE LOS PERMISOS =====
function getRoleNameFromPermissions(permissions: string[]): string | null {
  return getMostRestrictiveRole(permissions as Permission[]);
}

// ===== CONFIGURACIÓN DEL MIDDLEWARE =====
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
