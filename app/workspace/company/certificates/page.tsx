"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCompanyCertificates } from "@/hooks/use-company-certificates";

const CompanyCertificates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    certificates,
    stats,
    loading,
    error,
    pagination,
    fetchCertificates,
    fetchStats,
  } = useCompanyCertificates({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
    autoFetch: true,
  });

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const isExpiringSoon = (issuedDate: string) => {
    const issued = new Date(issuedDate);
    const expiry = new Date(issued.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from issued date
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: "all" | "active" | "expired") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (loading && !certificates.length) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Certificados</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Certificados</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error al cargar los certificados
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchCertificates()}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Certificados</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Certificados
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Certificados
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Emitidos en total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total
                ? `${Math.round((stats.active / stats.total) * 100)}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.expiringSoon || 0}</div>
            <p className="text-xs text-muted-foreground">
              En los próximos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Puntuación
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Puntuación promedio</p>
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
                  placeholder="Buscar certificados..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => handleStatusFilter("all")}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Todos
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => handleStatusFilter("active")}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Activos
              </Button>
              <Button
                variant={statusFilter === "expired" ? "default" : "outline"}
                onClick={() => handleStatusFilter("expired")}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Expirados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de certificados */}
      <Card>
        <CardHeader>
          <CardTitle>Certificados Emitidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron certificados</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isExpiringSoon(certificate.issuedDate)
                      ? "border-yellow-200 bg-yellow-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                      {getInitials(certificate.user_name)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{certificate.user_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {certificate.user_email}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {certificate.course_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${getScoreColor(
                          certificate.grade
                        )}`}
                      >
                        {certificate.grade}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Puntuación
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {certificate.certificateId}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ID Certificado
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {new Date(certificate.issuedDate).toLocaleDateString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Fecha Emisión
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {new Date(
                          new Date(certificate.issuedDate).getTime() +
                            365 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Fecha Vencimiento
                      </p>
                    </div>

                    {getStatusBadge(certificate.isActive)}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                de {pagination.total} certificados
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificados próximos a vencer */}
      <Card>
        <CardHeader>
          <CardTitle>Certificados Próximos a Vencer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates
              .filter((cert) => isExpiringSoon(cert.issuedDate))
              .map((certificate) => {
                const issuedDate = new Date(certificate.issuedDate);
                const expiryDate = new Date(
                  issuedDate.getTime() + 365 * 24 * 60 * 60 * 1000
                );
                const daysUntilExpiry = Math.ceil(
                  (expiryDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={certificate.id}
                    className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {getInitials(certificate.user_name)}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {certificate.user_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {certificate.course_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-yellow-600">
                          {daysUntilExpiry} días
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Restantes
                        </p>
                      </div>

                      <Button variant="outline" size="sm">
                        Renovar
                      </Button>
                    </div>
                  </div>
                );
              })}

            {certificates.filter((cert) => isExpiringSoon(cert.issuedDate))
              .length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay certificados próximos a vencer</p>
                <p className="text-sm">Todos los certificados están vigentes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información sobre Certificados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Validez</h3>
              <p className="text-sm text-muted-foreground">
                Los certificados tienen una validez de 1 año desde la fecha de
                emisión
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Descarga</h3>
              <p className="text-sm text-muted-foreground">
                Los certificados se pueden descargar en formato PDF para uso
                oficial
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Verificación</h3>
              <p className="text-sm text-muted-foreground">
                Cada certificado tiene un ID único para verificación de
                autenticidad
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyCertificates;
