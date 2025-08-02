"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { AuthGuardProps } from "@/app/types";
import { PAGE_ROUTES } from "@/lib/constants";

export default function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const MAX_REDIRECT_ATTEMPTS = 3;

  useEffect(() => {
    // Solo redirigir si el usuario está autenticado y no está ya redirigiendo
    if (
      !loading &&
      session &&
      !isRedirecting &&
      redirectAttempts < MAX_REDIRECT_ATTEMPTS
    ) {
      // Verificar si estamos en una ruta de autenticación
      const currentPath = window.location.pathname;
      const isAuthRoute =
        currentPath === "/sign-in" || currentPath === "/sign-up";

      if (isAuthRoute) {
        const roleRedirects = {
          admin: PAGE_ROUTES.WORKSPACE.ADMIN,
          company: PAGE_ROUTES.WORKSPACE.COMPANY,
          student: PAGE_ROUTES.WORKSPACE.STUDENT,
        };

        const currentRole = session.currentRole?.name;
        const redirectPath =
          roleRedirects[currentRole as keyof typeof roleRedirects];

        if (redirectPath) {
          setIsRedirecting(true);
          setRedirectAttempts((prev) => prev + 1);

          console.log(
            `🔄 Usuario autenticado con rol ${currentRole}, redirigiendo a ${redirectPath}`
          );
          router.replace(redirectPath);
        } else {
          console.log(
            "🔄 Usuario autenticado sin rol específico, redirigiendo a /"
          );
          setIsRedirecting(true);
          setRedirectAttempts((prev) => prev + 1);
          router.replace("/");
        }
      }
    }
  }, [session, loading, router, isRedirecting, redirectAttempts]);

  // Reset redirecting state when session changes
  useEffect(() => {
    if (!session) {
      setIsRedirecting(false);
      setRedirectAttempts(0);
    }
  }, [session]);

  // Mostrar error si se detectan demasiados intentos de redirección
  if (redirectAttempts >= MAX_REDIRECT_ATTEMPTS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">
            Error de Redirección
          </h1>
          <p className="text-red-600 mb-4">
            Se detectó un problema con la autenticación.
          </p>
          <button
            onClick={() => (window.location.href = "/sign-in")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
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

  // Si el usuario no está autenticado, mostrar el contenido de autenticación
  if (!session) {
    return <>{children}</>;
  }

  // Si el usuario está autenticado y redirigiendo, mostrar loading
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

  // Si el usuario está autenticado, no mostrar nada (se redirigirá)
  return null;
}
