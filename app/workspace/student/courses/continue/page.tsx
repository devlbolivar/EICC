"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, BookOpen, Clock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompletedChapters {
  [key: string]: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalChapters: number;
  completedChapters: CompletedChapters;
  isCompleted: boolean;
  completedAt: string | null;
  estimatedTime: string | null;
  lastAccessed: string;
  image: string | null;
  category: string;
  level: string;
}

const ContinueLearning = () => {
  const [inProgressCourses, setInProgressCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInProgressCourses();
  }, []);

  const fetchInProgressCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/courses");

      if (!response.ok) {
        throw new Error("Error al obtener cursos");
      }

      const result = await response.json();

      if (result.success) {
        // Filtrar solo los cursos que no están completados (en progreso)
        const coursesInProgress = result.data.filter(
          (course: Course) => !course.isCompleted
        );
        setInProgressCourses(coursesInProgress);
      } else {
        throw new Error(result.error || "Error al obtener cursos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los cursos en progreso");
    } finally {
      setLoading(false);
    }
  };

  const getCompletedChaptersCount = (completedChapters: CompletedChapters): number => {
    if (!completedChapters || typeof completedChapters !== "object") {
      return 0;
    }
    return Object.values(completedChapters).filter((completed) => completed === true).length;
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffHours < 1) return "Hace unos minutos";
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    if (diffWeeks < 4) return `Hace ${diffWeeks} semana${diffWeeks > 1 ? "s" : ""}`;

    return date.toLocaleDateString();
  };

  const getEstimatedTimeRemaining = (
    progress: number,
    estimatedTime: string | null
  ): string => {
    if (!estimatedTime || progress >= 100) {
      return "Casi listo";
    }

    // Intentar extraer el número de horas del estimatedTime
    const match = estimatedTime.match(/(\d+)/);
    if (match) {
      const totalHours = parseInt(match[1]);
      const remainingHours = Math.ceil(totalHours * (1 - progress / 100));
      return `${remainingHours} hora${remainingHours !== 1 ? "s" : ""} restante${remainingHours !== 1 ? "s" : ""}`;
    }

    return estimatedTime;
  };

  const getNextLesson = (
    completedChapters: CompletedChapters,
    totalChapters: number
  ): string => {
    if (!completedChapters || typeof completedChapters !== "object") {
      return "Capítulo 1";
    }

    const completedCount = getCompletedChaptersCount(completedChapters);

    if (completedCount === 0) {
      return "Capítulo 1";
    }

    if (completedCount >= totalChapters) {
      return "Finalizar curso";
    }

    return `Capítulo ${completedCount + 1}`;
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "basic":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level: string) => {
    switch (level.toLowerCase()) {
      case "basic":
        return "Básico";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Continuar Aprendiendo
        </h1>
        <p className="text-muted-foreground">
          Retoma tus cursos desde donde los dejaste
        </p>
      </div>

      <div className="space-y-6">
        {inProgressCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay cursos en progreso
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Parece que no tienes cursos en progreso. ¡Explora nuestro catálogo
                y comienza a aprender!
              </p>
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Explorar Cursos
              </Button>
            </CardContent>
          </Card>
        ) : (
          inProgressCourses.map((course) => {
            const completedCount = getCompletedChaptersCount(course.completedChapters);
            const nextLesson = getNextLesson(course.completedChapters, course.totalChapters);
            const estimatedTimeRemaining = getEstimatedTimeRemaining(
              course.progress,
              course.estimatedTime
            );

            return (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getLevelBadgeColor(
                            course.level
                          )}`}
                        >
                          {getLevelText(course.level)}
                        </span>
                      </div>
                      <CardDescription className="text-base">
                        {course.description}
                      </CardDescription>
                    </div>
                    <Button size="lg" className="ml-4">
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Continuar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso del curso</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {completedCount}/{course.totalChapters} capítulos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{estimatedTimeRemaining}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Siguiente: {nextLesson}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Último acceso: {formatLastAccessed(course.lastAccessed)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Categoría: {course.category}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ContinueLearning;
