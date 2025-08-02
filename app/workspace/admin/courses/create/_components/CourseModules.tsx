"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CourseModulesProps, Module, Lesson } from "@/app/types";
import { Plus, Trash2, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function CourseModules({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: CourseModulesProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: "",
      description: "",
      lessons: [],
      order: formData.modules.length + 1,
    };

    updateFormData({
      modules: [...formData.modules, newModule],
    });

    setEditingModule(newModule.id);
    setExpandedModules(new Set([...expandedModules, newModule.id]));
    toast.success("Módulo agregado");
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    const updatedModules = formData.modules.map((module) =>
      module.id === moduleId ? { ...module, ...updates } : module
    );
    updateFormData({ modules: updatedModules });
  };

  const deleteModule = (moduleId: string) => {
    const updatedModules = formData.modules
      .filter((module) => module.id !== moduleId)
      .map((module, index) => ({ ...module, order: index + 1 }));
    updateFormData({ modules: updatedModules });
    setExpandedModules(
      new Set([...expandedModules].filter((id) => id !== moduleId))
    );
    toast.success("Módulo eliminado");
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: "",
      text: "",
      video: "",
      attachments: [],
      order: 0,
    };

    const updatedModules = formData.modules.map((module) => {
      if (module.id === moduleId) {
        const lessons = [
          ...module.lessons,
          { ...newLesson, order: module.lessons.length + 1 },
        ];
        return { ...module, lessons };
      }
      return module;
    });

    updateFormData({ modules: updatedModules });
    setEditingLesson({ moduleId, lessonId: newLesson.id });
    toast.success("Lección agregada");
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    const updatedModules = formData.modules.map((module) => {
      if (module.id === moduleId) {
        const lessons = module.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, ...updates } : lesson
        );
        return { ...module, lessons };
      }
      return module;
    });
    updateFormData({ modules: updatedModules });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const updatedModules = formData.modules.map((module) => {
      if (module.id === moduleId) {
        const lessons = module.lessons
          .filter((lesson) => lesson.id !== lessonId)
          .map((lesson, index) => ({ ...lesson, order: index + 1 }));
        return { ...module, lessons };
      }
      return module;
    });
    updateFormData({ modules: updatedModules });
    toast.success("Lección eliminada");
  };

  const validateModules = () => {
    // Verificar que haya al menos un módulo
    if (formData.modules.length === 0) {
      toast.error("Debes agregar al menos un módulo");
      return false;
    }

    // Verificar que cada módulo tenga un título
    for (const courseModule of formData.modules) {
      if (!courseModule.title.trim()) {
        toast.error("Todos los módulos deben tener un título");
        return false;
      }
    }

    // Verificar que haya al menos un módulo con una lección válida
    const hasValidModule = formData.modules.some((module) =>
      module.lessons.some(
        (lesson) => lesson.title && (lesson.text || lesson.video)
      )
    );

    if (!hasValidModule) {
      toast.error(
        "Debes agregar al menos una lección con contenido (texto o video)"
      );
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateModules()) {
      toast.success("Módulos y lecciones guardados");
      onNext();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Módulos y Lecciones
        </h3>
        <p className="text-gray-600">
          Organiza el contenido del curso en módulos y lecciones. Cada lección
          debe tener al menos texto o video.
        </p>
      </div>

      {/* Lista de módulos */}
      <div className="space-y-4 mb-6">
        {formData.modules.map((module, index) => (
          <div key={module.id} className="border rounded-lg">
            {/* Header del módulo */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleModuleExpansion(module.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <span className="font-medium text-gray-900">
                  Módulo {index + 1}: {module.title || "Sin título"}
                </span>
                <span className="text-sm text-gray-500">
                  ({module.lessons.length} lecciones)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditingModule(
                      editingModule === module.id ? null : module.id
                    )
                  }
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteModule(module.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Contenido del módulo */}
            {expandedModules.has(module.id) && (
              <div className="p-4">
                {/* Edición del módulo */}
                {editingModule === module.id && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Título del módulo *
                        </Label>
                        <Input
                          value={module.title}
                          onChange={(e) =>
                            updateModule(module.id, { title: e.target.value })
                          }
                          placeholder="Título del módulo"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Descripción (opcional)
                        </Label>
                        <Textarea
                          value={module.description || ""}
                          onChange={(e) =>
                            updateModule(module.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Descripción del módulo..."
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingModule(null)}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingModule(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de lecciones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Lecciones</h4>
                    <Button
                      size="sm"
                      onClick={() => addLesson(module.id)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar Lección
                    </Button>
                  </div>

                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          Lección {lessonIndex + 1}:{" "}
                          {lesson.title || "Sin título"}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditingLesson({
                                moduleId: module.id,
                                lessonId: lesson.id,
                              })
                            }
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLesson(module.id, lesson.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Edición de lección */}
                      {editingLesson?.moduleId === module.id &&
                        editingLesson?.lessonId === lesson.id && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">
                                  Título de la lección *
                                </Label>
                                <Input
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(module.id, lesson.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Título de la lección"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">
                                  Contenido de texto (opcional)
                                </Label>
                                <Textarea
                                  value={lesson.text || ""}
                                  onChange={(e) =>
                                    updateLesson(module.id, lesson.id, {
                                      text: e.target.value,
                                    })
                                  }
                                  placeholder="Contenido de la lección..."
                                  rows={3}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">
                                  URL de video (opcional)
                                </Label>
                                <Input
                                  value={lesson.video || ""}
                                  onChange={(e) =>
                                    updateLesson(module.id, lesson.id, {
                                      video: e.target.value,
                                    })
                                  }
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setEditingLesson(null)}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingLesson(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón para agregar módulo */}
      <div className="mb-6">
        <Button
          onClick={addModule}
          variant="outline"
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Módulo
        </Button>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button onClick={handleNext} className="px-6">
          Siguiente
        </Button>
      </div>
    </div>
  );
}
