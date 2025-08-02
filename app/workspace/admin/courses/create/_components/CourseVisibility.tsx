"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CourseVisibilityProps, CompanyOption } from "@/app/types";

import { toast } from "sonner";

export function CourseVisibility({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: CourseVisibilityProps) {
  const [availableCompanies] = useState<CompanyOption[]>([
    { id: "1", name: "TechCorp Solutions", rut: "12345678-9" },
    { id: "2", name: "Digital Innovations", rut: "23456789-0" },
    { id: "3", name: "StartupXYZ", rut: "34567890-1" },
    { id: "4", name: "Global Enterprises", rut: "45678901-2" },
    { id: "5", name: "Innovation Labs", rut: "56789012-3" },
  ]);

  const handleVisibilityChange = (
    visibility: "Público" | "Privado" | "Empresas específicas"
  ) => {
    updateFormData({
      visibility,
      targetCompanies: visibility === "Empresas específicas" ? [] : [],
    });
  };

  const toggleCompany = (companyId: string) => {
    const currentCompanies = formData.targetCompanies || [];
    const updatedCompanies = currentCompanies.includes(companyId)
      ? currentCompanies.filter((id) => id !== companyId)
      : [...currentCompanies, companyId];

    updateFormData({ targetCompanies: updatedCompanies });
  };

  const validateVisibility = () => {
    if (
      formData.visibility === "Empresas específicas" &&
      formData.targetCompanies.length === 0
    ) {
      toast.error(
        "Debes seleccionar al menos una empresa cuando la visibilidad es 'Empresas específicas'"
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateVisibility()) {
      toast.success("Configuración de visibilidad guardada");
      onNext();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Configuración de Visibilidad
        </h3>
        <p className="text-gray-600">
          Define quién puede acceder al curso y cómo será visible en la
          plataforma.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tipo de visibilidad */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Tipo de visibilidad *</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="public"
                name="visibility"
                value="Público"
                checked={formData.visibility === "Público"}
                onChange={(e) =>
                  handleVisibilityChange(e.target.value as "Público")
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="public" className="text-sm font-medium">
                Público
              </Label>
              <span className="text-sm text-gray-500">
                - Visible para todos los usuarios de la plataforma
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="private"
                name="visibility"
                value="Privado"
                checked={formData.visibility === "Privado"}
                onChange={(e) =>
                  handleVisibilityChange(e.target.value as "Privado")
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="private" className="text-sm font-medium">
                Privado
              </Label>
              <span className="text-sm text-gray-500">
                - Solo visible para el creador y administradores
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="specific"
                name="visibility"
                value="Empresas específicas"
                checked={formData.visibility === "Empresas específicas"}
                onChange={(e) =>
                  handleVisibilityChange(
                    e.target.value as "Empresas específicas"
                  )
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="specific" className="text-sm font-medium">
                Empresas específicas
              </Label>
              <span className="text-sm text-gray-500">
                - Visible solo para empresas seleccionadas
              </span>
            </div>
          </div>
        </div>

        {/* Selección de empresas específicas */}
        {formData.visibility === "Empresas específicas" && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Seleccionar empresas *
            </Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                {availableCompanies.map((company) => (
                  <div key={company.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`company-${company.id}`}
                      checked={
                        formData.targetCompanies?.includes(company.id) || false
                      }
                      onChange={() => toggleCompany(company.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label
                      htmlFor={`company-${company.id}`}
                      className="text-sm"
                    >
                      {company.name}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.targetCompanies?.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Debes seleccionar al menos una empresa
                </p>
              )}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Información importante
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los cursos públicos aparecerán en el catálogo general</li>
            <li>
              • Los cursos privados solo serán visibles para ti y
              administradores
            </li>
            <li>
              • Los cursos para empresas específicas solo serán visibles para
              usuarios de esas empresas
            </li>
            <li>
              • Puedes cambiar la visibilidad del curso en cualquier momento
            </li>
          </ul>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6 border-t mt-6">
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
