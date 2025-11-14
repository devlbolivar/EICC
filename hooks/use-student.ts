"use client";

import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export const useStudent = () => {
  const { session } = useAuth();

  const isStudent = useMemo(() => {
    // Si no hay sesión, no es estudiante
    if (!session) {
      return false;
    }

    // Si no hay permisos, no es estudiante
    if (!session.permissions || session.permissions.length === 0) {
      return false;
    }

    // Check if user has student permissions
    if (session.permissions && session.permissions.length > 0) {
      const hasStudentPermissions = session.permissions.some(
        (permission) =>
          permission === "courses:enroll" ||
          permission === "courses:read" ||
          permission === "content:read"
      );

      // Check that user does NOT have admin or company permissions
      const hasAdminPermissions = session.permissions.some(
        (permission) =>
          permission === "platform:admin" ||
          permission === "platform:write" ||
          permission === "platform:read"
      );

      const hasCompanyPermissions = session.permissions.some(
        (permission) =>
          permission === "company:admin" ||
          permission === "company:write" ||
          permission === "company:read" ||
          permission === "company:billing"
      );

      // Es estudiante si tiene permisos de estudiante Y NO tiene permisos de admin o company
      return (
        hasStudentPermissions && !hasAdminPermissions && !hasCompanyPermissions
      );
    }

    return false;
  }, [session]);

  return { isStudent };
};
