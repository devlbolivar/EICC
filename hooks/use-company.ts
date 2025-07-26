import { useAuth } from "@/context/AuthContext";
import { SYSTEM_ROLES } from "@/app/types";

export const useCompany = () => {
  const { session } = useAuth();

  const isCompany = () => {
    if (!session?.currentRole) return false;
    return session.currentRole.name === SYSTEM_ROLES.COMPANY;
  };

  const hasCompanyPermission = (permission: string) => {
    if (!session?.permissions) return false;
    return session.permissions.includes(permission as any);
  };

  return {
    isCompany: isCompany(),
    hasCompanyPermission,
    session,
  };
};
