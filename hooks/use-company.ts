"use client";

import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export const useCompany = () => {
  const { session } = useAuth();

  const isCompany = useMemo(() => {
    // Si no hay sesión, no es company
    if (!session) {
      return false;
    }

    // Si no hay permisos, no es company
    if (!session.permissions || session.permissions.length === 0) {
      return false;
    }

    // Check if user has company permissions
    if (session.permissions && session.permissions.length > 0) {
      const hasCompanyPermissions = session.permissions.some(
        (permission) =>
          permission === "company:admin" ||
          permission === "company:write" ||
          permission === "company:read" ||
          permission === "company:billing"
      );

      // Check that user does NOT have admin permissions
      const hasAdminPermissions = session.permissions.some(
        (permission) =>
          permission === "platform:admin" ||
          permission === "platform:write" ||
          permission === "platform:read"
      );

      // Es company si tiene permisos de company Y NO tiene permisos de admin
      return hasCompanyPermissions && !hasAdminPermissions;
    }

    return false;
  }, [session]);

  // Obtener información de la empresa desde la sesión
  const company = useMemo(() => {
    if (!session?.currentCompany) {
      return null;
    }
    return {
      id: session.currentCompany.id,
      name: session.currentCompany.name || "",
    };
  }, [session]);

  return { isCompany, company };
};
