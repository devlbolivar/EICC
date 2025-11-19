"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  Play,
  Clock,
  Users,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { Course } from "@/app/types";

const CompanyCourses = () => {
  const { courses, loading, error, fetchCourses } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses({
      page: 1,
      limit: 20,
      search: searchTerm,
      category: selectedCategory,
      level: selectedLevel,
    });
  }, [fetchCourses, searchTerm, selectedCategory, selectedLevel]);

  // Simple statistics based on courses
  const _stats = {
    totalCourses: courses.length,
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Básico":
        return "bg-green-100 text-green-800";
      case "Intermedio":
        return "bg-yellow-100 text-yellow-800";
      case "Avanzado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const _getEnrollmentProgress = (enrolled: number, total: number) => {
    return (enrolled / total) * 100;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Cursos Disponibles</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Cargando cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Cursos Disponibles</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchCourses()}>Reintentar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Cursos Disponibles</h1>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar cursos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todas las categorías</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Gestión">Gestión</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Marketing">Marketing</option>
                <option value="Finanzas">Finanzas</option>
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todos los niveles</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cursos */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay cursos disponibles
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory || selectedLevel
              ? "No se encontraron cursos con los filtros aplicados"
              : "Aún no hay cursos disponibles para tu empresa"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <Link
              key={course.id}
              href={`/workspace/company/courses/${course.id}`}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <Image
                    src={course.bannerImage || "/online-education.png"}
                    alt={course.name}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                  {course.status === "Publicado" && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Publicado
                    </Badge>
                  )}
                  {course.includeVideos && (
                    <Badge className="absolute top-2 left-2 bg-blue-500">
                      Con Videos
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge className={getDifficultyColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {course.estimatedDuration || "Duración no especificada"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>{course.numberOfChapters} módulos</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Estado</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(
                          course.status
                        )}`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Visibilidad</span>
                      <span className="text-xs text-gray-500">
                        {course.visibility}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Ver Curso
                    </Button>
                    <Button variant="outline" size="sm">
                      Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficios para tu Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Acceso Ilimitado</h3>
              <p className="text-sm text-muted-foreground">
                Todos tus empleados tienen acceso a todos los cursos disponibles
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Certificados</h3>
              <p className="text-sm text-muted-foreground">
                Los empleados reciben certificados al completar los cursos
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Seguimiento</h3>
              <p className="text-sm text-muted-foreground">
                Monitorea el progreso y rendimiento de todos los empleados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyCourses;
