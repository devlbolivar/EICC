import { useAuth } from "@/context/AuthContext";
import { SYSTEM_ROLES } from "@/app/types";

export const useStudent = () => {
  const { session } = useAuth();

  const isStudent = () => {
    if (!session?.currentRole) return false;
    return session.currentRole.name === SYSTEM_ROLES.STUDENT;
  };

  const hasStudentPermission = (permission: string) => {
    if (!session?.permissions) return false;
    return session.permissions.includes(permission as any);
  };

  return {
    isStudent: isStudent(),
    hasStudentPermission,
    session,
  };
};
