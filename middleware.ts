import { NextRequest, NextResponse } from "next/server";
import { verifyAccessTokenEdge } from "@/lib/auth";
import { SYSTEM_ROLES } from "@/app/types";

// ===== RATE LIMITING SIMPLE =====
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = 100; // máximo 100 requests por ventana

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// ===== RUTAS PÚBLICAS =====
const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/accept-invite",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/accept-invite",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/refresh",
];

// ===== RUTAS DE API PÚBLICAS =====
const publicApiRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/accept-invite",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/refresh",
];

// ===== RUTAS QUE REQUIEREN AUTENTICACIÓN =====
const protectedRoutes = [
  "/workspace",
  "/course",
  "/api/courses",
  "/api/enroll-course",
  "/api/user",
  "/api/companies",
  "/api/invitations",
];

// ===== RUTAS ESPECÍFICAS POR ROL =====
const roleRoutes = {
  [SYSTEM_ROLES.ADMIN]: ["/workspace/admin", "/api/admin"],
  [SYSTEM_ROLES.COMPANY]: ["/workspace/company", "/api/company"],
  [SYSTEM_ROLES.STUDENT]: ["/workspace/student", "/workspace/my-learning"],
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

// ===== FUNCIÓN PARA VERIFICAR SI UNA RUTA REQUIERE AUTENTICACIÓN =====
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
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
      return "/workspace/admin";
    case SYSTEM_ROLES.COMPANY:
      return "/workspace/company";
    case SYSTEM_ROLES.STUDENT:
      return "/workspace/my-learning";
    default:
      return "/workspace";
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

  // ===== RATE LIMITING =====
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // ===== MANEJAR RUTAS PÚBLICAS =====
  if (isPublicRoute(pathname)) {
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
          { error: "Token de acceso requerido" },
          { status: 401 }
        );
      }

      const payload = await verifyAccessTokenEdge(token);
      if (!payload) {
        return NextResponse.json(
          { error: "Token de acceso inválido" },
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

    // ===== VERIFICAR ACCESO A RUTAS ESPECÍFICAS DE ROL =====
    // Obtener el nombre del rol desde los permisos o payload
    const roleName = getRoleNameFromPermissions(payload.permissions);

    if (roleName && isRoleSpecificRoute(pathname, roleName)) {
      // El usuario tiene acceso a esta ruta específica de su rol
      return NextResponse.next();
    }

    // ===== REDIRECCIÓN BASADA EN ROL =====
    // Si el usuario intenta acceder a una ruta que no le corresponde,
    // redirigirlo a su dashboard correspondiente
    if (roleName) {
      const userRedirectRoute = getRedirectRouteByRole(roleName);

      // Si está en una ruta que no le corresponde, redirigir
      // PERO permitir acceso a rutas específicas de rol
      if (
        pathname !== userRedirectRoute &&
        !pathname.startsWith(userRedirectRoute) &&
        !pathname.startsWith("/workspace/admin") &&
        !pathname.startsWith("/workspace/company") &&
        !pathname.startsWith("/workspace/my-learning")
      ) {
        return NextResponse.redirect(new URL(userRedirectRoute, request.url));
      }
    }

    // Token válido y acceso permitido, continuar
    return NextResponse.next();
  }

  // ===== RUTAS NO ESPECIFICADAS =====
  return NextResponse.next();
}

// ===== FUNCIÓN PARA OBTENER EL NOMBRE DEL ROL DESDE LOS PERMISOS =====
function getRoleNameFromPermissions(permissions: string[]): string | null {
  // Determinar el rol basado en los permisos
  if (permissions.includes("platform:admin")) {
    return SYSTEM_ROLES.ADMIN;
  }

  if (permissions.includes("company:admin")) {
    return SYSTEM_ROLES.COMPANY;
  }

  if (permissions.includes("courses:enroll")) {
    return SYSTEM_ROLES.STUDENT;
  }

  return null;
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
