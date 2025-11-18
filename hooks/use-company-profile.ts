"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { safeLocalStorage } from "@/lib/storage";

export interface CompanyProfile {
  id: string;
  name: string;
  rut: string;
  taxIdType?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  isActive: boolean;
  subscriptionPlan: string;
  subscriptionExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyProfileUpdateData {
  name: string;
  rut: string;
  taxIdType?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
}

interface UseCompanyProfileReturn {
  companyProfile: CompanyProfile | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  updateProfile: (data: CompanyProfileUpdateData) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export function useCompanyProfile(): UseCompanyProfileReturn {
  const { session } = useAuth();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getToken = () => {
    return safeLocalStorage.getItem("accessToken");
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token && !session) {
        throw new Error("No hay token de autenticación");
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/company/profile", {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al obtener perfil de empresa"
        );
      }

      const result = await response.json();
      setCompanyProfile(result.data);
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: CompanyProfileUpdateData) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token && !session) {
        throw new Error("No hay token de autenticación");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/company/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al actualizar perfil de empresa"
        );
      }

      const result = await response.json();
      setCompanyProfile(result.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating company profile:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  return {
    companyProfile,
    loading,
    error,
    isEditing,
    setIsEditing,
    updateProfile,
    refreshProfile,
    clearError,
  };
}
