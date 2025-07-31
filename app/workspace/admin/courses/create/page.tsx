"use client";

import { CourseAdminGuard } from "../_components/CourseAdminGuard";
import { useState } from "react";
import { CourseWizard } from "./_components/CourseWizard";

export default function CreateCoursePage() {
  return (
    <CourseAdminGuard>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <a href="/workspace/admin/courses">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                ← Volver
              </button>
            </a>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Curso</h1>
              <p className="text-gray-600 mt-2">
                Crea un nuevo curso con módulos y lecciones
              </p>
            </div>
          </div>
        </div>

        <CourseWizard />
      </div>
    </CourseAdminGuard>
  );
}
