"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";
import { useStudent } from "@/hooks/use-student";
import { redirect } from "next/navigation";

export default function StudentPage() {
  const { session } = useAuth();

  const { isStudent } = useStudent();

  if (!isStudent) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel del Estudiante
        </h1>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {session?.user?.name || "Estudiante"}
          Welcome to your student dashboard.
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
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Cursos Inscritos
            </CardTitle>
            <CardDescription>Cursos en los que estás inscrito</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">5</p>
            <p className="text-sm text-gray-500">Cursos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Certificados
            </CardTitle>
            <CardDescription>Certificados obtenidos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">3</p>
            <p className="text-sm text-gray-500">Certificados completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Horas de Estudio
            </CardTitle>
            <CardDescription>Tiempo dedicado al aprendizaje</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">24.5h</p>
            <p className="text-sm text-gray-500">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Progreso Promedio
            </CardTitle>
            <CardDescription>Progreso en todos los cursos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">78%</p>
            <p className="text-sm text-gray-500">Promedio general</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Objetivos
            </CardTitle>
            <CardDescription>Metas de aprendizaje</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">2</p>
            <p className="text-sm text-gray-500">Objetivos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Compañeros
            </CardTitle>
            <CardDescription>Estudiantes en tus cursos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">12</p>
            <p className="text-sm text-gray-500">Compañeros activos</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Cursos</CardTitle>
            <CardDescription>
              Tu progreso en los cursos actuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>React Fundamentals</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>TypeScript Avanzado</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Node.js Backend</span>
                  <span>90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Docker & DevOps</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Tus últimas actividades de aprendizaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Completaste React Fundamentals
                  </p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Inscrito en Docker & DevOps
                  </p>
                  <p className="text-xs text-gray-500">Hace 1 día</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Obtuviste certificado TypeScript
                  </p>
                  <p className="text-xs text-gray-500">Hace 3 días</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Completaste evaluación Node.js
                  </p>
                  <p className="text-xs text-gray-500">Hace 5 días</p>
                </div>
              </div>
            </div>
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
