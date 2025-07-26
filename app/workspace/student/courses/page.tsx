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
import { PlayCircle, BookOpen, Clock, Award } from "lucide-react";

const StudentCourses = () => {
  const enrolledCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      description:
        "Aprende los conceptos básicos de React y construye aplicaciones modernas",
      progress: 75,
      totalChapters: 12,
      completedChapters: 9,
      estimatedTime: "8 horas",
      lastAccessed: "Hace 2 horas",
      image: "/online-education.png",
    },
    {
      id: 2,
      title: "TypeScript Avanzado",
      description: "Domina TypeScript para desarrollo de aplicaciones robustas",
      progress: 45,
      totalChapters: 15,
      completedChapters: 7,
      estimatedTime: "12 horas",
      lastAccessed: "Hace 1 día",
      image: "/online-education.png",
    },
    {
      id: 3,
      title: "Node.js Backend Development",
      description: "Construye APIs y servidores con Node.js y Express",
      progress: 90,
      totalChapters: 10,
      completedChapters: 9,
      estimatedTime: "10 horas",
      lastAccessed: "Hace 3 días",
      image: "/online-education.png",
    },
    {
      id: 4,
      title: "Docker & DevOps",
      description: "Aprende containerización y prácticas DevOps",
      progress: 30,
      totalChapters: 8,
      completedChapters: 2,
      estimatedTime: "6 horas",
      lastAccessed: "Hace 1 semana",
      image: "/online-education.png",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
        <p className="text-muted-foreground">
          Continúa tu aprendizaje desde donde lo dejaste
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video relative bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white opacity-80" />
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
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {course.completedChapters}/{course.totalChapters}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Último acceso: {course.lastAccessed}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continuar
                </Button>
                {course.progress === 100 && (
                  <Button variant="outline" size="sm">
                    <Award className="h-4 w-4 mr-2" />
                    Certificado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;
