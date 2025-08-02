"use client";

import { CourseAdminGuard } from "../../_components/CourseAdminGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Course, Module, Lesson } from "@/app/types";
import {
  API_ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  COURSE_CATEGORIES,
  COURSE_LEVELS,
} from "@/lib/constants";
import { toast } from "sonner";

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    level: "",
    status: "",
    estimatedDuration: "",
    visibility: "",
    targetCompanies: [] as string[],
    modules: [] as Module[],
    bannerImage: "",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_ROUTES.COURSES}/${courseId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener el curso");
        }

        const data = await response.json();
        const fetchedCourse = data.data.course;
        setCourse(fetchedCourse);

        // Populate form data
        setFormData({
          name: fetchedCourse.name || "",
          description: fetchedCourse.description || "",
          category: fetchedCourse.category || "",
          level: fetchedCourse.level || "",
          status: fetchedCourse.status || "Borrador",
          estimatedDuration: fetchedCourse.estimatedDuration || "",
          visibility: fetchedCourse.visibility || "Público",
          targetCompanies: fetchedCourse.targetCompanies || [],
          modules: fetchedCourse.modules || [],
          bannerImage: fetchedCourse.bannerImage || "",
        });
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(
          err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`${API_ROUTES.COURSES}/${courseId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el curso");
      }

      toast.success(SUCCESS_MESSAGES.COURSE_UPDATED);
      router.push(`/workspace/admin/courses/${courseId}/view`);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el curso"
      );
    } finally {
      setSaving(false);
    }
  };

  // Module and lesson management
  const addModule = () => {
    setFormData((prev) => {
      const newModule: Module = {
        id: `temp-${Date.now()}`,
        title: "",
        description: "",
        lessons: [],
        order: prev.modules.length,
      };
      return {
        ...prev,
        modules: [...prev.modules, newModule],
      };
    });
  };

  const updateModule = (moduleIndex: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex ? { ...module, [field]: value } : module
      ),
    }));
  };

  const removeModule = (moduleIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex),
    }));
  };

  const addLesson = (moduleIndex: number) => {
    setFormData((prev) => {
      const newLesson: Lesson = {
        id: `temp-${Date.now()}`,
        title: "",
        text: "",
        video: "",
        order: prev.modules[moduleIndex]?.lessons?.length || 0,
      };
      return {
        ...prev,
        modules: prev.modules.map((module, index) =>
          index === moduleIndex
            ? { ...module, lessons: [...(module.lessons || []), newLesson] }
            : module
        ),
      };
    });
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, mIndex) =>
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons?.map((lesson, lIndex) =>
                lIndex === lessonIndex ? { ...lesson, [field]: value } : lesson
              ),
            }
          : module
      ),
    }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, mIndex) =>
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons?.filter(
                (_, lIndex) => lIndex !== lessonIndex
              ),
            }
          : module
      ),
    }));
  };

  const addTargetCompany = () => {
    const company = prompt("Ingresa el nombre de la empresa:");
    if (company && company.trim()) {
      setFormData((prev) => ({
        ...prev,
        targetCompanies: [...prev.targetCompanies, company.trim()],
      }));
    }
  };

  const removeTargetCompany = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      targetCompanies: prev.targetCompanies.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <CourseAdminGuard>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando curso...</p>
            </div>
          </div>
        </div>
      </CourseAdminGuard>
    );
  }

  if (error || !course) {
    return (
      <CourseAdminGuard>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">
                {error || "Error al cargar el curso"}
              </p>
              <div className="mt-4 space-x-2">
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/workspace/admin/courses")}
                >
                  Volver
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CourseAdminGuard>
    );
  }

  return (
    <CourseAdminGuard>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/workspace/admin/courses/${courseId}/view`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Editar Curso
                </h1>
                <p className="text-gray-600 mt-2">
                  Modifica la información del curso
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Configura los datos principales del curso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del curso *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ingresa el nombre del curso"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe el contenido del curso"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Nivel *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) =>
                        handleInputChange("level", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COURSE_LEVELS).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Borrador">Borrador</SelectItem>
                        <SelectItem value="Publicado">Publicado</SelectItem>
                        <SelectItem value="Archivado">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="visibility">Visibilidad</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value) =>
                        handleInputChange("visibility", value)
                      }
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
                  <Label htmlFor="estimatedDuration">Duración estimada</Label>
                  <Input
                    id="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      handleInputChange("estimatedDuration", e.target.value)
                    }
                    placeholder="Ej: 2 horas, 30 minutos"
                  />
                </div>

                <div>
                  <Label htmlFor="bannerImage">URL de imagen de banner</Label>
                  <Input
                    id="bannerImage"
                    value={formData.bannerImage}
                    onChange={(e) =>
                      handleInputChange("bannerImage", e.target.value)
                    }
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Empresas objetivo */}
            {formData.visibility === "Empresas específicas" && (
              <Card>
                <CardHeader>
                  <CardTitle>Empresas Objetivo</CardTitle>
                  <CardDescription>
                    Selecciona las empresas que pueden acceder a este curso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {formData.targetCompanies.map((company, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={company}
                          onChange={(e) => {
                            const newCompanies = [...formData.targetCompanies];
                            newCompanies[index] = e.target.value;
                            handleInputChange("targetCompanies", newCompanies);
                          }}
                          placeholder="Nombre de la empresa"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTargetCompany(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addTargetCompany}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Empresa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Módulos y lecciones */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido del Curso</CardTitle>
                <CardDescription>
                  Organiza el contenido en módulos y lecciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">
                          Módulo {moduleIndex + 1}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeModule(moduleIndex)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Título del módulo</Label>
                          <Input
                            value={module.title}
                            onChange={(e) =>
                              updateModule(moduleIndex, "title", e.target.value)
                            }
                            placeholder="Título del módulo"
                          />
                        </div>

                        <div>
                          <Label>Descripción del módulo</Label>
                          <Textarea
                            value={module.description}
                            onChange={(e) =>
                              updateModule(
                                moduleIndex,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Descripción del módulo"
                            rows={2}
                          />
                        </div>

                        {/* Lecciones */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Lecciones</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(moduleIndex)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar Lección
                            </Button>
                          </div>

                          {module.lessons?.map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              className="border rounded p-3 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  Lección {lessonIndex + 1}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeLesson(moduleIndex, lessonIndex)
                                  }
                                  className="text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div>
                                <Label>Título de la lección</Label>
                                <Input
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(
                                      moduleIndex,
                                      lessonIndex,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Título de la lección"
                                />
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <Label>Contenido de texto</Label>
                                  <Textarea
                                    value={lesson.text}
                                    onChange={(e) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        "text",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Contenido de texto de la lección"
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <Label>URL del video</Label>
                                  <Input
                                    value={lesson.video}
                                    onChange={(e) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        "video",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://ejemplo.com/video.mp4"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addModule}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Módulo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con vista previa */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">
                      {formData.name || "Nombre del curso"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formData.description || "Descripción del curso"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Categoría:</span>
                      <p>{formData.category || "Sin categoría"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Nivel:</span>
                      <p>{formData.level || "Sin nivel"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <p>{formData.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Visibilidad:</span>
                      <p>{formData.visibility}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-sm">Módulos:</span>
                    <p className="font-semibold">{formData.modules.length}</p>
                  </div>

                  <div>
                    <span className="text-gray-500 text-sm">
                      Lecciones totales:
                    </span>
                    <p className="font-semibold">
                      {formData.modules.reduce(
                        (total, module) =>
                          total + (module.lessons?.length || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CourseAdminGuard>
  );
}
