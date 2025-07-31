"use client";

import { CourseAdminGuard } from "./_components/CourseAdminGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Datos de ejemplo para mostrar la funcionalidad
const mockCourses = [
  {
    id: "1",
    name: "Introducción a React",
    description: "Aprende los fundamentos de React desde cero",
    category: "Programación",
    level: "Básico",
    status: "Publicado",
    modules: 4,
    lessons: 12,
    validLessons: 12,
    visibility: "Público",
    estimatedDuration: "8 horas",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Diseño UX Avanzado",
    description: "Técnicas avanzadas de diseño de experiencia de usuario",
    category: "Diseño",
    level: "Avanzado",
    status: "Borrador",
    modules: 6,
    lessons: 18,
    validLessons: 15,
    visibility: "Empresas específicas",
    estimatedDuration: "12 horas",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Marketing Digital",
    description: "Estrategias efectivas de marketing en línea",
    category: "Marketing",
    level: "Intermedio",
    status: "Publicado",
    modules: 5,
    lessons: 20,
    validLessons: 20,
    visibility: "Público",
    estimatedDuration: "10 horas",
    createdAt: "2024-01-05",
  },
];

export default function AdminCoursesPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publicado":
        return "bg-green-100 text-green-800";
      case "Borrador":
        return "bg-yellow-100 text-yellow-800";
      case "Archivado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Básico":
        return "bg-blue-100 text-blue-800";
      case "Intermedio":
        return "bg-orange-100 text-orange-800";
      case "Avanzado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "Público":
        return <Users className="w-4 h-4" />;
      case "Privado":
        return <Eye className="w-4 h-4" />;
      case "Empresas específicas":
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <CourseAdminGuard>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Cursos
              </h1>
              <p className="text-gray-600 mt-2">
                Crea, edita y gestiona todos los cursos del sistema
              </p>
            </div>
            <Link href="/workspace/admin/courses/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear Curso
              </Button>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Cursos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockCourses.length}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Publicados
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockCourses.filter((c) => c.status === "Publicado").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Borradores
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {mockCourses.filter((c) => c.status === "Borrador").length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Lecciones
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {mockCourses.reduce((total, c) => total + c.lessons, 0)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
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

        {/* Tabla de cursos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cursos</CardTitle>
            <CardDescription>
              Todos los cursos disponibles en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Curso</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Categoría
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Nivel</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Contenido
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Visibilidad
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockCourses.map((course) => (
                    <tr key={course.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium">{course.name}</span>
                            <p className="text-sm text-gray-500">
                              {course.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Creado: {course.createdAt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${getLevelColor(
                            course.level
                          )}`}
                        >
                          {course.level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                            course.status
                          )}`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <span>{course.modules} módulos</span>
                            <span className="text-gray-400">•</span>
                            <span>{course.lessons} lecciones</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{course.estimatedDuration}</span>
                            <span className="text-gray-400">•</span>
                            <span
                              className={
                                course.validLessons === course.lessons
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }
                            >
                              {course.validLessons}/{course.lessons} válidas
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getVisibilityIcon(course.visibility)}
                          <span className="text-sm">{course.visibility}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </CourseAdminGuard>
  );
}
