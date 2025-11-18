"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { PaginationInfo } from "@/app/types";
import { safeLocalStorage } from "@/lib/storage";

export interface CompanyEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive";
  joinedAt: string;
  coursesCompleted: number;
  certificates: number;
  avatar: string;
  lastLoginAt?: Date;
}

export interface CompanyStats {
  totalEmployees: number;
  activeEmployees: number;
  totalCoursesCompleted: number;
  totalCertificates: number;
}

export interface EmployeesFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface EmployeesResponse {
  employees: CompanyEmployee[];
  stats: CompanyStats;
  pagination: PaginationInfo;
}

interface UseCompanyEmployeesReturn {
  employees: CompanyEmployee[];
  stats: CompanyStats | null;
  loading: boolean;
  error: string | null;
  filters: EmployeesFilters;
  setFilters: (filters: Partial<EmployeesFilters>) => void;
  refreshEmployees: () => Promise<void>;
  clearError: () => void;
  pagination: PaginationInfo | null;
}

export function useCompanyEmployees(): UseCompanyEmployeesReturn {
  const { session } = useAuth();
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filters, setFiltersState] = useState<EmployeesFilters>({
    search: "",
    status: "",
    sortBy: "joinedAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const getToken = () => {
    return safeLocalStorage.getItem("accessToken");
  };

  const buildQueryString = (filters: EmployeesFilters): string => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());

    return params.toString();
  };

  const fetchEmployees = useCallback(
    async (currentFilters: EmployeesFilters) => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token && !session) {
          throw new Error("No hay token de autenticación");
        }

        const queryString = buildQueryString(currentFilters);
        const url = `/api/company/employees${
          queryString ? `?${queryString}` : ""
        }`;

        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener empleados");
        }

        const result = await response.json();

        if (result.success) {
          setEmployees(result.data.employees);
          setStats(result.data.stats);
          setPagination(result.data.pagination);
        } else {
          throw new Error(result.error || "Error al obtener empleados");
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const setFilters = useCallback(
    (newFilters: Partial<EmployeesFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFiltersState(updatedFilters);
      fetchEmployees(updatedFilters);
    },
    [filters, fetchEmployees]
  );

  const refreshEmployees = useCallback(async () => {
    await fetchEmployees(filters);
  }, [fetchEmployees, filters]);

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    if (session) {
      fetchEmployees(filters);
    }
  }, [session, fetchEmployees]);

  return {
    employees,
    stats,
    loading,
    error,
    filters,
    setFilters,
    refreshEmployees,
    clearError,
    pagination,
  };
}
