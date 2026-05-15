"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCsrfToken } from "@/hooks/use-csrf-token";

export interface PendingInvitation {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  roleName: string;
  roleDescription?: string;
}

export interface InvitationData {
  email: string;
  message?: string;
}

export interface CreateInvitationResponse {
  invitation: {
    id: string;
    email: string;
    role: string;
    expiresAt: Date;
    invitationUrl: string;
  };
  emailSent: boolean;
}

interface UseCompanyInvitationsReturn {
  pendingInvitations: PendingInvitation[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createInvitation: (
    data: InvitationData
  ) => Promise<CreateInvitationResponse | null>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
  refreshInvitations: () => Promise<void>;
  clearError: () => void;
}

export function useCompanyInvitations(): UseCompanyInvitationsReturn {
  const { session } = useAuth();
  const { fetchWithCsrf } = useCsrfToken();
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch("/api/company/invite", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al obtener datos de invitación"
        );
      }

      const result = await response.json();

      if (result.success) {
        setPendingInvitations(result.data.pendingInvitations);
      } else {
        throw new Error(result.error || "Error al obtener datos de invitación");
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [session]);

  const createInvitation = useCallback(
    async (data: InvitationData): Promise<CreateInvitationResponse | null> => {
      try {
        setCreating(true);
        setError(null);

        if (!session) {
          throw new Error("No hay token de autenticación");
        }

        const response = await fetchWithCsrf("/api/company/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear invitación");
        }

        const result = await response.json();

        if (result.success) {
          // Refresh the invitations list
          await fetchInvitations();
          return result.data;
        } else {
          throw new Error(result.error || "Error al crear invitación");
        }
      } catch (err) {
        console.error("Error creating invitation:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setCreating(false);
      }
    },
    [session, fetchInvitations]
  );

  const cancelInvitation = useCallback(
    async (invitationId: string): Promise<boolean> => {
      try {
        setError(null);

        if (!session) {
          throw new Error("No hay token de autenticación");
        }

        const response = await fetchWithCsrf(`/api/company/invite?id=${invitationId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al cancelar invitación");
        }

        const result = await response.json();

        if (result.success) {
          // Refresh the invitations list
          await fetchInvitations();
          return true;
        } else {
          throw new Error(result.error || "Error al cancelar invitación");
        }
      } catch (err) {
        console.error("Error canceling invitation:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [session, fetchInvitations]
  );

  const refreshInvitations = useCallback(async () => {
    await fetchInvitations();
  }, [fetchInvitations]);

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    if (session) {
      fetchInvitations();
    }
  }, [session, fetchInvitations]);

  return {
    pendingInvitations,
    loading,
    error,
    creating,
    createInvitation,
    cancelInvitation,
    refreshInvitations,
    clearError,
  };
}
