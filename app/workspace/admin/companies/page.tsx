"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAdminCompanies } from "@/hooks/use-admin-companies";
import { useDebounce } from "@/hooks/use-debounce";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Building2, Edit, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminCompaniesPage() {
  const { isAdmin } = useAdmin();
  const { companies, loading, error, pagination, fetchCompanies, deleteCompany } = useAdminCompanies();

  // ===== ESTADO DE FILTROS =====
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // ===== DEBOUNCE DE LA BÚSQUEDA =====
  const debouncedSearch = useDebounce(searchTerm, 500);

  // ===== EFECTO PARA BÚSQUEDA EN TIEMPO REAL =====
  useEffect(() => {
    const filters: {
      search: string;
      page: number;
      industry?: string;
      plan?: string;
      isActive?: boolean;
    } = {
      search: debouncedSearch,
      page: 1, // Reset a la primera página cuando se busca
    };

    if (industryFilter) filters.industry = industryFilter;
    if (planFilter) filters.plan = planFilter;
    if (statusFilter) {
      filters.isActive = statusFilter === "active";
    }

    fetchCompanies(filters);
  }, [debouncedSearch, industryFilter, planFilter, statusFilter, fetchCompanies]);

  // ===== FUNCIÓN PARA LIMPIAR FILTROS =====
  const clearFilters = () => {
    setSearchTerm("");
    setIndustryFilter("");
    setPlanFilter("");
    setStatusFilter("");
  };

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
            <p className="text-gray-600 mt-2">
              Gestiona todas las empresas registradas
            </p>
          </div>
          <Link href="/workspace/admin/companies/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Empresa
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUT, email o teléfono..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              {(searchTerm || industryFilter || planFilter || statusFilter) && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Filtros avanzados */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industria
                  </label>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las industrias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las industrias</SelectItem>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Finanzas">Finanzas</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Manufactura">Manufactura</SelectItem>
                      <SelectItem value="Servicios">Servicios</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan
                  </label>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los planes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los planes</SelectItem>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      <SelectItem value="active">Activas</SelectItem>
                      <SelectItem value="inactive">Inactivas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de empresas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            {loading ? "Cargando empresas..." : `${pagination.total} empresas encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium">RUT</th>
                  <th className="text-left py-3 px-4 font-medium">Industria</th>
                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <span className="font-medium">{company.name}</span>
                            <p className="text-sm text-gray-500">
                              {company.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{company.rut}</td>
                      <td className="py-3 px-4">{company.industry}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{company.subscriptionPlan}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={company.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {company.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link href={`/workspace/admin/companies/${company.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => deleteCompany(company.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
