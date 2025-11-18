import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PaginationInfo } from "@/app/types";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  age?: number;
  subscriptionId?: string;
  roles: Array<{
    role: string;
    company: string;
    companyId?: string;
  }>;
  primaryRole: string;
}

interface UserDetail {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  age?: number;
  subscriptionId?: string;
  userCompanies: Array<{
    id: string;
    role: {
      id: string;
      name: string;
      description?: string;
      permissions: string[];
    };
    company?: {
      id: string;
      name: string;
      description?: string;
    };
    isActive: boolean;
    joinedAt: Date;
    acceptedAt?: Date;
    invitedBy?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  subscriptionPlan: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  companyId?: string;
  age?: number;
  subscriptionId?: string;
  isActive?: boolean;
}

interface UpdateUserData {
  name: string;
  email: string;
  isActive?: boolean;
  age?: number;
  subscriptionId?: string;
}

interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

interface UseAdminUsersReturn {
  // Estado
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;

  // Filtros
  filters: {
    search: string;
    role: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };

  // Acciones
  fetchUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<UserDetail>;
  updateUser: (userId: string, userData: UpdateUserData) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getUser: (userId: string) => Promise<UserDetail>;
  getRoles: () => Promise<Role[]>;
  getCompanies: () => Promise<Company[]>;

  // Utilidades
  setFilters: (
    filters: Partial<{
      search: string;
      role: string;
      status: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    }>
  ) => void;
  clearError: () => void;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const { session } = useAuth();

  // Obtener token del localStorage o usar cookies
  const getToken = (): string | null => {
    // Intentar obtener del localStorage primero
    const token = localStorage.getItem("accessToken");
    if (token) return token;

    // Si no hay token en localStorage, las cookies se enviarán automáticamente
    // en las peticiones HTTP, así que retornamos null para usar cookies
    return null;
  };
  const [users, setUsers] = useState<User[]>([]);
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
  const [filters, setFiltersState] = useState({
    search: "",
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const clearError = () => setError(null);

  const fetchUsers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const token = getToken();
    if (!token && !session) return;

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      const page = params?.page || pagination.page;
      const limit = params?.limit || pagination.limit;
      const search = params?.search ?? filters.search;
      const role = params?.role ?? filters.role;
      const status = params?.status ?? filters.status;
      const sortBy = params?.sortBy ?? filters.sortBy;
      const sortOrder = params?.sortOrder ?? filters.sortOrder;

      searchParams.append("page", page.toString());
      searchParams.append("limit", limit.toString());
      if (search) searchParams.append("search", search);
      if (role) searchParams.append("role", role);
      if (status) searchParams.append("status", status);
      if (sortBy) searchParams.append("sortBy", sortBy);
      if (sortOrder) searchParams.append("sortOrder", sortOrder);

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/admin/users?${searchParams}`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener usuarios");
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);

      // Actualizar filtros si se proporcionaron nuevos parámetros
      if (params) {
        setFiltersState((prev) => ({
          ...prev,
          search: search,
          role: role,
          status: status,
          sortBy: sortBy,
          sortOrder: sortOrder,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData): Promise<UserDetail> => {
    const token = getToken();
    if (!token && !session) throw new Error("No hay token de autenticación");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/admin/users/create", {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear usuario");
    }

    const data = await response.json();
    return data.user;
  };

  const updateUser = async (
    userId: string,
    userData: UpdateUserData
  ): Promise<void> => {
    const token = getToken();
    if (!token && !session) throw new Error("No hay token de autenticación");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar usuario");
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    const token = getToken();
    if (!token && !session) throw new Error("No hay token de autenticación");

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar usuario");
    }
  };

  const getUser = async (userId: string): Promise<UserDetail> => {
    const token = getToken();
    if (!token && !session) throw new Error("No hay token de autenticación");

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al obtener usuario");
    }

    const data = await response.json();
    return data;
  };

  const getRoles = async (): Promise<Role[]> => {
    const token = getToken();
    if (!token && !session) throw new Error("No hay token de autenticación");

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/admin/roles", {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al obtener roles");
    }

    const data = await response.json();
    return data.roles;
  };

  const getCompanies = async (): Promise<Company[]> => {
    const token = getToken();
    if (!token && !session) throw new Error("No hay token de autenticación");

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/admin/companies", {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al obtener empresas");
    }

    const data = await response.json();
    return data.companies;
  };

  const setFilters = (
    newFilters: Partial<{
      search: string;
      role: string;
      status: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    }>
  ) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [session]);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getRoles,
    getCompanies,
    setFilters,
    clearError,
  };
}
