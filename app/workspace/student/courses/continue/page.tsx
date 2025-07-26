import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, BookOpen, Clock, ArrowRight } from "lucide-react";

const ContinueLearning = () => {
  const inProgressCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      currentChapter: "Componentes Funcionales",
      progress: 75,
      totalChapters: 12,
      completedChapters: 9,
      estimatedTime: "2 horas restantes",
      lastAccessed: "Hace 2 horas",
      nextLesson: "Hooks y Estado",
    },
    {
      id: 2,
      title: "TypeScript Avanzado",
      currentChapter: "Tipos Genéricos",
      progress: 45,
      totalChapters: 15,
      completedChapters: 7,
      estimatedTime: "6 horas restantes",
      lastAccessed: "Hace 1 día",
      nextLesson: "Decoradores",
    },
    {
      id: 3,
      title: "Docker & DevOps",
      currentChapter: "Containers Básicos",
      progress: 30,
      totalChapters: 8,
      completedChapters: 2,
      estimatedTime: "4 horas restantes",
      lastAccessed: "Hace 1 semana",
      nextLesson: "Docker Compose",
    },
  ];

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
        {inProgressCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-base">
                    Capítulo actual: {course.currentChapter}
                  </CardDescription>
                </div>
                <Button size="lg">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Continuar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progreso del curso</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {course.completedChapters}/{course.totalChapters} capítulos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{course.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Siguiente: {course.nextLesson}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Último acceso: {course.lastAccessed}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inProgressCourses.length === 0 && (
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
      )}
    </div>
  );
};

export default ContinueLearning;
