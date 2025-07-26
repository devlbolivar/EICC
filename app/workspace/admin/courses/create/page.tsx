"use client";

import { useAdmin } from "@/hooks/use-admin";
import { redirect } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  const { isAdmin } = useAdmin();

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/workspace");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Link href="/workspace/admin/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Curso</h1>
            <p className="text-gray-600 mt-2">
              Añade un nuevo curso al sistema
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del Curso</CardTitle>
            <CardDescription>
              Completa los datos del nuevo curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del curso</Label>
                <Input
                  id="name"
                  placeholder="Ingresa el nombre del curso"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el contenido del curso..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programación</SelectItem>
                      <SelectItem value="design">Diseño</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="business">Negocios</SelectItem>
                      <SelectItem value="languages">Idiomas</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapters">Número de capítulos</Label>
                  <Input
                    id="chapters"
                    type="number"
                    min="1"
                    placeholder="12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bannerImage">Imagen de portada (URL)</Label>
                  <Input
                    id="bannerImage"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeVideos"
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeVideos">Incluir videos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="rounded border-gray-300"
                  defaultChecked
                />
                <Label htmlFor="isPublic">Curso público</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded border-gray-300"
                  defaultChecked
                />
                <Label htmlFor="isActive">Curso activo</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Crear Curso
                </Button>
                <Link href="/workspace/admin/courses">
                  <Button variant="outline">Cancelar</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
