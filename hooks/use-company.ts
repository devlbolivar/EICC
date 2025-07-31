"use client";

import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export const useCompany = () => {
  const { session } = useAuth();

  const isCompany = useMemo(() => {
    // Si no hay sesión, no es company
    if (!session) {
      console.log("useCompany: No session available");
      return false;
    }

    // Si no hay permisos, no es company
    if (!session.permissions || session.permissions.length === 0) {
      console.log("useCompany: No permissions available");
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

      console.log("useCompany: Permission analysis:", {
        permissions: session.permissions,
        hasCompanyPermissions,
        hasAdminPermissions,
        isCompany: hasCompanyPermissions && !hasAdminPermissions,
      });

      // Es company si tiene permisos de company Y NO tiene permisos de admin
      return hasCompanyPermissions && !hasAdminPermissions;
    }

    return false;
  }, [session]);

  return { isCompany };
};
