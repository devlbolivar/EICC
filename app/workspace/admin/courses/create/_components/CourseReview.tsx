"use client";

import { Button } from "@/components/ui/button";
import { CourseReviewProps } from "@/app/types";
import { CheckCircle, AlertCircle, Clock, Users, BookOpen } from "lucide-react";

export function CourseReview({
  formData,
  updateFormData,
  onPrev,
  onSubmit,
  isSubmitting,
}: CourseReviewProps) {
  const totalLessons = formData.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const validLessons = formData.modules.reduce(
    (total, module) =>
      total +
      module.lessons.filter(
        (lesson) => lesson.title && (lesson.text || lesson.video)
      ).length,
    0
  );

  const getVisibilityDescription = () => {
    switch (formData.visibility) {
      case "Público":
        return "Visible para todos los usuarios de la plataforma";
      case "Privado":
        return "Solo visible para el creador y administradores";
      case "Empresas específicas":
        return `Visible para ${
          formData.targetCompanies?.length || 0
        } empresa(s) específica(s)`;
      default:
        return "";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Revisar y Guardar Curso
        </h3>
        <p className="text-gray-600">
          Revisa toda la información del curso antes de guardarlo.
        </p>
      </div>

      <div className="space-y-6">
        {/* Información básica */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Información Básica
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Nombre:</span>
              <p className="text-gray-900">{formData.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Categoría:
              </span>
              <p className="text-gray-900">{formData.category}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Nivel:</span>
              <p className="text-gray-900">{formData.level}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Estado:</span>
              <p className="text-gray-900">{formData.status}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Duración estimada:
              </span>
              <p className="text-gray-900">{formData.estimatedDuration}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Imagen de portada:
              </span>
              <p className="text-gray-900">
                {formData.bannerImage ? "Sí" : "No"}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm font-medium text-gray-600">
              Descripción:
            </span>
            <p className="text-gray-900 mt-1">{formData.description}</p>
          </div>
        </div>

        {/* Estructura del curso */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Estructura del Curso
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Módulos:</span>
              <span className="font-medium">{formData.modules.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lecciones totales:</span>
              <span className="font-medium">{totalLessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lecciones válidas:</span>
              <span className="font-medium flex items-center gap-1">
                {validLessons}
                {validLessons > 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </span>
            </div>
          </div>

          {/* Lista de módulos */}
          <div className="mt-4 space-y-2">
            {formData.modules.map((module, index) => (
              <div key={module.id} className="bg-gray-50 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    Módulo {index + 1}: {module.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {module.lessons.length} lección(es)
                  </span>
                </div>
                {module.description && (
                  <p className="text-xs text-gray-600">{module.description}</p>
                )}
                {module.lessons.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="text-gray-500">•</span>
                        <span
                          className={
                            lesson.title ? "text-gray-700" : "text-red-600"
                          }
                        >
                          Lección {lessonIndex + 1}:{" "}
                          {lesson.title || "Sin título"}
                        </span>
                        {lesson.text || lesson.video ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configuración de visibilidad */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Configuración de Visibilidad
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Tipo:</span>
              <p className="text-gray-900">{formData.visibility}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Descripción:
              </span>
              <p className="text-gray-900">{getVisibilityDescription()}</p>
            </div>
            {formData.visibility === "Empresas específicas" &&
              formData.targetCompanies &&
              formData.targetCompanies.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Empresas seleccionadas:
                  </span>
                  <p className="text-gray-900">
                    {formData.targetCompanies.length} empresa(s)
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Validaciones */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Validaciones</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {formData.name.trim() ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Nombre del curso</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.description.trim() ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Descripción del curso</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.category ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Categoría seleccionada</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.estimatedDuration.trim() ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Duración estimada</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.modules.length > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Al menos un módulo</span>
            </div>
            <div className="flex items-center gap-2">
              {validLessons > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Al menos una lección válida</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.visibility !== "Empresas específicas" ||
              (formData.targetCompanies &&
                formData.targetCompanies.length > 0) ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Configuración de visibilidad</span>
            </div>
          </div>
        </div>

        {/* Opciones de guardado */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3">
            Opciones de Guardado
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={onSubmit}
                disabled={isSubmitting || validLessons === 0}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {formData.status === "Publicado"
                      ? "Publicar Curso"
                      : "Guardar como Borrador"}
                  </>
                )}
              </Button>
              <span className="text-sm text-blue-700">
                {formData.status === "Publicado"
                  ? "El curso será publicado inmediatamente"
                  : "El curso se guardará como borrador"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6 border-t mt-6">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => updateFormData({ status: "Borrador" })}
            disabled={isSubmitting}
          >
            Guardar como Borrador
          </Button>
          <Button
            onClick={() => {
              updateFormData({ status: "Publicado" });
              onSubmit();
            }}
            disabled={isSubmitting || validLessons === 0}
          >
            Publicar Curso
          </Button>
        </div>
      </div>
    </div>
  );
}
