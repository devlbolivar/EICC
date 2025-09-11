"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAdminCompanies } from "@/hooks/use-admin-companies";
import { redirect, useParams } from "next/navigation";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminEditCompanyPage() {
  const { isAdmin } = useAdmin();
  const { companies, updateCompany, fetchCompanies } = useAdminCompanies();
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    plan: "",
    isActive: true,
  });

  useEffect(() => {
    if (id) {
        const companyToEdit = companies.find((c) => c.id === id);
        if (companyToEdit) {
            setCompany(companyToEdit);
            setFormData({
                name: companyToEdit.name,
                rut: companyToEdit.rut,
                email: companyToEdit.email,
                phone: companyToEdit.phone,
                address: companyToEdit.address,
                industry: companyToEdit.industry,
                plan: companyToEdit.plan,
                isActive: companyToEdit.isActive,
            });
        } else {
            fetchCompanies();
        }
    }
  }, [id, companies]);

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompany(id as string, formData);
      toast.success("Empresa actualizada exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar la empresa");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link href="/workspace/admin/companies">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Empresa</CardTitle>
          <CardDescription>
            Modifica los detalles de la empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {company ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa</Label>
                  <Input id="name" placeholder="Nombre de la Empresa" value={formData.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input id="rut" placeholder="12.345.678-9" value={formData.rut} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Contacto</Label>
                  <Input id="email" type="email" placeholder="contacto@empresa.com" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" placeholder="+56 9 1234 5678" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" placeholder="Av. Siempre Viva 123, Springfield" value={formData.address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria</Label>
                  <Input id="industry" placeholder="Tecnología" value={formData.industry} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Input id="plan" placeholder="Premium" value={formData.plan} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          ) : (
            <p>Cargando...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}