"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { CourseAdminGuardProps } from "@/app/types";

export function CourseAdminGuard({ children }: CourseAdminGuardProps) {
  const { isAdmin } = useAdmin();
  const { session, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Redirigir si no hay sesión
  if (!session) {
    toast.error("Debes iniciar sesión para acceder a esta página");
    redirect("/sign-in");
  }

  // Redirigir si no es administrador
  if (!isAdmin) {
    toast.error("No tienes permisos para acceder a esta página");
    redirect("/");
  }

  return <>{children}</>;
}
