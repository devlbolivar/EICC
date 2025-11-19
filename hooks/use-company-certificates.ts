import { useState, useEffect, useCallback, useRef } from "react";
import { API_ROUTES } from "@/lib/constants";
import { CertificateResponse, PaginationInfo } from "@/app/types";

/**
 * Certificado de empresa con fechas como string (serializado desde API).
 * Extiende CertificateResponse para consistencia de tipos.
 *
 * Los campos de usuario (user_name, user_email) son SIEMPRE presentes
 * porque la FK userId es NOT NULL en la tabla certificates.
 */
export interface CompanyCertificate extends Omit<CertificateResponse, 'createdAt' | 'updatedAt' | 'issuedDate' | 'completedDate'> {
  issuedDate: string;
  completedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCertificateStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  expiringSoon: number;
  averageScore: number;
}

interface UseCompanyCertificatesOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "expired" | "pending" | "all";
  courseId?: string;
  userId?: string;
  autoFetch?: boolean;
}

interface UseCompanyCertificatesReturn {
  certificates: CompanyCertificate[];
  stats: CompanyCertificateStats | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  fetchCertificates: (options?: UseCompanyCertificatesOptions) => Promise<void>;
  fetchStats: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCompanyCertificates(
  options: UseCompanyCertificatesOptions = {}
): UseCompanyCertificatesReturn {
  const [certificates, setCertificates] = useState<CompanyCertificate[]>([]);
  const [stats, setStats] = useState<CompanyCertificateStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Use ref to store the latest options to avoid dependency issues
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchCertificates = useCallback(
    async (fetchOptions: UseCompanyCertificatesOptions = {}) => {
      setLoading(true);
      setError(null);

      try {
        const currentOptions = optionsRef.current;
        const params = new URLSearchParams();

        if (fetchOptions.page || currentOptions.page) {
          params.append(
            "page",
            String(fetchOptions.page || currentOptions.page || 1)
          );
        }
        if (fetchOptions.limit || currentOptions.limit) {
          params.append(
            "limit",
            String(fetchOptions.limit || currentOptions.limit || 10)
          );
        }
        if (fetchOptions.search || currentOptions.search) {
          params.append(
            "search",
            (fetchOptions.search || currentOptions.search)!
          );
        }
        if (fetchOptions.status || currentOptions.status) {
          params.append(
            "status",
            (fetchOptions.status || currentOptions.status)!
          );
        }
        if (fetchOptions.courseId || currentOptions.courseId) {
          params.append(
            "courseId",
            (fetchOptions.courseId || currentOptions.courseId)!
          );
        }
        if (fetchOptions.userId || currentOptions.userId) {
          params.append(
            "userId",
            (fetchOptions.userId || currentOptions.userId)!
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

        const data: {
          success: boolean;
          data: CompanyCertificate[];
          pagination: PaginationInfo;
        } = await response.json();

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
    []
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_ROUTES.CERTIFICATES}/stats`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener estadísticas");
      }

      const data: { success: boolean; data: CompanyCertificateStats } =
        await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching certificate stats:", err);
      // Don't set error for stats as it's not critical
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([fetchCertificates(), fetchStats()]);
  }, [fetchCertificates, fetchStats]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchCertificates();
      fetchStats();
    }
  }, [
    options.autoFetch,
    options.page,
    options.limit,
    options.search,
    options.status,
    options.courseId,
    options.userId,
    fetchCertificates,
    fetchStats,
  ]);

  return {
    certificates,
    stats,
    loading,
    error,
    pagination,
    fetchCertificates,
    fetchStats,
    refetch,
  };
}
