"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Calendar,
  BookOpen,
  Award,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyEmployees } from "@/hooks/use-company-employees";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CompanyEmployees = () => {
  const {
    employees,
    stats,
    loading,
    error,
    filters,
    setFilters,
    refreshEmployees,
    clearError,
    pagination,
  } = useCompanyEmployees();

  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters({ search: value, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ status: status === "all" ? "" : status, page: 1 });
  };

  const handleSort = (sortBy: string) => {
    const currentOrder = filters.sortOrder || "desc";
    const newOrder =
      filters.sortBy === sortBy && currentOrder === "desc" ? "asc" : "desc";
    setFilters({ sortBy, sortOrder: newOrder as "asc" | "desc" });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
        );
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Empleados</h1>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() =>
            (window.location.href = "/workspace/company/employees/invite")
          }
        >
          <UserPlus className="w-4 h-4" />
          Invitar Empleado
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empleados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.totalEmployees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Cargando..." : "Empleados registrados"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.activeEmployees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Cargando..."
                : stats
                ? `${Math.round(
                    (stats.activeEmployees / stats.totalEmployees) * 100
                  )}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cursos Completados
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.totalCoursesCompleted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Cargando..." : "Total completados"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.totalCertificates || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Cargando..." : "Total emitidos"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar empleados..."
                  className="pl-10"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => handleSort("name")}
                className="flex items-center gap-2"
              >
                Ordenar
                {filters.sortBy === "name" && (
                  <span className="text-xs">
                    {filters.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={refreshEmployees}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">
                  Error al cargar empleados
                </p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="ml-auto"
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de empleados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Lista de Empleados
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Cargando empleados...</p>
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                No se encontraron empleados
              </p>
              <p className="text-sm text-muted-foreground">
                {filters.search || filters.status
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Invita empleados para comenzar"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                      {employee.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.role}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {employee.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {employee.joinedAt
                            ? new Date(employee.joinedAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm">
                        <BookOpen className="w-4 h-4" />
                        <span>{employee.coursesCompleted}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Cursos</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="w-4 h-4" />
                        <span>{employee.certificates}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Certificados
                      </p>
                    </div>

                    {getStatusBadge(employee.status)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver progreso</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Desactivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                de {pagination.total} empleados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyEmployees;
