import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// ===== CONFIGURACIÓN DE RUTAS =====
const ROUTE_CONFIG = {
  // Rutas que requieren validación de autenticación
  protected: ["/workspace/admin", "/workspace/company", "/workspace/student"],
  // Rutas de autenticación (públicas)
  auth: ["/sign-in", "/sign-up"],
  // Rutas de API que requieren validación
  apiProtected: [
    "/api/user",
    "/api/companies",
    "/api/courses",
    "/api/enrollments",
    "/api/certificates",
  ],
  // Rutas públicas (no requieren validación)
  public: ["/", "/about", "/contact", "/privacy", "/terms"],
} as const;

// ===== HOOK PARA DETERMINAR SI VALIDAR AUTENTICACIÓN =====
export function useAuthValidation() {
  const pathname = usePathname();
  const [shouldValidate, setShouldValidate] = useState(false);

  useEffect(() => {
    const checkIfShouldValidate = () => {
      const isProtectedRoute = ROUTE_CONFIG.protected.some((path) =>
        pathname.startsWith(path)
      );

      // Verificar si es una ruta de API protegida
      const isProtectedApiRoute = ROUTE_CONFIG.apiProtected.some((path) =>
        pathname.startsWith(path)
      );

      // Verificar si es cualquier ruta de API (excepto auth)
      const isAnyApiRoute =
        pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/");

      // Las rutas de auth (/sign-in, /sign-up) NO deberían activar validación
      // porque son públicas y necesitamos evitar loops
      setShouldValidate(
        isProtectedRoute || isProtectedApiRoute || isAnyApiRoute
      );
    };

    checkIfShouldValidate();
  }, [pathname]);

  return {
    shouldValidate,
    isProtectedRoute: ROUTE_CONFIG.protected.some((path) =>
      pathname.startsWith(path)
    ),
    isAuthRoute: ROUTE_CONFIG.auth.some((path) => pathname.startsWith(path)),
    isPublicRoute: ROUTE_CONFIG.public.some((path) =>
      pathname.startsWith(path)
    ),
    currentPath: pathname,
  };
}

// ===== UTILIDADES PARA RUTAS =====
export const routeUtils = {
  isProtected: (pathname: string) =>
    ROUTE_CONFIG.protected.some((path) => pathname.startsWith(path)),

  isAuth: (pathname: string) =>
    ROUTE_CONFIG.auth.some((path) => pathname.startsWith(path)),

  isPublic: (pathname: string) =>
    ROUTE_CONFIG.public.some((path) => pathname.startsWith(path)),

  isApiProtected: (pathname: string) =>
    ROUTE_CONFIG.apiProtected.some((path) => pathname.startsWith(path)),

  requiresAuth: (pathname: string) => {
    const isProtected = ROUTE_CONFIG.protected.some((path) =>
      pathname.startsWith(path)
    );
    const isApiProtected = ROUTE_CONFIG.apiProtected.some((path) =>
      pathname.startsWith(path)
    );
    const isAnyApi =
      pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/");

    return isProtected || isApiProtected || isAnyApi;
  },
};
