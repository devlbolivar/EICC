"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useCompanyStatistics } from "@/hooks/use-company-statistics";

const CompanyDashboard = () => {
  const { statistics, loading, error, fetchStatistics } =
    useCompanyStatistics();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Dashboard de Empresa</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Dashboard de Empresa</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error al cargar los datos
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => fetchStatistics()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Empleados",
      value: statistics?.employees?.enrolled?.toString() || "0",
      icon: Users,
      description: "Empleados inscritos",
    },
    {
      title: "Cursos Disponibles",
      value: statistics?.courses?.total?.toString() || "0",
      icon: BookOpen,
      description: "Cursos para tu empresa",
    },
    {
      title: "Progreso Promedio",
      value: `${statistics?.completion?.average?.toFixed(1) || "0"}%`,
      icon: TrendingUp,
      description: "Completado por empleados",
    },
    {
      title: "Certificados",
      value: statistics?.certificates?.total?.toString() || "0",
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

      {/* Resumen de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {statistics?.completion?.average?.toFixed(1) || 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                Tasa de Finalización
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {statistics?.certificates?.lastMonth || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Certificados este mes
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {statistics?.courses?.active || 0}
              </div>
              <p className="text-sm text-muted-foreground">Cursos Activos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {statistics?.employees?.completed || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Cursos Completados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDashboard;
