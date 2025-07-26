"use client";

import React from "react";
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
} from "lucide-react";

const CompanyCertificates = () => {
  // Datos de ejemplo - en una implementación real vendrían de la API
  const certificates = [
    {
      id: "1",
      employeeName: "María González",
      employeeEmail: "maria.gonzalez@techcorp.cl",
      courseName: "Seguridad Informática",
      issuedDate: "2024-01-15",
      expiryDate: "2025-01-15",
      status: "active",
      score: 95,
      certificateId: "CERT-2024-001",
      avatar: "MG",
    },
    {
      id: "2",
      employeeName: "Juan Pérez",
      employeeEmail: "juan.perez@techcorp.cl",
      courseName: "Gestión de Proyectos",
      issuedDate: "2024-01-10",
      expiryDate: "2025-01-10",
      status: "active",
      score: 88,
      certificateId: "CERT-2024-002",
      avatar: "JP",
    },
    {
      id: "3",
      employeeName: "Ana López",
      employeeEmail: "ana.lopez@techcorp.cl",
      courseName: "Liderazgo y Comunicación",
      issuedDate: "2024-01-12",
      expiryDate: "2025-01-12",
      status: "active",
      score: 92,
      certificateId: "CERT-2024-003",
      avatar: "AL",
    },
    {
      id: "4",
      employeeName: "Carlos Rodríguez",
      employeeEmail: "carlos.rodriguez@techcorp.cl",
      courseName: "Análisis de Datos",
      issuedDate: "2023-12-20",
      expiryDate: "2024-12-20",
      status: "expired",
      score: 78,
      certificateId: "CERT-2023-045",
      avatar: "CR",
    },
    {
      id: "5",
      employeeName: "Laura Martínez",
      employeeEmail: "laura.martinez@techcorp.cl",
      courseName: "Desarrollo Web",
      issuedDate: "2024-01-08",
      expiryDate: "2025-01-08",
      status: "pending",
      score: 85,
      certificateId: "CERT-2024-004",
      avatar: "LM",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

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
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Emitidos este año</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">91% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
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
            <div className="text-2xl font-bold">87.5%</div>
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
                <Input placeholder="Buscar certificados..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrar por Estado
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrar por Curso
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
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  isExpiringSoon(certificate.expiryDate)
                    ? "border-yellow-200 bg-yellow-50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    {certificate.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {certificate.employeeName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {certificate.employeeEmail}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {certificate.courseName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div
                      className={`text-lg font-bold ${getScoreColor(
                        certificate.score
                      )}`}
                    >
                      {certificate.score}%
                    </div>
                    <p className="text-xs text-muted-foreground">Puntuación</p>
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
                      {new Date(certificate.expiryDate).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fecha Vencimiento
                    </p>
                  </div>

                  {getStatusBadge(certificate.status)}

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
              .filter((cert) => isExpiringSoon(cert.expiryDate))
              .map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                      {certificate.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {certificate.employeeName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {certificate.courseName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-yellow-600">
                        {Math.ceil(
                          (new Date(certificate.expiryDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        días
                      </div>
                      <p className="text-xs text-muted-foreground">Restantes</p>
                    </div>

                    <Button variant="outline" size="sm">
                      Renovar
                    </Button>
                  </div>
                </div>
              ))}

            {certificates.filter((cert) => isExpiringSoon(cert.expiryDate))
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
