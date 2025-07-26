import { useAuth } from "@/context/AuthContext";
import { SYSTEM_ROLES } from "@/app/types";

export const useAdmin = () => {
  const { session } = useAuth();

  const isAdmin = () => {
    if (!session?.currentRole) return false;
    return session.currentRole.name === SYSTEM_ROLES.ADMIN;
  };

  const hasAdminPermission = () => {
    if (!session?.permissions) return false;
    return session.permissions.includes("platform:admin");
  };

  return {
    isAdmin: isAdmin(),
    hasAdminPermission: hasAdminPermission(),
    session,
  };
};
