"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Download,
  Eye,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const CompanyBilling = () => {
  // Datos de ejemplo - en una implementación real vendrían de la API
  const currentPlan = {
    name: "Premium",
    price: 299,
    currency: "USD",
    billingCycle: "monthly",
    nextBilling: "2024-02-15",
    status: "active",
    features: [
      "Hasta 50 empleados",
      "Acceso a todos los cursos",
      "Certificados ilimitados",
      "Soporte prioritario",
      "Reportes avanzados",
      "API de integración",
    ],
  };

  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      dueDate: "2024-01-15",
      amount: 299,
      currency: "USD",
      status: "paid",
      description: "Plan Premium - Enero 2024",
      invoiceNumber: "INV-2024-001",
    },
    {
      id: "INV-2023-012",
      date: "2023-12-15",
      dueDate: "2023-12-15",
      amount: 299,
      currency: "USD",
      status: "paid",
      description: "Plan Premium - Diciembre 2023",
      invoiceNumber: "INV-2023-012",
    },
    {
      id: "INV-2023-011",
      date: "2023-11-15",
      dueDate: "2023-11-15",
      amount: 299,
      currency: "USD",
      status: "paid",
      description: "Plan Premium - Noviembre 2023",
      invoiceNumber: "INV-2023-011",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
        );
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "Mensual";
      case "yearly":
        return "Anual";
      case "quarterly":
        return "Trimestral";
      default:
        return cycle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Facturación y Pagos</h1>
      </div>

      {/* Plan actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan Actual</CardTitle>
            <Button variant="outline">Cambiar Plan</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-primary">
                  {currentPlan.name}
                </h3>
                <p className="text-muted-foreground">
                  Plan actual de tu empresa
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${currentPlan.price}</span>
                <span className="text-muted-foreground">
                  /{getBillingCycleText(currentPlan.billingCycle)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(currentPlan.status)}
                <span className="text-sm text-muted-foreground">
                  Próxima facturación:{" "}
                  {new Date(currentPlan.nextBilling).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-semibold mb-3">Características incluidas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de facturación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$897</div>
            <p className="text-xs text-muted-foreground">Últimos 3 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Facturas Pagadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Total histórico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$299</div>
            <p className="text-xs text-muted-foreground">15 de Febrero, 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empleados Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">De 50 disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Historial de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{invoice.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      Factura #{invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fecha: {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ${invoice.amount} {invoice.currency}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vencimiento:{" "}
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  {getStatusBadge(invoice.status)}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métodos de pago */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Visa terminada en 4242</h3>
                  <p className="text-sm text-muted-foreground">
                    Método de pago principal
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  Eliminar
                </Button>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Agregar método de pago
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de Facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Ciclo de facturación:</span>
                <span className="text-sm font-medium">
                  {getBillingCycleText(currentPlan.billingCycle)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Próxima facturación:</span>
                <span className="text-sm font-medium">
                  {new Date(currentPlan.nextBilling).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Método de pago:</span>
                <span className="text-sm font-medium">Tarjeta de crédito</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Estado de la cuenta:</span>
                <span className="text-sm font-medium text-green-600">
                  Al día
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soporte de Facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">
                    ¿Necesitas ayuda con la facturación?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo está disponible 24/7
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Contactar Soporte
                </Button>
                <Button className="w-full" variant="outline">
                  Ver FAQ de Facturación
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyBilling;
