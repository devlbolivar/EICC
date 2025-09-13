"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  Trophy,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useCourses } from "@/hooks/use-courses";
import { useCertificateCheck } from "@/hooks/use-certificate-check";
import { EnrolledCourseResponse } from "@/app/types";
import { useRouter } from "next/navigation";

export default function StudentCourses() {
  const router = useRouter();
  const { enrolledCourses, loading, error, fetchEnrolledCourses } =
    useCourses();
  const { checkAndCreateCertificate, isCreating } = useCertificateCheck();

  // Constants
  const LOADING_HEIGHT = "h-64";
  const ICON_SIZE = "h-4 w-4";
  const LARGE_ICON_SIZE = "h-12 w-12";

  // Helper functions
  const getCourseGradient = (isCompleted: boolean) => {
    return isCompleted
      ? "bg-gradient-to-br from-green-500 to-emerald-600"
      : "bg-gradient-to-br from-blue-500 to-purple-600";
  };

  const getCourseIcon = (isCompleted: boolean) => {
    return isCompleted ? (
      <Trophy className={`${LARGE_ICON_SIZE} text-white opacity-90`} />
    ) : (
      <BookOpen className={`${LARGE_ICON_SIZE} text-white opacity-80`} />
    );
  };

  const getStatusBadge = (isCompleted: boolean) => {
    return isCompleted ? (
      <Badge className="bg-green-600 text-white">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completado
      </Badge>
    ) : (
      <Badge className="bg-blue-600 text-white">En Progreso</Badge>
    );
  };

  const getActionButton = (course: EnrolledCourseResponse) => {
    if (course.isCompleted) {
      return (
        <>
          <BookOpen className={`${ICON_SIZE} mr-2`} />
          Ver Curso
        </>
      );
    }
    return (
      <>
        <PlayCircle className={`${ICON_SIZE} mr-2`} />
        Continuar
      </>
    );
  };

  const handleCertificateClick = async (courseId: string) => {
    const success = await checkAndCreateCertificate(courseId);
    if (success) {
      router.push(`/workspace/student/certificates/${courseId}`);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  const handleContinueCourse = (courseId: string) => {
    router.push(`/workspace/student/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
          <p className="text-muted-foreground">
            Continúa tu aprendizaje desde donde lo dejaste
          </p>
        </div>
        <Loader message="Cargando cursos..." height={LOADING_HEIGHT} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
          <p className="text-muted-foreground">
            Continúa tu aprendizaje desde donde lo dejaste
          </p>
        </div>
        <div className={`flex items-center justify-center ${LOADING_HEIGHT}`}>
          <div className="flex flex-col items-center space-y-2 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h3 className="text-lg font-semibold">
              Error al cargar los cursos
            </h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchEnrolledCourses()}
              className="mt-4"
            >
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
        <p className="text-muted-foreground">
          Continúa tu aprendizaje desde donde lo dejaste
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrolledCourses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No tienes cursos inscritos
            </h3>
            <p className="text-muted-foreground max-w-md">
              Explora nuestro catálogo de cursos y comienza tu viaje de
              aprendizaje.
            </p>
          </div>
        )}
        {enrolledCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div
              className={`aspect-video relative ${getCourseGradient(
                course.isCompleted
              )}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {getCourseIcon(course.isCompleted)}
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {getStatusBadge(course.isCompleted)}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progreso</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className={`${ICON_SIZE} text-muted-foreground`} />
                  <span>{course.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className={`${ICON_SIZE} text-muted-foreground`} />
                  <span>
                    {Object.keys(course.completedChapters).length}/
                    {course.totalChapters}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Último acceso:{" "}
                {new Date(course.lastAccessed).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={() => handleContinueCourse(course.id)}
                >
                  {getActionButton(course)}
                </Button>
                {course.isCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCertificateClick(course.id)}
                    disabled={isCreating(course.id)}
                  >
                    <Award className={`${ICON_SIZE} mr-2`} />
                    {isCreating(course.id) ? "Generando..." : "Ver Certificado"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
