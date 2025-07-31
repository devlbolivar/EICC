"use client";

import { useState } from "react";
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
import { CourseFormData } from "./CourseWizard";

interface CourseBasicInfoProps {
  formData: CourseFormData;
  updateFormData: (updates: Partial<CourseFormData>) => void;
  onNext: () => void;
}

export function CourseBasicInfo({
  formData,
  updateFormData,
  onNext,
}: CourseBasicInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del curso es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción del curso es requerida";
    }

    if (!formData.category) {
      newErrors.category = "La categoría es requerida";
    }

    if (!formData.estimatedDuration.trim()) {
      newErrors.estimatedDuration = "La duración estimada es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const categories = [
    "Programación",
    "Diseño",
    "Marketing",
    "Negocios",
    "Idiomas",
    "Ciencias",
    "Arte",
    "Música",
    "Deportes",
    "Otro",
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Información Básica del Curso
        </h3>
        <p className="text-gray-600">
          Completa la información básica del curso. Todos los campos marcados
          con * son obligatorios.
        </p>
      </div>

      <div className="space-y-6">
        {/* Nombre del curso */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nombre del curso *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Ej: Introducción a React"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Descripción *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Describe el contenido y objetivos del curso..."
            rows={4}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Categoría y Nivel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoría *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateFormData({ category: value })}
            >
              <SelectTrigger
                className={errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level" className="text-sm font-medium">
              Nivel
            </Label>
            <Select
              value={formData.level}
              onValueChange={(value: "Básico" | "Intermedio" | "Avanzado") =>
                updateFormData({ level: value })
              }
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
        </div>

        {/* Duración estimada y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedDuration" className="text-sm font-medium">
              Duración estimada *
            </Label>
            <Input
              id="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={(e) =>
                updateFormData({ estimatedDuration: e.target.value })
              }
              placeholder="Ej: 8 horas, 2 semanas, 30 minutos"
              className={errors.estimatedDuration ? "border-red-500" : ""}
            />
            {errors.estimatedDuration && (
              <p className="text-sm text-red-600">{errors.estimatedDuration}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Estado
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "Borrador" | "Publicado" | "Archivado") =>
                updateFormData({ status: value })
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
        </div>

        {/* Imagen de portada */}
        <div className="space-y-2">
          <Label htmlFor="bannerImage" className="text-sm font-medium">
            Imagen de portada (URL)
          </Label>
          <Input
            id="bannerImage"
            type="url"
            value={formData.bannerImage}
            onChange={(e) => updateFormData({ bannerImage: e.target.value })}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <p className="text-xs text-gray-500">
            URL de la imagen de portada del curso (opcional)
          </p>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-end pt-6 border-t mt-6">
        <Button onClick={handleNext} className="px-6">
          Siguiente
        </Button>
      </div>
    </div>
  );
}
