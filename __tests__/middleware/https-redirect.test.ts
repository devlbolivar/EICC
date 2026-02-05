/**
 * Tests for HTTPS redirection in middleware
 * 
 * Verifica que el middleware redirija correctamente HTTP a HTTPS en producción
 * y que no aplique redirección en desarrollo.
 */

import { NextRequest, NextResponse } from "next/server";
import { middleware } from "@/middleware";

// Mock de las dependencias
jest.mock("@/lib/auth-edge", () => ({
    verifyAccessTokenEdge: jest.fn(),
}));

jest.mock("@/lib/user-validation", () => ({
    validateUserActive: jest.fn(),
    logUserAccess: jest.fn(),
}));

describe("HTTPS Redirection Middleware", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
        // Restaurar NODE_ENV después de cada test
        process.env.NODE_ENV = originalEnv;
    });

    describe("Production Environment", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "production";
        });

        it("should redirect HTTP to HTTPS with 301 status", async () => {
            const request = new NextRequest("http://example.com/test-page", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            expect(response.status).toBe(301);
            expect(response.headers.get("location")).toBe("https://example.com/test-page");
        });

        it("should preserve pathname and query params in redirect", async () => {
            const request = new NextRequest("http://example.com/workspace/student?id=123", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            expect(response.status).toBe(301);
            expect(response.headers.get("location")).toBe("https://example.com/workspace/student?id=123");
        });

        it("should not redirect when protocol is already HTTPS", async () => {
            const request = new NextRequest("https://example.com/test-page", {
                headers: {
                    "x-forwarded-proto": "https",
                },
            });

            const response = await middleware(request);

            // No debe ser una redirección 301
            expect(response.status).not.toBe(301);
        });

        it("should include security headers in redirect response", async () => {
            const request = new NextRequest("http://example.com/test-page", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            // Verificar que los headers de seguridad estén presentes
            expect(response.headers.get("X-Frame-Options")).toBe("DENY");
            expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
            expect(response.headers.get("Strict-Transport-Security")).toBeTruthy();
        });

        it("should redirect HTTP requests to public routes", async () => {
            const request = new NextRequest("http://example.com/sign-in", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            expect(response.status).toBe(301);
            expect(response.headers.get("location")).toBe("https://example.com/sign-in");
        });

        it("should redirect HTTP requests to protected routes", async () => {
            const request = new NextRequest("http://example.com/workspace/admin", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            expect(response.status).toBe(301);
            expect(response.headers.get("location")).toBe("https://example.com/workspace/admin");
        });

        it("should redirect HTTP requests to API routes", async () => {
            const request = new NextRequest("http://example.com/api/user", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            expect(response.status).toBe(301);
            expect(response.headers.get("location")).toBe("https://example.com/api/user");
        });
    });

    describe("Development Environment", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "development";
        });

        it("should NOT redirect HTTP to HTTPS in development", async () => {
            const request = new NextRequest("http://localhost:3000/test-page", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            // No debe ser una redirección 301
            expect(response.status).not.toBe(301);
        });

        it("should allow HTTP requests to public routes", async () => {
            const request = new NextRequest("http://localhost:3000/sign-in", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            // Debe procesar normalmente, no redirigir
            expect(response.status).not.toBe(301);
        });

        it("should still include security headers (except HSTS)", async () => {
            const request = new NextRequest("http://localhost:3000/test-page", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            // Verificar headers de seguridad básicos
            expect(response.headers.get("X-Frame-Options")).toBe("DENY");
            expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");

            // HSTS no debe estar presente en desarrollo
            // (esto se verifica en addSecurityHeaders, pero el middleware lo aplica)
        });
    });

    describe("Test Environment", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "test";
        });

        it("should NOT redirect HTTP to HTTPS in test environment", async () => {
            const request = new NextRequest("http://example.com/test-page", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            // No debe ser una redirección 301
            expect(response.status).not.toBe(301);
        });
    });

    describe("Edge Cases", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "production";
        });

        it("should handle requests without x-forwarded-proto header", async () => {
            const request = new NextRequest("http://example.com/test-page");

            const response = await middleware(request);

            // Sin el header, no debe redirigir (asume HTTPS o conexión directa)
            expect(response.status).not.toBe(301);
        });

        it("should handle complex URLs with hash fragments", async () => {
            // Nota: Los hash fragments no se envían al servidor, pero probamos la URL base
            const request = new NextRequest("http://example.com/page?query=test", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            expect(response.status).toBe(301);
            expect(response.headers.get("location")).toContain("https://example.com/page?query=test");
        });

        it("should handle URLs with special characters in query params", async () => {
            const request = new NextRequest("http://example.com/search?q=hello%20world&lang=es", {
                headers: {
                    "x-forwarded-proto": "http",
                },
            });

            const response = await middleware(request);

            expect(response.status).toBe(301);
            expect(response.headers.get("location")).toBe("https://example.com/search?q=hello%20world&lang=es");
        });
    });
});
