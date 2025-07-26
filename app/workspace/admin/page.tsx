"use client";

import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboard() {
  const { session } = useAuth();
  const { isAdmin } = useAdmin();

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/workspace");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Administración
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {session?.user?.name || "Administrador"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Gestionar usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">Usuarios activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Gestionar empresas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Empresas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cursos</CardTitle>
            <CardDescription>Gestionar cursos del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Cursos publicados</p>
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
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
