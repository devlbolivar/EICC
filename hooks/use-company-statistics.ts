import { useState, useCallback } from "react";

/**
 * Actividad reciente de un usuario en la empresa.
 * user_name es SIEMPRE presente porque viene de un INNER JOIN con users.
 */
interface RecentActivity {
  type: string;
  /** Nombre del usuario - SIEMPRE presente (JOIN con users) */
  user_name: string;
  /** Nombre del curso - SIEMPRE presente (JOIN con courses) */
  course_name: string;
  activity_date: string;
}

/**
 * Curso popular con conteo de inscripciones.
 */
interface PopularCourseStats {
  id: string;
  name: string;
  bannerImage: string;
  enrollment_count: number;
}

interface CompanyStatistics {
  courses: {
    total: number;
    published: number;
    draft: number;
    active: number;
  };
  employees: {
    enrolled: number;
    totalEnrollments: number;
    completed: number;
  };
  certificates: {
    total: number;
    lastMonth: number;
    lastWeek: number;
  };
  completion: {
    average: number;
  };
  popularCourses: PopularCourseStats[];
  recentActivity: RecentActivity[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useCompanyStatistics() {
  const [statistics, setStatistics] = useState<CompanyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar errores
  const handleError = useCallback((err: any) => {
    console.error("Error en useCompanyStatistics:", err);
    const errorMessage = err?.message || "Error interno del servidor";
    setError(errorMessage);
    return null;
  }, []);

  // Función para hacer requests
  const makeRequest = useCallback(
    async <T>(url: string, options: RequestInit = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        const response = await fetch(url, {
          ...options,
          credentials: "include", // Incluir cookies en la petición
          headers: {
            ...headers,
            ...options.headers,
          },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error en la solicitud");
        }

        return data.data || null;
      } catch (err) {
        return handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // Obtener estadísticas
  const fetchStatistics = useCallback(async () => {
    const result = await makeRequest<CompanyStatistics>(
      "/api/company/statistics"
    );
    if (result) {
      setStatistics(result);
    }
    return result;
  }, [makeRequest]);

  return {
    statistics,
    loading,
    error,
    fetchStatistics,
  };
}
