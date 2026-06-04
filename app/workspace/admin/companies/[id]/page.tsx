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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PLAN_LIMITS } from "@/lib/plan-limits";

const PLAN_OPTIONS = [
  { value: "free",    label: "Gratuito",  description: `Hasta ${PLAN_LIMITS.free.maxEmployees} empleados · ${PLAN_LIMITS.free.maxDistinctCourses} cursos · Sin certificados` },
  { value: "starter", label: "Starter",   description: `Hasta ${PLAN_LIMITS.starter.maxEmployees} empleados · Todos los cursos · Con certificados` },
  { value: "pro",     label: "Pro",       description: `Hasta ${PLAN_LIMITS.pro.maxEmployees} empleados · Todos los cursos · Con certificados` },
];

export default function AdminEditCompanyPage() {
  const { isAdmin } = useAdmin();
  const { companies, updateCompany, fetchCompanies } = useAdminCompanies();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    subscriptionPlan: "free",
    isActive: true,
  });

  const company = companies.find((c) => c.id === id);

  useEffect(() => {
    if (id && !company) {
      fetchCompanies();
    }
  }, [id, company, fetchCompanies]);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name ?? "",
        rut: company.rut ?? "",
        email: company.email ?? "",
        phone: company.phone ?? "",
        address: company.address ?? "",
        industry: company.industry ?? "",
        subscriptionPlan: company.subscriptionPlan ?? "free",
        isActive: company.isActive,
      });
    }
  }, [company]);

  if (!isAdmin) {
    redirect("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCompany(id as string, formData);
      toast.success("Empresa actualizada exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar la empresa");
    } finally {
      setLoading(false);
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
          <CardDescription>Modifica los detalles de la empresa.</CardDescription>
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
                  <Input id="address" placeholder="Av. Siempre Viva 123" value={formData.address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria</Label>
                  <Input id="industry" placeholder="Tecnología" value={formData.industry} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label>Plan de suscripción</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) => setFormData({ ...formData, subscriptionPlan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_OPTIONS.map((plan) => (
                        <SelectItem key={plan.value} value={plan.value}>
                          <div>
                            <span className="font-medium">{plan.label}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{plan.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.isActive ? "true" : "false"}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activa</SelectItem>
                      <SelectItem value="false">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
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
