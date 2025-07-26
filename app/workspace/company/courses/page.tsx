"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Search,
  Filter,
  Play,
  Clock,
  Users,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";

const CompanyCourses = () => {
  // Datos de ejemplo - en una implementación real vendrían de la API
  const courses = [
    {
      id: "1",
      title: "Seguridad Informática",
      description:
        "Aprende los fundamentos de la seguridad informática y protección de datos",
      category: "Tecnología",
      difficulty: "Intermedio",
      duration: "8 horas",
      enrolledEmployees: 18,
      totalEmployees: 24,
      rating: 4.8,
      isPopular: true,
      hasCertificate: true,
      image: "/online-education.png",
    },
    {
      id: "2",
      title: "Gestión de Proyectos",
      description:
        "Metodologías y herramientas para la gestión efectiva de proyectos",
      category: "Gestión",
      difficulty: "Avanzado",
      duration: "12 horas",
      enrolledEmployees: 15,
      totalEmployees: 24,
      rating: 4.6,
      isPopular: false,
      hasCertificate: true,
      image: "/online-education.png",
    },
    {
      id: "3",
      title: "Liderazgo y Comunicación",
      description:
        "Desarrolla habilidades de liderazgo y comunicación efectiva",
      category: "Soft Skills",
      difficulty: "Básico",
      duration: "6 horas",
      enrolledEmployees: 22,
      totalEmployees: 24,
      rating: 4.9,
      isPopular: true,
      hasCertificate: true,
      image: "/online-education.png",
    },
    {
      id: "4",
      title: "Análisis de Datos",
      description: "Introducción al análisis de datos y visualización",
      category: "Tecnología",
      difficulty: "Intermedio",
      duration: "10 horas",
      enrolledEmployees: 12,
      totalEmployees: 24,
      rating: 4.5,
      isPopular: false,
      hasCertificate: true,
      image: "/online-education.png",
    },
  ];

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

  const getEnrollmentProgress = (enrolled: number, total: number) => {
    return (enrolled / total) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Cursos Disponibles</h1>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para tu empresa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empleados Inscritos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">
              Inscripciones totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio de Completado
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              Tasa de finalización
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certificados Emitidos
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Este año</p>
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
                <Input placeholder="Buscar cursos..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categoría
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Dificultad
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative">
              <Image
                src={course.image}
                alt={course.title}
                width={400}
                height={192}
                className="w-full h-48 object-cover"
              />
              {course.isPopular && (
                <Badge className="absolute top-2 right-2 bg-orange-500">
                  Popular
                </Badge>
              )}
              {course.hasCertificate && (
                <Badge className="absolute top-2 left-2 bg-blue-500">
                  Certificado
                </Badge>
              )}
            </div>

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline">{course.category}</Badge>
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{course.rating}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Empleados inscritos</span>
                  <span>
                    {course.enrolledEmployees}/{course.totalEmployees}
                  </span>
                </div>
                <Progress
                  value={getEnrollmentProgress(
                    course.enrolledEmployees,
                    course.totalEmployees
                  )}
                  className="h-2"
                />
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
        ))}
      </div>

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
