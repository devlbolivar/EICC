import { useState, useEffect, useCallback } from "react";
import {
  Certificate,
  CertificateCreateData,
  CertificateUpdateData,
  PaginationInfo,
} from "@/app/types";
import { API_ROUTES } from "@/lib/constants";

interface UseCertificatesOptions {
  userId?: string;
  courseId?: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseCertificatesReturn {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  fetchCertificates: (options?: UseCertificatesOptions) => Promise<void>;
  createCertificate: (
    data: CertificateCreateData
  ) => Promise<Certificate | null>;
  updateCertificate: (
    id: string,
    data: CertificateUpdateData
  ) => Promise<Certificate | null>;
  deleteCertificate: (id: string) => Promise<boolean>;
  getCertificate: (id: string) => Promise<Certificate | null>;
  refetch: () => Promise<void>;
}

export function useCertificates(
  options: UseCertificatesOptions = {}
): UseCertificatesReturn {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchCertificates = useCallback(
    async (fetchOptions: UseCertificatesOptions = {}) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (fetchOptions.userId || options.userId) {
          params.append("userId", (fetchOptions.userId || options.userId)!);
        }
        if (fetchOptions.courseId || options.courseId) {
          params.append(
            "courseId",
            (fetchOptions.courseId || options.courseId)!
          );
        }
        if (fetchOptions.page || options.page) {
          params.append("page", String(fetchOptions.page || options.page || 1));
        }
        if (fetchOptions.limit || options.limit) {
          params.append(
            "limit",
            String(fetchOptions.limit || options.limit || 10)
          );
        }

        const response = await fetch(
          `${API_ROUTES.CERTIFICATES}?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener certificados");
        }

        const data: { success: boolean; data: Certificate[]; pagination: PaginationInfo } =
          await response.json();

        if (data.success) {
          setCertificates(data.data);
          setPagination(data.pagination);
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching certificates:", err);
      } finally {
        setLoading(false);
      }
    },
    [options.userId, options.courseId, options.page, options.limit]
  );

  const createCertificate = useCallback(
    async (data: CertificateCreateData): Promise<Certificate | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ROUTES.CERTIFICATES, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear certificado");
        }

        const result: { success: boolean; data: Certificate } =
          await response.json();

        if (result.success) {
          setCertificates((prev) => [result.data, ...prev]);
          return result.data;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error creating certificate:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCertificate = useCallback(
    async (
      id: string,
      data: CertificateUpdateData
    ): Promise<Certificate | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_ROUTES.CERTIFICATES}/${id}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al actualizar certificado");
        }

        const result: { success: boolean; data: Certificate } =
          await response.json();

        if (result.success) {
          setCertificates((prev) =>
            prev.map((cert) => (cert.id === id ? result.data : cert))
          );
          return result.data;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error updating certificate:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteCertificate = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_ROUTES.CERTIFICATES}/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al eliminar certificado");
        }

        const result: { success: boolean } = await response.json();

        if (result.success) {
          setCertificates((prev) => prev.filter((cert) => cert.id !== id));
          return true;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error deleting certificate:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCertificate = useCallback(
    async (id: string): Promise<Certificate | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_ROUTES.CERTIFICATES}/${id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener certificado");
        }

        const result: { success: boolean; data: Certificate } =
          await response.json();

        if (result.success) {
          return result.data;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching certificate:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refetch = useCallback(() => {
    return fetchCertificates();
  }, [fetchCertificates]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchCertificates();
    }
  }, [fetchCertificates, options.autoFetch]);

  return {
    certificates,
    loading,
    error,
    pagination,
    fetchCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificate,
    refetch,
  };
}
