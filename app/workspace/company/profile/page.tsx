"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Building2, Edit, Save, X } from "lucide-react";

const CompanyProfile = () => {
  const [isEditing, setIsEditing] = React.useState(false);

  // Datos de ejemplo - en una implementación real vendrían de la API
  const [companyData, setCompanyData] = React.useState({
    name: "TechCorp Solutions",
    rut: "76.123.456-7",
    description:
      "Empresa líder en soluciones tecnológicas para el sector financiero",
    website: "https://techcorp-solutions.cl",
    industry: "Tecnología",
    size: "medium",
    email: "contacto@techcorp-solutions.cl",
    phone: "+56 2 2345 6789",
    address: "Av. Providencia 1234, Providencia, Santiago",
  });

  const handleSave = () => {
    // Aquí iría la lógica para guardar los datos
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Perfil de la Empresa</h1>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Empresa</Label>
              <Input
                id="name"
                value={companyData.name}
                onChange={(e) =>
                  setCompanyData({ ...companyData, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                value={companyData.rut}
                onChange={(e) =>
                  setCompanyData({ ...companyData, rut: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={companyData.description}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    description: e.target.value,
                  })
                }
                disabled={!isEditing}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={companyData.website}
                onChange={(e) =>
                  setCompanyData({ ...companyData, website: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industria</Label>
              <Select
                value={companyData.industry}
                onValueChange={(value) =>
                  setCompanyData({ ...companyData, industry: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Finanzas">Finanzas</SelectItem>
                  <SelectItem value="Salud">Salud</SelectItem>
                  <SelectItem value="Educación">Educación</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Manufactura">Manufactura</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamaño de la Empresa</Label>
              <Select
                value={companyData.size}
                onValueChange={(value) =>
                  setCompanyData({ ...companyData, size: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">
                    Pequeña (1-50 empleados)
                  </SelectItem>
                  <SelectItem value="medium">
                    Mediana (51-200 empleados)
                  </SelectItem>
                  <SelectItem value="large">Grande (200+ empleados)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email de Contacto</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) =>
                  setCompanyData({ ...companyData, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) =>
                  setCompanyData({ ...companyData, phone: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={companyData.address}
                onChange={(e) =>
                  setCompanyData({ ...companyData, address: e.target.value })
                }
                disabled={!isEditing}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de suscripción */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Plan Actual</Label>
              <p className="text-lg font-semibold text-primary">Premium</p>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Fecha de Vencimiento
              </Label>
              <p className="text-lg font-semibold">15 de Diciembre, 2024</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Estado</Label>
              <p className="text-lg font-semibold text-green-600">Activo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfile;
