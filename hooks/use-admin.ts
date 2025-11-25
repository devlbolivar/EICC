"use client";

import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import { Permission } from "@/app/types";

export const useAdmin = () => {
  const { session } = useAuth();

  const isAdmin = useMemo(() => {
    // Si no hay sesión, no es admin
    if (!session) {
      return false;
    }

    // Si no hay permisos, no es admin
    if (!session.permissions || session.permissions.length === 0) {
      return false;
    }

    // Check if user has admin permissions
    if (session.permissions && session.permissions.length > 0) {
      const adminPermissions: Permission[] = [
        "platform:admin",
        "platform:write",
        "platform:read",
        "courses:create",
        "courses:edit",
        "courses:delete",
      ];

      const hasAdminPermissions = session.permissions.some(
        (permission: Permission) => adminPermissions.includes(permission)
      );

      // Check that user does NOT have company permissions
      const hasCompanyPermissions = session.permissions.some(
        (permission: Permission) =>
          permission === "company:admin" ||
          permission === "company:write" ||
          permission === "company:read" ||
          permission === "company:billing"
      );

      // Es admin si tiene permisos de admin Y NO tiene permisos de company
      return hasAdminPermissions && !hasCompanyPermissions;
    }

    return false;
  }, [session]);

  return { isAdmin };
};
