"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Award, Building2 } from "lucide-react";

const CompanyDashboard = () => {
  // Datos de ejemplo - en una implementación real vendrían de la API
  const stats = [
    {
      title: "Total Empleados",
      value: "24",
      icon: Users,
      description: "Empleados activos",
    },
    {
      title: "Cursos Disponibles",
      value: "12",
      icon: BookOpen,
      description: "Cursos para tu empresa",
    },
    {
      title: "Progreso Promedio",
      value: "78%",
      icon: TrendingUp,
      description: "Completado por empleados",
    },
    {
      title: "Certificados",
      value: "156",
      icon: Award,
      description: "Certificados emitidos",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Dashboard de Empresa</h1>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contenido adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">
                  María González completó el curso &quot;Seguridad
                  Informática&quot;
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">
                  Juan Pérez se inscribió en &quot;Gestión de Proyectos&quot;
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">
                  Ana López obtuvo certificado en &quot;Liderazgo&quot;
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Plan Premium</span>
                <span className="text-sm text-muted-foreground">15 días</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Certificados por renovar</span>
                <span className="text-sm text-muted-foreground">
                  8 empleados
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cursos por completar</span>
                <span className="text-sm text-muted-foreground">
                  12 empleados
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
