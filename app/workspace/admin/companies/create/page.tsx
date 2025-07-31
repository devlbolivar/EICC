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

export default function CreateCompanyPage() {
  const { isAdmin } = useAdmin();

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Link href="/workspace/admin/companies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Empresa</h1>
            <p className="text-gray-600 mt-2">
              Añade una nueva empresa al sistema
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
            <CardDescription>
              Completa los datos de la nueva empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la empresa</Label>
                <Input
                  id="name"
                  placeholder="Ingresa el nombre de la empresa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input id="rut" placeholder="12.345.678-9" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe la empresa..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio web</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Tecnología</SelectItem>
                      <SelectItem value="healthcare">Salud</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="retail">Comercio</SelectItem>
                      <SelectItem value="manufacturing">Manufactura</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Tamaño de la empresa</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">
                        Pequeña (1-50 empleados)
                      </SelectItem>
                      <SelectItem value="medium">
                        Mediana (51-200 empleados)
                      </SelectItem>
                      <SelectItem value="large">
                        Grande (200+ empleados)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan de suscripción</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo (URL)</Label>
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded border-gray-300"
                  defaultChecked
                />
                <Label htmlFor="isActive">Empresa activa</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Crear Empresa
                </Button>
                <Link href="/workspace/admin/companies">
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
