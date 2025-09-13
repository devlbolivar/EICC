"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMostRestrictiveRole, validateRouteAccess } from "@/lib/permissions";
import { Permission } from "@/app/types";

import { WorkspaceGuardProps } from "@/app/types";
import { PAGE_ROUTES } from "@/lib/constants";

export default function WorkspaceGuard({ children }: WorkspaceGuardProps) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Rutas específicas del workspace que requieren autenticación
  const protectedWorkspaceRoutes = [
    PAGE_ROUTES.WORKSPACE.ADMIN,
    PAGE_ROUTES.WORKSPACE.COMPANY,
    PAGE_ROUTES.WORKSPACE.STUDENT,
  ];

  // Verificar si la ruta actual requiere protección
  const isProtectedRoute = protectedWorkspaceRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Función para obtener la ruta de redirección por rol
  const getRedirectRouteByRole = (roleName: string): string => {
    switch (roleName) {
      case "admin":
        return PAGE_ROUTES.WORKSPACE.ADMIN;
      case "company":
        return PAGE_ROUTES.WORKSPACE.COMPANY;
      case "student":
        return session?.user?.id
          ? `/workspace/student/${session.user.id}`
          : PAGE_ROUTES.WORKSPACE.STUDENT;
      default:
        return "/";
    }
  };

  useEffect(() => {
    console.log("🔍 WorkspaceGuard Debug:", {
      pathname,
      isProtectedRoute,
      loading,
      session: session
        ? {
            user: session.user?.name,
            currentRole: session.currentRole?.name,
            permissions: session.permissions,
          }
        : null,
    });

    // Solo verificar cuando no esté cargando y sea una ruta protegida
    if (!loading && isProtectedRoute) {
      // Si no hay sesión, redirigir a la raíz
      if (!session) {
        console.log("🚫 No hay sesión activa, redirigiendo a /");
        setIsRedirecting(true);
        router.replace("/");
        return;
      }

      // Si hay sesión pero no tiene rol, también redirigir
      if (!session.currentRole) {
        console.log("🚫 Sesión sin rol, redirigiendo a /");
        setIsRedirecting(true);
        router.replace("/");
        return;
      }

      // Verificar si el usuario tiene acceso a la ruta específica
      if (session.permissions && session.permissions.length > 0) {
        const hasAccess = validateRouteAccess(
          session.permissions as Permission[],
          pathname
        );

        console.log("🔍 Validación de acceso:", {
          pathname,
          permissions: session.permissions,
          hasAccess,
        });

        if (!hasAccess) {
          // El usuario no tiene acceso a esta ruta, redirigir según su rol
          const roleName = getMostRestrictiveRole(
            session.permissions as Permission[]
          );

          console.log("🔍 Análisis de rol:", {
            roleName,
            permissions: session.permissions,
          });

          if (roleName) {
            const userRedirectRoute = getRedirectRouteByRole(roleName);

            // Solo redirigir si no está ya en su ruta correcta
            if (
              pathname !== userRedirectRoute &&
              !pathname.startsWith(userRedirectRoute)
            ) {
              console.log(
                `🚫 Usuario con rol ${roleName} no tiene acceso a ${pathname}, redirigiendo a ${userRedirectRoute}`
              );
              setIsRedirecting(true);
              router.replace(userRedirectRoute);
              return;
            }
          }
        }
      }
    }
  }, [session, loading, router, pathname, isProtectedRoute]);

  // Si no es una ruta protegida, mostrar el contenido directamente
  if (!isProtectedRoute) {
    return <>{children}</>;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si está redirigiendo, mostrar loading
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión en una ruta protegida, no mostrar nada (se redirigirá)
  if (!session) {
    return null;
  }

  // Si hay sesión y rol, mostrar el contenido
  return <>{children}</>;
}
