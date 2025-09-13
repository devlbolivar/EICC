"use client";

import React, { useState, useEffect } from "react";
import { useCourses } from "@/hooks/use-courses";
import { Course, CourseCreateData, CourseFormData } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Edit, Trash2, Eye, BookOpen } from "lucide-react";

const initialFormData: CourseFormData = {
  name: "",
  description: "",
  category: "",
  level: "Básico",
  status: "Borrador",
  estimatedDuration: "",
  visibility: "Público",
  bannerImage: "",
  targetCompanies: [],
  modules: [],
};

export function CourseManager() {
  const {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    enrollInCourse,
    clearError,
  } = useCourses();

  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const courseData: CourseCreateData = {
      ...formData,
      numberOfChapters: 0,
      includeVideos: false,
      difficulty: formData.level,
      courseJson: {},
      courseContent: {},
      isPublic: formData.visibility === "Público",
      modules: [],
    };

    if (editingCourse) {
      await updateCourse(editingCourse.id, courseData);
    } else {
      await createCourse(courseData);
    }

    if (!error) {
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingCourse(null);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      category: course.category,
      level: course.level,
      status: course.status,
      estimatedDuration: course.estimatedDuration || "",
      visibility: course.visibility,
      bannerImage: course.bannerImage || "",
      targetCompanies: course.targetCompanies || [],
      modules: course.modules || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este curso?")) {
      await deleteCourse(courseId);
    }
  };

  const handleEnroll = async (courseId: string) => {
    const success = await enrollInCourse(courseId);
    if (success) {
      alert("¡Inscripción exitosa!");
    }
  };

  const handleViewCourse = async (courseId: string) => {
    const course = await getCourse(courseId);
    if (course) {
      setSelectedCourse(course);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publicado":
        return "bg-green-100 text-green-800";
      case "Borrador":
        return "bg-yellow-100 text-yellow-800";
      case "Archivado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Básico":
        return "bg-blue-100 text-blue-800";
      case "Intermedio":
        return "bg-orange-100 text-orange-800";
      case "Avanzado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando cursos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
          <p className="text-gray-600">
            Administra todos los cursos de la plataforma
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Editar Curso" : "Crear Nuevo Curso"}
              </DialogTitle>
              <DialogDescription>
                Completa la información del curso
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Nombre del Curso
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Introducción a React"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Programación"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe el contenido del curso..."
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Nivel</label>
                  <Select
                    value={formData.level}
                    onValueChange={(
                      value: "Básico" | "Intermedio" | "Avanzado"
                    ) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Intermedio">Intermedio</SelectItem>
                      <SelectItem value="Avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Duración Estimada
                  </label>
                  <Input
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedDuration: e.target.value,
                      })
                    }
                    placeholder="2 horas"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Visibilidad</label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(
                      value: "Público" | "Privado" | "Empresas específicas"
                    ) => setFormData({ ...formData, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Público">Público</SelectItem>
                      <SelectItem value="Privado">Privado</SelectItem>
                      <SelectItem value="Empresas específicas">
                        Empresas específicas
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  URL de la Imagen de Portada
                </label>
                <Input
                  value={formData.bannerImage}
                  onChange={(e) =>
                    setFormData({ ...formData, bannerImage: e.target.value })
                  }
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {course.description.length > 100
                      ? `${course.description.substring(0, 100)}...`
                      : course.description}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewCourse(course.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    Creado: {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                  {course.estimatedDuration && (
                    <p>Duración: {course.estimatedDuration}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleEnroll(course.id)}
                    className="flex-1"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Inscribirse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Detail Dialog */}
      {selectedCourse && (
        <Dialog
          open={!!selectedCourse}
          onOpenChange={() => setSelectedCourse(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedCourse.name}</DialogTitle>
              <DialogDescription>
                {selectedCourse.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <p>{selectedCourse.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nivel</label>
                  <p>{selectedCourse.level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <p>{selectedCourse.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Visibilidad</label>
                  <p>{selectedCourse.visibility}</p>
                </div>
              </div>
              {selectedCourse.estimatedDuration && (
                <div>
                  <label className="text-sm font-medium">
                    Duración Estimada
                  </label>
                  <p>{selectedCourse.estimatedDuration}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Fecha de Creación</label>
                <p>{new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
