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
  Loader2,
} from "lucide-react";
import { useStudent } from "@/hooks/use-student";
import { useCourses } from "@/hooks/use-courses";
import { useCertificates } from "@/hooks/use-certificates";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EnrolledCourseResponse } from "@/app/types";

export default function StudentDashboard() {
  const { session } = useAuth();
  const params = useParams();
  const studentId = params.id as string;
  const { isStudent } = useStudent();
  const [isLoading, setIsLoading] = useState(true);

  // Constants
  const MAX_COURSES_DISPLAY = 4;

  // Helper functions
  const getStatusColor = (course: EnrolledCourseResponse) => {
    if (course.isCompleted) return "bg-green-500";
    if (course.progress && course.progress > 50) return "bg-blue-500";
    if (course.progress && course.progress > 0) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getStatusText = (course: EnrolledCourseResponse) => {
    if (course.isCompleted) return "Completaste";
    if (course.progress && course.progress > 0) return "Progreso en";
    return "Inscrito en";
  };

  // Hooks for fetching data
  const {
    enrolledCourses,
    loading: coursesLoading,
    fetchEnrolledCourses,
  } = useCourses();
  const {
    certificates,
    loading: certificatesLoading,
    fetchCertificates,
  } = useCertificates({
    userId: studentId,
    autoFetch: false,
  });

  // Calculate metrics
  const enrolledCoursesCount = enrolledCourses.length;
  const certificatesCount = certificates.length;
  const completedCourses = enrolledCourses.filter(
    (course) => course.isCompleted
  ).length;

  const averageProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce(
            (sum, course) => sum + (course.progress || 0),
            0
          ) / enrolledCourses.length
        )
      : 0;

  // Calculate estimated study hours based on completed chapters and estimated time
  const studyHours =
    Math.round(
      enrolledCourses.reduce((sum, course) => {
        const estimatedHours = parseFloat(
          course.estimatedTime?.replace("h", "") || "0"
        );
        const progressMultiplier = (course.progress || 0) / 100;
        return sum + estimatedHours * progressMultiplier;
      }, 0) * 10
    ) / 10;

  useEffect(() => {
    // Validate that the student ID matches the current user
    if (session?.user?.id && studentId !== session.user.id) {
      redirect("/");
      return;
    }

    // Fetch data
    const fetchData = async () => {
      await Promise.all([fetchEnrolledCourses(), fetchCertificates()]);
      setIsLoading(false);
    };

    fetchData();
  }, [session?.user?.id, studentId, fetchEnrolledCourses, fetchCertificates]);

  if (isLoading || coursesLoading || certificatesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (!isStudent) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel del Estudiante
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {session?.user?.name || "Estudiante"}
        </p>
        {session?.currentCompany && (
          <p className="text-gray-500 mt-1">
            Empresa: {session.currentCompany.name}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          ID del Estudiante: {studentId}
        </p>
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
            <p className="text-2xl font-bold text-blue-600">
              {enrolledCoursesCount}
            </p>
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
            <p className="text-2xl font-bold text-green-600">
              {certificatesCount}
            </p>
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
            <p className="text-2xl font-bold text-purple-600">{studyHours}h</p>
            <p className="text-sm text-gray-500">Total acumulado</p>
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
            <p className="text-2xl font-bold text-orange-600">
              {averageProgress}%
            </p>
            <p className="text-sm text-gray-500">Promedio general</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Cursos Completados
            </CardTitle>
            <CardDescription>Cursos finalizados exitosamente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {completedCourses}
            </p>
            <p className="text-sm text-gray-500">Cursos terminados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Progreso Total
            </CardTitle>
            <CardDescription>Progreso en todos los cursos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">
              {enrolledCoursesCount > 0
                ? Math.round((completedCourses / enrolledCoursesCount) * 100)
                : 0}
              %
            </p>
            <p className="text-sm text-gray-500">Tasa de finalización</p>
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
              {enrolledCourses.length > 0 ? (
                enrolledCourses.slice(0, MAX_COURSES_DISPLAY).map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{course.title}</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <Progress value={course.progress || 0} className="h-2" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No tienes cursos inscritos
                </p>
              )}
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
              {enrolledCourses.length > 0 ? (
                enrolledCourses
                  .sort(
                    (a, b) =>
                      new Date(b.lastAccessed || 0).getTime() -
                      new Date(a.lastAccessed || 0).getTime()
                  )
                  .slice(0, MAX_COURSES_DISPLAY)
                  .map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-4"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          course
                        )}`}
                      ></div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {getStatusText(course)} {course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {course.lastAccessed
                            ? new Date(course.lastAccessed).toLocaleDateString()
                            : "Reciente"}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No hay actividad reciente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
