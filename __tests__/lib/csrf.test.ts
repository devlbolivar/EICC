import { generateCsrfToken, validateCsrfToken, CSRF_CONFIG } from "@/lib/csrf";

describe("CSRF Stateless Implementation", () => {
    it("should generate a valid token", () => {
        const { token } = generateCsrfToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
        expect(token.split(":")).toHaveLength(3); // timestamp:random:signature
    });

    it("should validate a valid token", () => {
        const { token } = generateCsrfToken();
        const result = validateCsrfToken(token);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it("should reject a malformed token", () => {
        const result = validateCsrfToken("invalid-token");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Invalid CSRF token format");
    });

    it("should reject a token with invalid timestamp", () => {
        const { token } = generateCsrfToken();
        const parts = token.split(":");
        parts[0] = "invalid-timestamp";
        const invalidToken = parts.join(":");

        const result = validateCsrfToken(invalidToken);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Invalid CSRF token timestamp");
    });

    it("should reject an expired token", () => {
        // Mock Date.now to return a future time
        const realDateNow = Date.now;
        const futureTime = realDateNow() + CSRF_CONFIG.EXPIRY_MS + 1000;

        const { token } = generateCsrfToken();

        // Advance time
        global.Date.now = jest.fn(() => futureTime);

        const result = validateCsrfToken(token);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("CSRF token expired");

        // Restore Date.now
        global.Date.now = realDateNow;
    });

    it("should reject a token with invalid signature", () => {
        const { token } = generateCsrfToken();
        const parts = token.split(":");
        // Tamper with the random part
        parts[1] = "tampered-random";
        const tamperedToken = parts.join(":");

        const result = validateCsrfToken(tamperedToken);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Invalid CSRF signature");
    });
});
