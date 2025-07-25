"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CompanyDashboard() {
  const { session } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Empresa</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {session?.user?.name || "Administrador de Empresa"}
        </p>
        {session?.currentCompany && (
          <p className="text-gray-500 mt-1">
            Empresa: {session.currentCompany.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Empleados</CardTitle>
            <CardDescription>Gestionar empleados de la empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">Empleados activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cursos</CardTitle>
            <CardDescription>Cursos de la empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Cursos creados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscripciones</CardTitle>
            <CardDescription>Inscripciones a cursos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Inscripciones activas</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Permisos del Usuario</CardTitle>
            <CardDescription>Permisos asignados a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {session?.permissions?.map((permission) => (
                <span
                  key={permission}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {permission}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
