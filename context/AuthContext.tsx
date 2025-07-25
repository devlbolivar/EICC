"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AuthSession,
  AuthContextType,
  UserLoginData,
  UserRegistrationData,
  Permission,
  User,
  UserOrganization,
  Organization,
  Role,
} from "@/app/types";
import { toast } from "sonner";

// ===== CONTEXTO =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== HOOK PERSONALIZADO =====
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

// ===== PROVIDER =====
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== INICIALIZACIÓN =====
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Los tokens están en cookies httpOnly, validar directamente
      await validateAndSetSession();
    } catch (error) {
      console.error(
        "❌ AuthContext: Error inicializando autenticación:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const validateAndSetSession = async () => {
    try {
      const response = await fetch("/api/auth/validate", {
        method: "GET",
        // No necesitamos enviar el token en headers, está en cookies
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.data);
      } else {
        // Token inválido, intentar refresh
        await refreshToken();
      }
    } catch (error) {
      console.error("❌ AuthContext: Error validando sesión:", error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      // El refresh token está en cookies, no necesitamos enviarlo en el body
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        setSession(data.data.session);
      } else {
        throw new Error("Refresh token inválido");
      }
    } catch (error) {
      console.error("Error refrescando token:", error);
      logout();
      throw error;
    }
  };

  // ===== FUNCIONES DE AUTENTICACIÓN =====
  const login = async (data: UserLoginData) => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error en el login");
      }

      // Los tokens están en cookies httpOnly, no necesitamos guardarlos en localStorage
      setSession(result.data);

      toast.success("Inicio de sesión exitoso");

      return result.data;
    } catch (error) {
      console.error("❌ AuthContext: Error en login:", error);
      toast.error(
        error instanceof Error ? error.message : "Error en el inicio de sesión"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: UserRegistrationData) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error en el registro");
      }

      toast.success("Registro exitoso. Por favor verifica tu email.");
    } catch (error) {
      console.error("Error en registro:", error);
      toast.error(
        error instanceof Error ? error.message : "Error en el registro"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout para invalidar el refresh token
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("❌ AuthContext: Error en logout:", error);
    } finally {
      setSession(null);
      toast.success("Sesión cerrada");
    }
  };

  const switchOrganization = async (organizationId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No hay token de acceso");
      }

      const response = await fetch("/api/auth/switch-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error cambiando organización");
      }

      // Actualizar tokens
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("refreshToken", result.data.refreshToken);
      setSession(result.data.session);

      toast.success("Organización cambiada exitosamente");
    } catch (error) {
      console.error("Error cambiando organización:", error);
      toast.error(
        error instanceof Error ? error.message : "Error cambiando organización"
      );
      throw error;
    }
  };

  const switchCompany = async (companyId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No hay token de acceso");
      }

      const response = await fetch("/api/auth/switch-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error cambiando empresa");
      }

      // Actualizar tokens
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("refreshToken", result.data.refreshToken);
      setSession(result.data.session);

      toast.success("Empresa cambiada exitosamente");
    } catch (error) {
      console.error("Error cambiando empresa:", error);
      toast.error(
        error instanceof Error ? error.message : "Error cambiando empresa"
      );
      throw error;
    }
  };

  // ===== FUNCIONES DE PERMISOS =====
  const hasPermission = (permission: Permission): boolean => {
    if (!session) return false;
    return session.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!session) return false;
    return permissions.some((permission) =>
      session.permissions.includes(permission)
    );
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!session) return false;
    return permissions.every((permission) =>
      session.permissions.includes(permission)
    );
  };

  // ===== VALOR DEL CONTEXTO =====
  const value: AuthContextType = {
    session,
    loading,
    login,
    register,
    logout,
    switchCompany,
    switchOrganization,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
