"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAdminEnrollments } from "@/hooks/use-admin-enrollments";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, User, BookOpen, Loader2 } from "lucide-react";

export default function AdminEnrollmentsPage() {
  const { isAdmin } = useAdmin();
  const { enrollments, loading, error } = useAdminEnrollments();

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matrículas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas las inscripciones a cursos
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
                placeholder="Buscar matrículas..."
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

      {/* Tabla de matrículas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Matrículas</CardTitle>
          <CardDescription>
            Todas las inscripciones a cursos en el sistema
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
          ) : enrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay matrículas registradas
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
                    <th className="text-left py-3 px-4 font-medium">Progreso</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <span className="font-medium">{enrollment.userName}</span>
                            <p className="text-sm text-gray-500">
                              {enrollment.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>{enrollment.courseName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{enrollment.companyName || "Sin empresa"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{enrollment.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 ${enrollment.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} rounded-full text-sm`}>
                          {enrollment.isCompleted ? 'Completado' : 'En progreso'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">
                          {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES')}
                        </span>
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
