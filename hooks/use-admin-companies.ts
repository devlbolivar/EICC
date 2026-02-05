import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { PaginationInfo } from "@/app/types";

interface Company {
  id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  plan: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCompanyData {
  name: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  plan: string;
}

interface UpdateCompanyData {
  name?: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  plan?: string;
  isActive?: boolean;
}

interface CompaniesResponse {
  companies: Company[];
  pagination: PaginationInfo;
}

interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  plan?: string;
  isActive?: boolean;
}

interface UseAdminCompaniesReturn {
  companies: Company[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchCompanies: (params?: CompanyFilters) => Promise<void>;
  createCompany: (companyData: CreateCompanyData) => Promise<Company>;
  updateCompany: (companyId: string, companyData: UpdateCompanyData) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  clearError: () => void;
}

export function useAdminCompanies(): UseAdminCompaniesReturn {
  const { session } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const clearError = () => setError(null);

  const fetchCompanies = useCallback(async (params?: CompanyFilters) => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      const page = params?.page || pagination.page;
      const limit = params?.limit || pagination.limit;
      const search = params?.search ?? "";
      const industry = params?.industry ?? "";
      const plan = params?.plan ?? "";
      const isActive = params?.isActive;

      searchParams.append("page", page.toString());
      searchParams.append("limit", limit.toString());
      if (search) searchParams.append("search", search);
      if (industry) searchParams.append("industry", industry);
      if (plan) searchParams.append("plan", plan);
      if (isActive !== undefined) searchParams.append("isActive", isActive.toString());

      const response = await fetch(`/api/admin/companies?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener empresas");
      }

      const data: CompaniesResponse = await response.json();
      setCompanies(data.companies);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [session, pagination.page, pagination.limit]);

  const createCompany = async (companyData: CreateCompanyData): Promise<Company> => {
    if (!session) throw new Error("No hay token de autenticación");

    const response = await fetch("/api/admin/companies/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear empresa");
    }

    const data = await response.json();
    return data.company;
  };

  const updateCompany = async (
    companyId: string,
    companyData: UpdateCompanyData
  ): Promise<void> => {
    if (!session) throw new Error("No hay token de autenticación");

    const response = await fetch(`/api/admin/companies/${companyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar empresa");
    }
  };

  const deleteCompany = async (companyId: string): Promise<void> => {
    if (!session) throw new Error("No hay token de autenticación");

    const response = await fetch(`/api/admin/companies/${companyId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar empresa");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [session, fetchCompanies]);

  return {
    companies,
    loading,
    error,
    pagination,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    clearError,
  };
}
