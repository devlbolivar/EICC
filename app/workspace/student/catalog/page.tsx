import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Clock, Users, Star, Search } from "lucide-react";

const StudentCatalog = () => {
  const availableCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      description:
        "Aprende los conceptos básicos de React y construye aplicaciones modernas",
      category: "Frontend",
      difficulty: "Principiante",
      duration: "8 horas",
      students: 1247,
      rating: 4.8,
      price: "Gratis",
      isEnrolled: false,
      image: "/online-education.png",
    },
    {
      id: 2,
      title: "TypeScript Avanzado",
      description: "Domina TypeScript para desarrollo de aplicaciones robustas",
      category: "Frontend",
      difficulty: "Intermedio",
      duration: "12 horas",
      students: 892,
      rating: 4.9,
      price: "Gratis",
      isEnrolled: false,
      image: "/online-education.png",
    },
    {
      id: 3,
      title: "Node.js Backend Development",
      description: "Construye APIs y servidores con Node.js y Express",
      category: "Backend",
      difficulty: "Intermedio",
      duration: "10 horas",
      students: 1563,
      rating: 4.7,
      price: "Gratis",
      isEnrolled: true,
      image: "/online-education.png",
    },
    {
      id: 4,
      title: "Docker & DevOps",
      description: "Aprende containerización y prácticas DevOps",
      category: "DevOps",
      difficulty: "Avanzado",
      duration: "6 horas",
      students: 734,
      rating: 4.6,
      price: "Gratis",
      isEnrolled: true,
      image: "/online-education.png",
    },
    {
      id: 5,
      title: "Python para Data Science",
      description:
        "Introducción a Python para análisis de datos y machine learning",
      category: "Data Science",
      difficulty: "Principiante",
      duration: "15 horas",
      students: 2103,
      rating: 4.9,
      price: "Gratis",
      isEnrolled: false,
      image: "/online-education.png",
    },
    {
      id: 6,
      title: "AWS Cloud Practitioner",
      description:
        "Certificación AWS Cloud Practitioner - Fundamentos de la nube",
      category: "Cloud",
      difficulty: "Intermedio",
      duration: "20 horas",
      students: 567,
      rating: 4.5,
      price: "Gratis",
      isEnrolled: false,
      image: "/online-education.png",
    },
  ];

  const categories = [
    "Todos",
    "Frontend",
    "Backend",
    "DevOps",
    "Data Science",
    "Cloud",
  ];
  const difficulties = ["Todos", "Principiante", "Intermedio", "Avanzado"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Catálogo de Cursos
        </h1>
        <p className="text-muted-foreground">
          Explora nuestra amplia selección de cursos y encuentra tu próximo
          desafío de aprendizaje
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cursos..." className="pl-10" />
        </div>
        <Select defaultValue="Todos">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="Todos">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Dificultad" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cursos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video relative bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white opacity-80" />
              </div>
              {course.isEnrolled && (
                <Badge className="absolute top-2 right-2 bg-green-600">
                  Inscrito
                </Badge>
              )}
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline">{course.difficulty}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.students.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{course.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({course.students} estudiantes)
                </span>
              </div>

              <div className="flex gap-2">
                {course.isEnrolled ? (
                  <Button className="flex-1" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continuar
                  </Button>
                ) : (
                  <Button className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Inscribirse
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

export default StudentCatalog;
