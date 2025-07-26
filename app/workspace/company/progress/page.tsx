"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Search,
  Filter,
  Users,
  BookOpen,
  Award,
  Calendar,
  Download,
} from "lucide-react";

const CompanyProgress = () => {
  // Datos de ejemplo - en una implementación real vendrían de la API
  const employees = [
    {
      id: "1",
      name: "María González",
      email: "maria.gonzalez@techcorp.cl",
      role: "Desarrollador Senior",
      totalCourses: 8,
      completedCourses: 6,
      inProgressCourses: 2,
      certificates: 5,
      lastActivity: "2024-01-15",
      averageScore: 92,
      avatar: "MG",
    },
    {
      id: "2",
      name: "Juan Pérez",
      email: "juan.perez@techcorp.cl",
      role: "Project Manager",
      totalCourses: 6,
      completedCourses: 4,
      inProgressCourses: 2,
      certificates: 3,
      lastActivity: "2024-01-14",
      averageScore: 88,
      avatar: "JP",
    },
    {
      id: "3",
      name: "Ana López",
      email: "ana.lopez@techcorp.cl",
      role: "UX Designer",
      totalCourses: 10,
      completedCourses: 8,
      inProgressCourses: 2,
      certificates: 7,
      lastActivity: "2024-01-15",
      averageScore: 95,
      avatar: "AL",
    },
    {
      id: "4",
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@techcorp.cl",
      role: "QA Engineer",
      totalCourses: 5,
      completedCourses: 2,
      inProgressCourses: 3,
      certificates: 1,
      lastActivity: "2024-01-13",
      averageScore: 78,
      avatar: "CR",
    },
  ];

  const getProgressPercentage = (completed: number, total: number) => {
    return (completed / total) * 100;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90)
      return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 80)
      return <Badge className="bg-yellow-100 text-yellow-800">Bueno</Badge>;
    return <Badge className="bg-red-100 text-red-800">Necesita mejorar</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Progreso de Empleados</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empleados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Empleados activos</p>
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
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio de Puntuación
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% vs mes anterior
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
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
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
                <Input placeholder="Buscar empleados..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrar por Rol
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrar por Progreso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de empleados con progreso */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Individual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="border rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                      {employee.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.role}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {employee.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getScoreColor(
                        employee.averageScore
                      )}`}
                    >
                      {employee.averageScore}%
                    </div>
                    {getScoreBadge(employee.averageScore)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {employee.totalCourses}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Cursos
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {employee.completedCourses}
                    </div>
                    <p className="text-sm text-muted-foreground">Completados</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {employee.inProgressCourses}
                    </div>
                    <p className="text-sm text-muted-foreground">En Progreso</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {employee.certificates}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Certificados
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso General</span>
                    <span>
                      {Math.round(
                        getProgressPercentage(
                          employee.completedCourses,
                          employee.totalCourses
                        )
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={getProgressPercentage(
                      employee.completedCourses,
                      employee.totalCourses
                    )}
                    className="h-3"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Última actividad:{" "}
                      {new Date(employee.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progreso por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Desarrollo</span>
                <div className="flex items-center gap-2">
                  <Progress value={85} className="w-24 h-2" />
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Gestión</span>
                <div className="flex items-center gap-2">
                  <Progress value={72} className="w-24 h-2" />
                  <span className="text-sm font-medium">72%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Diseño</span>
                <div className="flex items-center gap-2">
                  <Progress value={91} className="w-24 h-2" />
                  <span className="text-sm font-medium">91%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">QA</span>
                <div className="flex items-center gap-2">
                  <Progress value={68} className="w-24 h-2" />
                  <span className="text-sm font-medium">68%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    María González completó &quot;Seguridad Informática&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Juan Pérez inició &quot;Gestión de Proyectos&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Ana López obtuvo certificado en &quot;Liderazgo&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 1 día</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Carlos Rodríguez completó 50% de &quot;Análisis de
                    Datos&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 2 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProgress;
