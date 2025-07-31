import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  validateEmail,
  validatePassword,
  sanitizeEmail,
  sanitizeName,
  sanitizeSlug,
} from "@/lib/auth";

// Mock de las variables de entorno
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.JWT_EXPIRES_IN = "1h";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";

describe("Auth Utilities", () => {
  describe("Password Hashing", () => {
    it("hashes password correctly", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("compares password correctly", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("rejects incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword123";
      const hash = await hashPassword(password);

      const isValid = await comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("handles empty password", async () => {
      const password = "";
      const hash = await hashPassword(password);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });
  });

  describe("Token Generation", () => {
    const mockPayload = {
      userId: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      permissions: ["platform:admin"],
    };

    it("generates access token", () => {
      const token = generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("generates refresh token", () => {
      const token = generateRefreshToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("generates token pair", () => {
      const tokenPair = generateTokenPair(mockPayload);

      expect(tokenPair).toHaveProperty("accessToken");
      expect(tokenPair).toHaveProperty("refreshToken");
      expect(typeof tokenPair.accessToken).toBe("string");
      expect(typeof tokenPair.refreshToken).toBe("string");
    });

    it("throws error when JWT_SECRET is not configured", () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateAccessToken(mockPayload)).toThrow(
        "JWT_SECRET not configured"
      );

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe("Token Verification", () => {
    const mockPayload = {
      userId: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      permissions: ["platform:admin"],
    };

    it("verifies valid access token", () => {
      const token = generateAccessToken(mockPayload);
      const verified = verifyAccessToken(token);

      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(mockPayload.userId);
      expect(verified?.email).toBe(mockPayload.email);
      expect(verified?.type).toBe("access");
    });

    it("verifies valid refresh token", () => {
      const token = generateRefreshToken(mockPayload);
      const verified = verifyRefreshToken(token);

      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(mockPayload.userId);
      expect(verified?.email).toBe(mockPayload.email);
      expect(verified?.type).toBe("refresh");
    });

    it("returns null for invalid token", () => {
      const verified = verifyToken("invalid-token");
      expect(verified).toBeNull();
    });

    it("returns null for expired token", () => {
      // Crear un token con expiración muy corta
      const originalExpiresIn = process.env.JWT_EXPIRES_IN;
      process.env.JWT_EXPIRES_IN = "1ms";

      const token = generateAccessToken(mockPayload);

      // Esperar a que expire
      setTimeout(() => {
        const verified = verifyToken(token);
        expect(verified).toBeNull();
      }, 10);

      process.env.JWT_EXPIRES_IN = originalExpiresIn;
    });

    it("returns null when JWT_SECRET is not configured", () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const verified = verifyToken("any-token");
      expect(verified).toBeNull();

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe("Email Validation", () => {
    it("validates correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "123@numbers.com",
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it("rejects invalid email addresses", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "user@",
        "user@.com",
        "user..name@example.com",
        "",
        "   ",
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe("Password Validation", () => {
    it("validates strong passwords", () => {
      const strongPassword = "StrongPass123";
      const result = validatePassword(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects weak passwords", () => {
      const weakPasswords = [
        "weak", // too short
        "weakpassword", // no uppercase, no numbers
        "WEAKPASSWORD", // no lowercase, no numbers
        "weakpass", // no uppercase, no numbers
      ];

      weakPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it("provides specific error messages", () => {
      const password = "weak";
      const result = validatePassword(password);

      expect(result.errors).toContain(
        "La contraseña debe tener al menos 8 caracteres"
      );
      expect(result.errors).toContain(
        "La contraseña debe contener al menos una letra mayúscula"
      );
      expect(result.errors).toContain(
        "La contraseña debe contener al menos un número"
      );
    });
  });

  describe("Sanitization Functions", () => {
    describe("sanitizeEmail", () => {
      it("sanitizes email correctly", () => {
        expect(sanitizeEmail("  TEST@EXAMPLE.COM  ")).toBe("test@example.com");
        expect(sanitizeEmail("User.Name@Domain.Com")).toBe(
          "user.name@domain.com"
        );
      });

      it("handles empty input", () => {
        expect(sanitizeEmail("")).toBe("");
        expect(sanitizeEmail("   ")).toBe("");
      });
    });

    describe("sanitizeName", () => {
      it("sanitizes name correctly", () => {
        expect(sanitizeName("  John   Doe  ")).toBe("John Doe");
        expect(sanitizeName("  Multiple    Spaces  ")).toBe("Multiple Spaces");
      });

      it("handles empty input", () => {
        expect(sanitizeName("")).toBe("");
        expect(sanitizeName("   ")).toBe("");
      });
    });

    describe("sanitizeSlug", () => {
      it("sanitizes slug correctly", () => {
        expect(sanitizeSlug("  Test Slug  ")).toBe("test-slug");
        expect(sanitizeSlug("Special Characters!@#$%")).toBe(
          "special-characters"
        );
        expect(sanitizeSlug("Multiple   Spaces")).toBe("multiple-spaces");
      });

      it("handles empty input", () => {
        expect(sanitizeSlug("")).toBe("");
        expect(sanitizeSlug("   ")).toBe("");
      });
    });
  });
});
