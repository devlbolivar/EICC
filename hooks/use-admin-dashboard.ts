import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardData, UseAdminDashboardReturn } from "@/app/types";
import { UI_TEXT } from "@/lib/constants";

export function useAdminDashboard(): UseAdminDashboardReturn {
  const { session } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el token de acceso desde las cookies
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        credentials: "include", // Incluir cookies automáticamente
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || UI_TEXT.COMMON.DASHBOARD_ERROR);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error(UI_TEXT.LOGS.FETCH_DASHBOARD, err);
      setError(
        err instanceof Error ? err.message : UI_TEXT.COMMON.UNKNOWN_ERROR
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
