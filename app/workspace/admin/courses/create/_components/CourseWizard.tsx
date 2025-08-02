"use client";

import { useState } from "react";
import { CourseBasicInfo } from "./CourseBasicInfo";
import { CourseModules } from "./CourseModules";
import { CourseVisibility } from "./CourseVisibility";
import { CourseReview } from "./CourseReview";
import { CourseFormData } from "@/app/types";
import { toast } from "sonner";
import { API_ROUTES, PAGE_ROUTES, SUCCESS_MESSAGES } from "@/lib/constants";

const initialFormData: CourseFormData = {
  name: "",
  description: "",
  category: "",
  level: "Básico",
  status: "Borrador",
  estimatedDuration: "",
  bannerImage: "",
  visibility: "Público",
  targetCompanies: [],
  modules: [],
};

export function CourseWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const updateFormData = (updates: Partial<CourseFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validaciones adicionales
      if (!formData.name.trim()) {
        toast.error("El nombre del curso es requerido");
        return;
      }

      if (!formData.description.trim()) {
        toast.error("La descripción del curso es requerida");
        return;
      }

      if (!formData.category) {
        toast.error("La categoría del curso es requerida");
        return;
      }

      // Validar que el curso tenga al menos un módulo con una lección
      const hasValidModules = formData.modules.some((module) =>
        module.lessons.some(
          (lesson) => lesson.title && (lesson.text || lesson.video)
        )
      );

      if (!hasValidModules) {
        toast.error(
          "El curso debe tener al menos un módulo con una lección válida"
        );
        return;
      }

      // Validar visibilidad
      if (
        formData.visibility === "Empresas específicas" &&
        (!formData.targetCompanies || formData.targetCompanies.length === 0)
      ) {
        toast.error(
          "Debes seleccionar al menos una empresa cuando la visibilidad es 'Empresas específicas'"
        );
        return;
      }

      // Preparar datos para enviar a la API
      const courseData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        level: formData.level,
        status: formData.status,
        estimatedDuration: formData.estimatedDuration,
        bannerImage: formData.bannerImage,
        visibility: formData.visibility,
        targetCompanies: formData.targetCompanies,
        modules: formData.modules,
      };

      // Mostrar toast de carga
      const loadingToast = toast.loading("Guardando curso...");

      // Llamar a la API para guardar el curso
      const response = await fetch(API_ROUTES.COURSES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar el curso");
      }

      toast.success(result.message || SUCCESS_MESSAGES.COURSE_CREATED);

      // Redirigir después de un breve delay para que se vea el toast
      setTimeout(() => {
        window.location.href = PAGE_ROUTES.ADMIN.COURSES;
      }, 1500);
    } catch (error) {
      console.error("Error al guardar el curso:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al guardar el curso"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CourseBasicInfo
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <CourseModules
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <CourseVisibility
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <CourseReview
            formData={formData}
            updateFormData={updateFormData}
            onPrev={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Paso {currentStep} de {totalSteps}
          </h2>
          <div className="text-sm text-gray-500">
            {currentStep === 1 && "Información básica"}
            {currentStep === 2 && "Módulos y lecciones"}
            {currentStep === 3 && "Visibilidad"}
            {currentStep === 4 && "Revisar y guardar"}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border">{renderStep()}</div>
    </div>
  );
}
