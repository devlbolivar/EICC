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
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyCertificates } from "@/hooks/use-company-certificates";
import { toast } from "sonner";
import type { CompanyCertificate } from "@/hooks/use-company-certificates";

const CompanyCertificates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CompanyCertificate | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleViewCertificate = (certificate: CompanyCertificate) => {
    setSelectedCertificate(certificate);
    setViewDialogOpen(true);
  };

  const handleDownloadCertificate = async (certificate: CompanyCertificate) => {
    try {
      setActionLoading(true);

      // Si ya tiene URL de certificado, descargar directamente
      if (certificate.certificateUrl) {
        window.open(certificate.certificateUrl, "_blank");
        toast.success("Certificado abierto en nueva pestaña");
        return;
      }

      // Si no, generar el certificado
      const response = await fetch(`/api/certificates/${certificate.id}/download`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al descargar el certificado");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado-${certificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Certificado descargado exitosamente");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Error al descargar el certificado");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewCertificate = async (certificate: CompanyCertificate) => {
    try {
      setActionLoading(true);

      const response = await fetch(`/api/certificates/${certificate.id}/renew`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al renovar el certificado");
      }

      toast.success("Certificado renovado exitosamente");
      fetchCertificates();
      fetchStats();
    } catch (error) {
      console.error("Error renewing certificate:", error);
      toast.error(error instanceof Error ? error.message : "Error al renovar el certificado");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCertificates = async () => {
    try {
      setActionLoading(true);

      const headers = ["ID Certificado", "Empleado", "Email", "Curso", "Puntuación", "Fecha Emisión", "Fecha Vencimiento", "Estado"];
      const csvData = certificates.map(cert => {
        const issuedDate = new Date(cert.issuedDate);
        const expiryDate = new Date(issuedDate.getTime() + 365 * 24 * 60 * 60 * 1000);

        return [
          cert.certificateId,
          cert.user_name,
          cert.user_email,
          cert.course_name,
          cert.grade.toString(),
          issuedDate.toLocaleDateString(),
          expiryDate.toLocaleDateString(),
          cert.isActive ? "Activo" : "Expirado"
        ];
      });

      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `certificados-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Certificados exportados exitosamente");
    } catch (error) {
      console.error("Error exporting certificates:", error);
      toast.error("Error al exportar certificados");
    } finally {
      setActionLoading(false);
    }
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
        <Button
          className="flex items-center gap-2"
          onClick={handleExportCertificates}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar Certificados
            </>
          )}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCertificate(certificate)}
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCertificate(certificate)}
                        disabled={actionLoading}
                        title="Descargar certificado"
                      >
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

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRenewCertificate(certificate)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Renovar
                          </>
                        )}
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

      {/* Diálogo de Vista de Certificado */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Certificado</DialogTitle>
            <DialogDescription>
              Información completa del certificado
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ID Certificado</h4>
                  <p className="text-lg font-semibold">{selectedCertificate.certificateId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                  {getStatusBadge(selectedCertificate.isActive)}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Empleado</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    {getInitials(selectedCertificate.user_name)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedCertificate.user_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCertificate.user_email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Curso</h4>
                <p className="font-medium">{selectedCertificate.course_name}</p>
                {selectedCertificate.course_description && (
                  <p className="text-sm text-muted-foreground">{selectedCertificate.course_description}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedCertificate.course_category}</Badge>
                  <Badge variant="outline">{selectedCertificate.course_level}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Puntuación</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedCertificate.grade)}`}>
                    {selectedCertificate.grade}%
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Duración</h4>
                  <p className="text-lg font-medium">{selectedCertificate.duration || selectedCertificate.course_duration || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha de Emisión</h4>
                  <p className="font-medium">{new Date(selectedCertificate.issuedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha de Vencimiento</h4>
                  <p className="font-medium">
                    {new Date(
                      new Date(selectedCertificate.issuedDate).getTime() + 365 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleDownloadCertificate(selectedCertificate)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Certificado
                </Button>
                {!selectedCertificate.isActive && (
                  <Button
                    onClick={() => {
                      handleRenewCertificate(selectedCertificate);
                      setViewDialogOpen(false);
                    }}
                    disabled={actionLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renovar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyCertificates;
