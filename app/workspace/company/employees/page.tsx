"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Calendar,
  BookOpen,
  Award,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CompanyEmployees = () => {
  // Datos de ejemplo - en una implementación real vendrían de la API
  const employees = [
    {
      id: "1",
      name: "María González",
      email: "maria.gonzalez@techcorp.cl",
      phone: "+56 9 1234 5678",
      role: "Desarrollador Senior",
      status: "active",
      joinedAt: "2023-01-15",
      coursesCompleted: 8,
      certificates: 5,
      avatar: "MG",
    },
    {
      id: "2",
      name: "Juan Pérez",
      email: "juan.perez@techcorp.cl",
      phone: "+56 9 2345 6789",
      role: "Project Manager",
      status: "active",
      joinedAt: "2023-03-20",
      coursesCompleted: 6,
      certificates: 3,
      avatar: "JP",
    },
    {
      id: "3",
      name: "Ana López",
      email: "ana.lopez@techcorp.cl",
      phone: "+56 9 3456 7890",
      role: "UX Designer",
      status: "active",
      joinedAt: "2023-02-10",
      coursesCompleted: 10,
      certificates: 7,
      avatar: "AL",
    },
    {
      id: "4",
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@techcorp.cl",
      phone: "+56 9 4567 8901",
      role: "QA Engineer",
      status: "pending",
      joinedAt: "2024-01-05",
      coursesCompleted: 2,
      certificates: 1,
      avatar: "CR",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
        );
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Empleados</h1>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invitar Empleado
        </Button>
      </div>

      {/* Estadísticas */}
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
            <p className="text-xs text-muted-foreground">+2 este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div>
            <p className="text-xs text-muted-foreground">91.7% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Por confirmar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Cursos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5</div>
            <p className="text-xs text-muted-foreground">Por empleado</p>
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
            <Button variant="outline">Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de empleados */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    {employee.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.role}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(employee.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm">
                      <BookOpen className="w-4 h-4" />
                      <span>{employee.coursesCompleted}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Cursos</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm">
                      <Award className="w-4 h-4" />
                      <span>{employee.certificates}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Certificados
                    </p>
                  </div>

                  {getStatusBadge(employee.status)}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver progreso</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Desactivar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyEmployees;
