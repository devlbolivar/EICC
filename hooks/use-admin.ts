"use client";

import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import { Permission } from "@/app/types";

export const useAdmin = () => {
  const { session } = useAuth();

  const isAdmin = useMemo(() => {
    // Si no hay sesión, no es admin
    if (!session) {
      console.log("useAdmin: No session available");
      return false;
    }

    // Si no hay permisos, no es admin
    if (!session.permissions || session.permissions.length === 0) {
      console.log("useAdmin: No permissions available");
      return false;
    }

    // Check if user has admin permissions
    if (session.permissions && session.permissions.length > 0) {
      const adminPermissions: Permission[] = [
        "platform:admin",
        "courses:create",
        "courses:edit",
        "courses:delete",
      ];

      const hasAdminPermissions = session.permissions.some(
        (permission: Permission) => adminPermissions.includes(permission)
      );

      console.log("useAdmin: Permission analysis:", {
        permissions: session.permissions,
        hasAdminPermissions,
        adminPermissions: session.permissions.filter((permission: Permission) =>
          adminPermissions.includes(permission)
        ),
      });

      return hasAdminPermissions;
    }

    return false;
  }, [session]);

  return { isAdmin };
};
