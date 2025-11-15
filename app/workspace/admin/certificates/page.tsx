"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAdminCertificates } from "@/hooks/use-admin-certificates";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Award, User, BookOpen, Download, Loader2 } from "lucide-react";

export default function AdminCertificatesPage() {
  const { isAdmin } = useAdmin();
  const { certificates, loading, error } = useAdminCertificates();

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificaciones</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas las certificaciones emitidas
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar certificaciones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de certificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Certificaciones</CardTitle>
          <CardDescription>
            Todas las certificaciones emitidas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error: {error}
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay certificaciones emitidas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">
                      Estudiante
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Curso</th>
                    <th className="text-left py-3 px-4 font-medium">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Calificación
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((certificate) => (
                    <tr key={certificate.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <span className="font-medium">{certificate.userName}</span>
                            <p className="text-sm text-gray-500">
                              {certificate.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>{certificate.courseName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{certificate.companyName || "Sin empresa"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{certificate.grade}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Completado
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">
                          {new Date(certificate.issuedDate).toLocaleDateString('es-ES')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {certificate.certificateUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(certificate.certificateUrl!, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">No disponible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
