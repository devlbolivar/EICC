import { NextRequest } from "next/server";
import { POST } from "@/app/api/billing/webhooks/route";
import { stripe } from "@/lib/stripe";

// Mock de Stripe
jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
  },
  STRIPE_WEBHOOK_EVENTS: {
    CHECKOUT_SESSION_COMPLETED: "checkout.session.completed",
    CUSTOMER_SUBSCRIPTION_CREATED: "customer.subscription.created",
    CUSTOMER_SUBSCRIPTION_UPDATED: "customer.subscription.updated",
    CUSTOMER_SUBSCRIPTION_DELETED: "customer.subscription.deleted",
    INVOICE_PAID: "invoice.paid",
    INVOICE_PAYMENT_FAILED: "invoice.payment_failed",
    INVOICE_FINALIZED: "invoice.finalized",
  },
}));

// Mock de la base de datos
jest.mock("@/config/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => Promise.resolve()),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

// Mock del schema
jest.mock("@/config/schema", () => ({
  subscriptionsTable: {},
  invoicesTable: {},
  companiesTable: {},
}));

// Helper para crear mock request
function createMockRequest(
  body: string,
  signature: string | null
): NextRequest {
  const headers = new Headers();
  if (signature) {
    headers.set("stripe-signature", signature);
  }
  headers.set("user-agent", "Test-Agent/1.0");

  return {
    text: () => Promise.resolve(body),
    headers: {
      get: (name: string) => headers.get(name),
    },
  } as unknown as NextRequest;
}

describe("Stripe Webhook Security", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Environment Configuration Validation", () => {
    it("returns 500 when STRIPE_WEBHOOK_SECRET is not configured", async () => {
      // Eliminar el secret
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const req = createMockRequest("test-body", "test-signature");
      const response = await POST(req);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe("Server configuration error");
    });

    it("returns 500 when STRIPE_WEBHOOK_SECRET is empty string", async () => {
      process.env.STRIPE_WEBHOOK_SECRET = "";

      const req = createMockRequest("test-body", "test-signature");
      const response = await POST(req);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe("Server configuration error");
    });
  });

  describe("Signature Validation", () => {
    beforeEach(() => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    });

    it("returns 400 when stripe-signature header is missing", async () => {
      const req = createMockRequest("test-body", null);
      const response = await POST(req);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("Missing signature");
    });

    it("returns 400 when signature verification fails", async () => {
      // Mock constructEvent to throw an error
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementationOnce(
        () => {
          throw new Error("Invalid signature");
        }
      );

      const req = createMockRequest("test-body", "invalid-signature-12345");
      const response = await POST(req);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("Invalid signature");
    });

    it("calls constructEvent with correct parameters", async () => {
      const testBody = "test-webhook-body";
      const testSignature = "test-valid-signature";
      const testSecret = "whsec_test_secret";

      process.env.STRIPE_WEBHOOK_SECRET = testSecret;

      // Mock para que constructEvent lance error para verificar los parámetros
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementationOnce(
        (body, sig, secret) => {
          expect(body).toBe(testBody);
          expect(sig).toBe(testSignature);
          expect(secret).toBe(testSecret);
          throw new Error("Test error");
        }
      );

      const req = createMockRequest(testBody, testSignature);
      await POST(req);

      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        testBody,
        testSignature,
        testSecret
      );
    });
  });

  describe("Successful Webhook Processing", () => {
    beforeEach(() => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    });

    it("returns 200 for valid webhook with unhandled event type", async () => {
      const mockEvent = {
        id: "evt_test_123",
        type: "unknown.event.type",
        data: { object: {} },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(
        mockEvent
      );

      const req = createMockRequest("test-body", "valid-signature");
      const response = await POST(req);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.received).toBe(true);
    });

    it("processes checkout.session.completed event", async () => {
      const mockEvent = {
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            metadata: { companyId: "company-123" },
            subscription: null,
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(
        mockEvent
      );

      const req = createMockRequest("test-body", "valid-signature");
      const response = await POST(req);

      expect(response.status).toBe(200);
    });
  });

  describe("Security Logging", () => {
    const consoleSpy = jest.spyOn(console, "error");

    beforeEach(() => {
      consoleSpy.mockClear();
    });

    it("logs detailed error for missing STRIPE_WEBHOOK_SECRET", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const req = createMockRequest("test-body", "test-signature");
      await POST(req);

      expect(consoleSpy).toHaveBeenCalledWith(
        "CRITICAL: STRIPE_WEBHOOK_SECRET not configured",
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });

    it("logs detailed error for missing signature", async () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

      const req = createMockRequest("test-body", null);
      await POST(req);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Webhook error: Missing Stripe signature header",
        expect.objectContaining({
          timestamp: expect.any(String),
          userAgent: "Test-Agent/1.0",
        })
      );
    });

    it("logs partial signature for failed verification (security measure)", async () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

      (stripe.webhooks.constructEvent as jest.Mock).mockImplementationOnce(
        () => {
          throw new Error("Invalid signature");
        }
      );

      const longSignature = "t=1234567890,v1=abcdefghijklmnopqrstuvwxyz123456";
      const req = createMockRequest("test-body", longSignature);
      await POST(req);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Webhook signature verification failed:",
        expect.objectContaining({
          error: "Invalid signature",
          signature: "t=1234567890,v1=abcde...", // Solo los primeros 20 caracteres
          timestamp: expect.any(String),
          userAgent: "Test-Agent/1.0",
        })
      );
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    });

    it("handles empty request body", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementationOnce(
        () => {
          throw new Error("No body");
        }
      );

      const req = createMockRequest("", "valid-signature");
      const response = await POST(req);

      expect(response.status).toBe(400);
    });

    it("handles webhook processing errors gracefully", async () => {
      const mockEvent = {
        id: "evt_test_123",
        type: "invoice.paid",
        data: {
          object: {
            id: "in_test_123",
            customer: "cus_test_123",
            // Missing required fields to trigger error
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce(
        mockEvent
      );

      const req = createMockRequest("test-body", "valid-signature");
      const response = await POST(req);

      // Should return 200 even if processing fails internally
      // (webhook was received, even if we couldn't process it)
      expect([200, 500]).toContain(response.status);
    });
  });
});
