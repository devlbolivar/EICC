"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAdminCompanies } from "@/hooks/use-admin-companies";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PLAN_LIMITS } from "@/lib/plan-limits";

const PLAN_OPTIONS = [
  { value: "free",    label: "Gratuito",  description: `Hasta ${PLAN_LIMITS.free.maxEmployees} empleados · ${PLAN_LIMITS.free.maxDistinctCourses} cursos · Sin certificados` },
  { value: "starter", label: "Starter",   description: `Hasta ${PLAN_LIMITS.starter.maxEmployees} empleados · Todos los cursos · Con certificados` },
  { value: "pro",     label: "Pro",       description: `Hasta ${PLAN_LIMITS.pro.maxEmployees} empleados · Todos los cursos · Con certificados` },
];

export default function AdminCreateCompanyPage() {
  const { isAdmin } = useAdmin();
  const { createCompany } = useAdminCompanies();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    subscriptionPlan: "free",
  });

  if (!isAdmin) {
    redirect("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCompany(formData);
      toast.success("Empresa creada exitosamente");
      setFormData({ name: "", rut: "", email: "", phone: "", address: "", industry: "", subscriptionPlan: "free" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la empresa");
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
          <CardTitle>Crear Nueva Empresa</CardTitle>
          <CardDescription>
            Completa los detalles para registrar una nueva empresa en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa</Label>
                <Input id="name" placeholder="Nombre de la Empresa" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input id="rut" placeholder="12.345.678-9" value={formData.rut} onChange={handleChange} required />
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
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Empresa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
