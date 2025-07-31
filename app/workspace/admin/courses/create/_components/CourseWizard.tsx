"use client";

import { useState } from "react";
import { CourseBasicInfo } from "./CourseBasicInfo";
import { CourseModules } from "./CourseModules";
import { CourseVisibility } from "./CourseVisibility";
import { CourseReview } from "./CourseReview";
import { Module, Lesson } from "@/app/types";

export interface CourseFormData {
  name: string;
  description: string;
  category: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  status: "Borrador" | "Publicado" | "Archivado";
  estimatedDuration: string;
  bannerImage?: string;
  visibility: "Público" | "Privado" | "Empresas específicas";
  targetCompanies: string[];
  modules: Module[];
}

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
      // Validar que el curso tenga al menos un módulo con una lección
      const hasValidModules = formData.modules.some((module) =>
        module.lessons.some(
          (lesson) => lesson.title && (lesson.text || lesson.video)
        )
      );

      if (!hasValidModules) {
        alert("El curso debe tener al menos un módulo con una lección válida");
        return;
      }

      // Preparar datos para enviar a la API
      const courseData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        status: formData.status,
        estimatedDuration: formData.estimatedDuration,
        bannerImage: formData.bannerImage,
        visibility: formData.visibility,
        targetCompanies: formData.targetCompanies,
        modules: formData.modules,
      };

      // Llamar a la API para guardar el curso
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar el curso");
      }

      alert(result.message || "Curso guardado exitosamente");
      window.location.href = "/workspace/admin/courses";
    } catch (error) {
      console.error("Error al guardar el curso:", error);
      alert(
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
