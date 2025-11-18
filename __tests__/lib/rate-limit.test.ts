import {
  createRateLimiter,
  getRateLimitInfo,
  clearRateLimitStore,
  getRateLimitStoreSize,
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  queryRateLimit,
  RATE_LIMIT_CONFIGS,
} from "@/lib/rate-limit";

describe("Rate Limiting", () => {
  // Limpiar el store antes de cada test
  beforeEach(() => {
    clearRateLimitStore();
  });

  describe("createRateLimiter", () => {
    it("allows requests within the limit", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 3,
      });

      const mockRequest = createMockRequest("192.168.1.1", "/api/test");

      // Primeros 3 requests deberían pasar
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter(mockRequest);
        expect(result).toBeNull();
      }
    });

    it("blocks requests exceeding the limit", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 3,
        message: "Rate limit exceeded",
      });

      const mockRequest = createMockRequest("192.168.1.1", "/api/test");

      // Primeros 3 requests pasan
      for (let i = 0; i < 3; i++) {
        await rateLimiter(mockRequest);
      }

      // El 4to request debería ser bloqueado
      const result = await rateLimiter(mockRequest);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
    });

    it("returns correct error message", async () => {
      const customMessage = "Custom rate limit message";
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
        message: customMessage,
      });

      const mockRequest = createMockRequest("192.168.1.1", "/api/test");

      // Primer request pasa
      await rateLimiter(mockRequest);

      // Segundo request bloqueado
      const result = await rateLimiter(mockRequest);
      expect(result).not.toBeNull();

      const body = await result?.json();
      expect(body.error).toBe(customMessage);
    });

    it("includes retry-after header when blocked", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      const mockRequest = createMockRequest("192.168.1.1", "/api/test");

      await rateLimiter(mockRequest);
      const result = await rateLimiter(mockRequest);

      expect(result?.headers.get("Retry-After")).toBeDefined();
      expect(result?.headers.get("X-RateLimit-Limit")).toBe("1");
      expect(result?.headers.get("X-RateLimit-Remaining")).toBe("0");
    });

    it("tracks different IPs separately", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      const request1 = createMockRequest("192.168.1.1", "/api/test");
      const request2 = createMockRequest("192.168.1.2", "/api/test");

      // Primer IP consume su límite
      await rateLimiter(request1);
      const blocked1 = await rateLimiter(request1);
      expect(blocked1).not.toBeNull();

      // Segundo IP aún puede hacer requests
      const result2 = await rateLimiter(request2);
      expect(result2).toBeNull();
    });

    it("tracks different paths separately", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      const request1 = createMockRequest("192.168.1.1", "/api/test1");
      const request2 = createMockRequest("192.168.1.1", "/api/test2");

      // Primer path consume su límite
      await rateLimiter(request1);
      const blocked1 = await rateLimiter(request1);
      expect(blocked1).not.toBeNull();

      // Segundo path aún puede hacer requests
      const result2 = await rateLimiter(request2);
      expect(result2).toBeNull();
    });

    it("resets after window expires", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 100, // 100ms para test rápido
        maxRequests: 1,
      });

      const mockRequest = createMockRequest("192.168.1.1", "/api/test");

      // Consume el límite
      await rateLimiter(mockRequest);
      const blocked = await rateLimiter(mockRequest);
      expect(blocked).not.toBeNull();

      // Esperar a que expire la ventana
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Debería permitir nuevos requests
      const result = await rateLimiter(mockRequest);
      expect(result).toBeNull();
    });

    it("extracts IP from x-forwarded-for header", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      const mockRequest = createMockRequest(
        "192.168.1.1, 10.0.0.1",
        "/api/test"
      );

      await rateLimiter(mockRequest);
      const blocked = await rateLimiter(mockRequest);

      expect(blocked).not.toBeNull();
    });
  });

  describe("getRateLimitInfo", () => {
    it("returns correct info for new request", () => {
      const config = {
        windowMs: 60000,
        maxRequests: 10,
      };

      const mockRequest = createMockRequest("192.168.1.1", "/api/test");
      const info = getRateLimitInfo(mockRequest, config);

      expect(info.limit).toBe(10);
      expect(info.remaining).toBe(10);
      expect(info.reset).toBeGreaterThan(Date.now());
    });

    it("returns correct remaining after requests", async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 5,
      };

      const rateLimiter = createRateLimiter(config);
      const mockRequest = createMockRequest("192.168.1.1", "/api/test");

      // Hacer 3 requests
      for (let i = 0; i < 3; i++) {
        await rateLimiter(mockRequest);
      }

      const info = getRateLimitInfo(mockRequest, config);
      expect(info.remaining).toBe(2);
    });
  });

  describe("Store management", () => {
    it("clearRateLimitStore clears all records", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      const mockRequest = createMockRequest("192.168.1.1", "/api/test");
      await rateLimiter(mockRequest);

      expect(getRateLimitStoreSize()).toBeGreaterThan(0);

      clearRateLimitStore();
      expect(getRateLimitStoreSize()).toBe(0);
    });
  });

  describe("Preset rate limiters", () => {
    it("authRateLimit has correct configuration", async () => {
      const mockRequest = createMockRequest("192.168.1.1", "/api/auth/login");

      // authRateLimit permite 5 requests por 15 minutos
      for (let i = 0; i < 5; i++) {
        const result = await authRateLimit(mockRequest);
        expect(result).toBeNull();
      }

      // El 6to request debería ser bloqueado
      const blocked = await authRateLimit(mockRequest);
      expect(blocked).not.toBeNull();
      expect(blocked?.status).toBe(429);
    });

    it("strictRateLimit has correct configuration", async () => {
      const mockRequest = createMockRequest("192.168.1.1", "/api/admin/users");

      // strictRateLimit permite 10 requests por minuto
      for (let i = 0; i < 10; i++) {
        const result = await strictRateLimit(mockRequest);
        expect(result).toBeNull();
      }

      // El 11vo request debería ser bloqueado
      const blocked = await strictRateLimit(mockRequest);
      expect(blocked).not.toBeNull();
      expect(blocked?.status).toBe(429);
    });

    it("apiRateLimit has correct configuration", async () => {
      const mockRequest = createMockRequest("192.168.1.1", "/api/courses");

      // apiRateLimit permite 60 requests por minuto
      for (let i = 0; i < 60; i++) {
        const result = await apiRateLimit(mockRequest);
        expect(result).toBeNull();
      }

      // El 61vo request debería ser bloqueado
      const blocked = await apiRateLimit(mockRequest);
      expect(blocked).not.toBeNull();
      expect(blocked?.status).toBe(429);
    });

    it("queryRateLimit has correct configuration", async () => {
      const mockRequest = createMockRequest("192.168.1.1", "/api/query");

      // queryRateLimit permite 120 requests por minuto
      for (let i = 0; i < 120; i++) {
        const result = await queryRateLimit(mockRequest);
        expect(result).toBeNull();
      }

      // El 121vo request debería ser bloqueado
      const blocked = await queryRateLimit(mockRequest);
      expect(blocked).not.toBeNull();
      expect(blocked?.status).toBe(429);
    });
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("exports correct configurations", () => {
      expect(RATE_LIMIT_CONFIGS.auth.windowMs).toBe(15 * 60 * 1000);
      expect(RATE_LIMIT_CONFIGS.auth.maxRequests).toBe(5);

      expect(RATE_LIMIT_CONFIGS.strict.windowMs).toBe(60 * 1000);
      expect(RATE_LIMIT_CONFIGS.strict.maxRequests).toBe(10);

      expect(RATE_LIMIT_CONFIGS.api.windowMs).toBe(60 * 1000);
      expect(RATE_LIMIT_CONFIGS.api.maxRequests).toBe(60);

      expect(RATE_LIMIT_CONFIGS.query.windowMs).toBe(60 * 1000);
      expect(RATE_LIMIT_CONFIGS.query.maxRequests).toBe(120);
    });
  });
});

// Helper function to create mock requests
function createMockRequest(ip: string, pathname: string): Request {
  const url = `http://localhost:3000${pathname}`;
  const headers = new Headers();
  headers.set("x-forwarded-for", ip);

  return new Request(url, {
    method: "GET",
    headers,
  });
}
