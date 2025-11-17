"use client";

import React, { useEffect, useState } from "react";
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
  Loader2,
  Calendar,
} from "lucide-react";
import { useCompany } from "@/hooks/use-company";
import { useBilling } from "@/hooks/use-billing";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const CompanyBilling = () => {
  const { company, employees } = useCompany();
  const companyId = company?.id;

  const {
    loading,
    subscription,
    invoices,
    invoiceStats,
    plans,
    createCheckoutSession,
    openCustomerPortal,
    downloadInvoice,
    viewInvoice,
    fetchPlans,
    formatPrice,
    formatDate,
    isFreePlan,
    isActive,
    isCanceled,
    isPastDue,
    checkUsageLimit,
  } = useBilling(companyId);

  const searchParams = useSearchParams();
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );

  // Manejar resultados de Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("¡Suscripción activada con éxito!");
    } else if (canceled === "true") {
      toast.info("Proceso de pago cancelado");
    }
  }, [searchParams]);

  // Cargar planes al abrir el selector
  useEffect(() => {
    if (showPlanSelector && !plans) {
      fetchPlans();
    }
  }, [showPlanSelector, plans, fetchPlans]);

  // Calcular límites de uso
  const employeeUsage = checkUsageLimit("employees", employees?.length || 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case "pending":
      case "open":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-orange-100 text-orange-800">Atrasado</Badge>
        );
      case "overdue":
      case "void":
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      case "trialing":
        return <Badge className="bg-blue-100 text-blue-800">Prueba</Badge>;
      case "canceled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBillingCycleText = (interval: string) => {
    switch (interval) {
      case "month":
        return "Mensual";
      case "year":
        return "Anual";
      default:
        return interval;
    }
  };

  const handleSelectPlan = async (stripePriceId: string) => {
    if (!stripePriceId) {
      toast.error("Este plan no está disponible");
      return;
    }
    await createCheckoutSession(stripePriceId);
  };

  if (loading && !subscription) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Facturación y Pagos</h1>
      </div>

      {/* Alerta de estado */}
      {isPastDue && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Pago atrasado</h3>
                <p className="text-sm text-red-700">
                  Tu último pago no pudo procesarse. Por favor actualiza tu
                  método de pago.
                </p>
              </div>
              <Button
                onClick={openCustomerPortal}
                variant="destructive"
                className="ml-auto"
              >
                Actualizar pago
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isCanceled && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">
                  Suscripción programada para cancelación
                </h3>
                <p className="text-sm text-orange-700">
                  Tu suscripción terminará el{" "}
                  {subscription?.currentPeriodEnd &&
                    formatDate(subscription.currentPeriodEnd)}
                  . Puedes reactivarla en cualquier momento.
                </p>
              </div>
              <Button
                onClick={openCustomerPortal}
                variant="outline"
                className="ml-auto"
              >
                Reactivar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan Actual</CardTitle>
            <div className="flex gap-2">
              {!isFreePlan && (
                <Button variant="outline" onClick={openCustomerPortal}>
                  Gestionar Suscripción
                </Button>
              )}
              <Button
                variant={isFreePlan ? "default" : "outline"}
                onClick={() => setShowPlanSelector(!showPlanSelector)}
              >
                {isFreePlan ? "Mejorar Plan" : "Cambiar Plan"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-primary">
                  {subscription?.plan.name || "Free"}
                </h3>
                <p className="text-muted-foreground">
                  {subscription?.plan.description || "Plan gratuito"}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  ${subscription?.plan.price || 0}
                </span>
                <span className="text-muted-foreground">
                  /{getBillingCycleText(subscription?.plan.interval || "month")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(subscription?.status || "active")}
                {subscription?.currentPeriodEnd && !isFreePlan && (
                  <span className="text-sm text-muted-foreground">
                    Próxima facturación:{" "}
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-semibold mb-3">Características incluidas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription?.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Límites de uso */}
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h5 className="font-semibold mb-2 text-sm">Uso actual:</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Empleados</span>
                      <span className="text-muted-foreground">
                        {employeeUsage.usage} /{" "}
                        {employeeUsage.limit === -1
                          ? "ilimitado"
                          : employeeUsage.limit}
                      </span>
                    </div>
                    {employeeUsage.limit !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            employeeUsage.percentage > 90
                              ? "bg-red-500"
                              : employeeUsage.percentage > 70
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${employeeUsage.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selector de planes */}
      {showPlanSelector && plans && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Seleccionar Plan</CardTitle>
              <div className="flex gap-2 bg-muted p-1 rounded-lg">
                <Button
                  variant={billingInterval === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingInterval("month")}
                >
                  Mensual
                </Button>
                <Button
                  variant={billingInterval === "year" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingInterval("year")}
                >
                  Anual
                  <Badge className="ml-2 bg-green-500">-17%</Badge>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(billingInterval === "month" ? plans.monthly : plans.yearly).map(
                (plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      plan.popular ? "border-primary border-2" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Más popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-3xl font-bold">
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground">
                          /{getBillingCycleText(plan.interval)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.stripePriceId ? (
                        <Button
                          className="w-full"
                          onClick={() => handleSelectPlan(plan.stripePriceId!)}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Seleccionar"
                          )}
                        </Button>
                      ) : (
                        <Button className="w-full" disabled>
                          Plan actual
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas de facturación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoiceStats ? formatPrice(invoiceStats.totalPaid) : "$0"}
            </div>
            <p className="text-xs text-muted-foreground">Total histórico</p>
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
            <div className="text-2xl font-bold">{invoiceStats?.paid || 0}</div>
            <p className="text-xs text-muted-foreground">
              De {invoiceStats?.total || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${subscription?.plan.price || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.currentPeriodEnd
                ? formatDate(subscription.currentPeriodEnd)
                : "N/A"}
            </p>
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
            <div className="text-2xl font-bold">{employeeUsage.usage}</div>
            <p className="text-xs text-muted-foreground">
              {employeeUsage.limit === -1
                ? "Ilimitado"
                : `De ${employeeUsage.limit} disponibles`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historial de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay facturas disponibles</p>
            </div>
          ) : (
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
                      <h3 className="font-semibold">
                        {invoice.description || "Suscripción"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Factura #
                        {invoice.invoiceNumber ||
                          invoice.stripeInvoiceId.slice(-8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Fecha: {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatPrice(invoice.amount)}
                      </div>
                      {invoice.paidAt && (
                        <p className="text-sm text-muted-foreground">
                          Pagado: {formatDate(invoice.paidAt)}
                        </p>
                      )}
                    </div>

                    {getStatusBadge(invoice.status)}

                    <div className="flex gap-2">
                      {invoice.hostedInvoiceUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewInvoice(invoice)}
                          title="Ver factura"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {invoice.pdfUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(invoice)}
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  {getBillingCycleText(subscription?.plan.interval || "month")}
                </span>
              </div>
              {subscription?.currentPeriodEnd && !isFreePlan && (
                <div className="flex justify-between">
                  <span className="text-sm">Próxima facturación:</span>
                  <span className="text-sm font-medium">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm">Estado de la cuenta:</span>
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isActive ? "Al día" : "Requiere atención"}
                </span>
              </div>
              {!isFreePlan && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openCustomerPortal}
                >
                  Gestionar método de pago
                </Button>
              )}
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
                    Nuestro equipo está disponible para ayudarte
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
