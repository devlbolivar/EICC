import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

// Inicializar Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  stripePriceId: string | null;
  features: string[];
  limits: {
    employees: number;
    courses: number;
    certificates: boolean;
    support: string;
    api: boolean;
    customBranding: boolean;
    analytics: boolean;
  };
  popular?: boolean;
}

interface Subscription {
  id: string;
  plan: BillingPlan;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  isFreePlan: boolean;
  company: {
    id: string;
    name: string;
    subscriptionPlan: string;
  };
}

interface Invoice {
  id: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: string;
  invoiceNumber?: string;
  description?: string;
  pdfUrl?: string;
  hostedInvoiceUrl?: string;
  billingReason?: string;
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
}

interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  totalPaid: number;
}

export function useBilling(companyId?: string) {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats | null>(null);
  const [plans, setPlans] = useState<{
    monthly: BillingPlan[];
    yearly: BillingPlan[];
    all: BillingPlan[];
  } | null>(null);

  /**
   * Obtener la suscripción actual
   */
  const fetchSubscription = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/billing/subscription?companyId=${companyId}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener la suscripción");
      }

      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Error al cargar la suscripción");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  /**
   * Obtener el historial de facturas
   */
  const fetchInvoices = useCallback(
    async (limit: number = 10, offset: number = 0) => {
      if (!companyId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/billing/invoices?companyId=${companyId}&limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
          throw new Error("Error al obtener las facturas");
        }

        const data = await response.json();
        setInvoices(data.invoices);
        setInvoiceStats(data.stats);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Error al cargar las facturas");
      } finally {
        setLoading(false);
      }
    },
    [companyId]
  );

  /**
   * Obtener los planes disponibles
   */
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/billing/plans");

      if (!response.ok) {
        throw new Error("Error al obtener los planes");
      }

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Error al cargar los planes");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear una sesión de checkout para suscribirse a un plan
   */
  const createCheckoutSession = useCallback(
    async (priceId: string) => {
      if (!companyId) {
        toast.error("No se encontró la empresa");
        return;
      }

      try {
        setLoading(true);
        toast.loading("Preparando el pago...");

        const response = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
            companyId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error al crear la sesión de pago");
        }

        const { sessionId } = await response.json();

        // Redirigir a Stripe Checkout
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Error al cargar Stripe");
        }

        toast.dismiss();
        const result = await stripe.redirectToCheckout({ sessionId });

        if (result.error) {
          throw new Error(result.error.message);
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
        toast.dismiss();
        toast.error(
          error instanceof Error ? error.message : "Error al procesar el pago"
        );
      } finally {
        setLoading(false);
      }
    },
    [companyId]
  );

  /**
   * Abrir el portal de facturación de Stripe
   */
  const openCustomerPortal = useCallback(async () => {
    if (!companyId) {
      toast.error("No se encontró la empresa");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Abriendo portal de facturación...");

      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Error al abrir el portal de facturación"
        );
      }

      const { url } = await response.json();
      toast.dismiss();

      // Redirigir al portal de Stripe
      window.location.href = url;
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al abrir el portal de facturación"
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  /**
   * Descargar factura en PDF
   */
  const downloadInvoice = useCallback((invoice: Invoice) => {
    if (!invoice.pdfUrl) {
      toast.error("URL de PDF no disponible");
      return;
    }

    window.open(invoice.pdfUrl, "_blank");
  }, []);

  /**
   * Ver factura en línea
   */
  const viewInvoice = useCallback((invoice: Invoice) => {
    if (!invoice.hostedInvoiceUrl) {
      toast.error("URL de factura no disponible");
      return;
    }

    window.open(invoice.hostedInvoiceUrl, "_blank");
  }, []);

  /**
   * Verificar si el plan tiene una característica
   */
  const hasFeature = useCallback(
    (feature: keyof BillingPlan["limits"]): boolean => {
      if (!subscription?.plan) return false;

      const value = subscription.plan.limits[feature];
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value > 0 || value === -1;
      return !!value;
    },
    [subscription]
  );

  /**
   * Verificar límite de uso
   */
  const checkUsageLimit = useCallback(
    (
      feature: keyof BillingPlan["limits"],
      currentUsage: number
    ): {
      allowed: boolean;
      limit: number;
      usage: number;
      percentage: number;
    } => {
      if (!subscription?.plan) {
        return { allowed: false, limit: 0, usage: currentUsage, percentage: 0 };
      }

      const limit = subscription.plan.limits[feature];
      if (typeof limit !== "number") {
        return { allowed: true, limit: -1, usage: currentUsage, percentage: 0 };
      }

      // -1 significa ilimitado
      if (limit === -1) {
        return { allowed: true, limit: -1, usage: currentUsage, percentage: 0 };
      }

      const percentage = limit > 0 ? (currentUsage / limit) * 100 : 0;

      return {
        allowed: currentUsage < limit,
        limit,
        usage: currentUsage,
        percentage: Math.min(percentage, 100),
      };
    },
    [subscription]
  );

  /**
   * Formatear precio
   */
  const formatPrice = useCallback(
    (amount: number, currency: string = "USD") => {
      // Stripe devuelve los montos en centavos
      const value = amount / 100;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(value);
    },
    []
  );

  /**
   * Formatear fecha
   */
  const formatDate = useCallback((date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      fetchSubscription();
      fetchInvoices();
    }
  }, [companyId, fetchSubscription, fetchInvoices]);

  return {
    // Estado
    loading,
    subscription,
    invoices,
    invoiceStats,
    plans,

    // Métodos
    fetchSubscription,
    fetchInvoices,
    fetchPlans,
    createCheckoutSession,
    openCustomerPortal,
    downloadInvoice,
    viewInvoice,
    hasFeature,
    checkUsageLimit,
    formatPrice,
    formatDate,

    // Helpers
    isFreePlan: subscription?.isFreePlan ?? true,
    isActive: subscription?.status === "active",
    isCanceled: subscription?.cancelAtPeriodEnd ?? false,
    isPastDue: subscription?.status === "past_due",
  };
}
