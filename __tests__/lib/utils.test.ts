import {
  sanitizeString,
  validateAndSanitizeEmail,
  validateSafeString,
  generateSecureToken,
  validateUUID,
  sanitizeObject,
  validateAllowedProperties,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("sanitizeString", () => {
    it("removes HTML tags", () => {
      const input = "<script>alert('xss')</script>Hello";
      const result = sanitizeString(input);
      expect(result).toBe("alert('xss')Hello");
    });

    it("removes JavaScript protocol", () => {
      const input = "javascript:alert('xss')";
      const result = sanitizeString(input);
      expect(result).toBe("alert('xss')");
    });

    it("removes event handlers", () => {
      const input = "onclick=alert('xss')";
      const result = sanitizeString(input);
      expect(result).toBe("alert('xss')");
    });

    it("trims whitespace", () => {
      const input = "  Hello World  ";
      const result = sanitizeString(input);
      expect(result).toBe("Hello World");
    });

    it("handles non-string input", () => {
      const input = null as any;
      const result = sanitizeString(input);
      expect(result).toBe("");
    });

    it("handles empty string", () => {
      const input = "";
      const result = sanitizeString(input);
      expect(result).toBe("");
    });
  });

  describe("validateAndSanitizeEmail", () => {
    it("validates and sanitizes correct email", () => {
      const input = "  TEST@EXAMPLE.COM  ";
      const result = validateAndSanitizeEmail(input);
      expect(result).toBe("test@example.com");
    });

    it("returns null for invalid email", () => {
      const input = "invalid-email";
      const result = validateAndSanitizeEmail(input);
      expect(result).toBeNull();
    });

    it("returns null for empty string", () => {
      const input = "";
      const result = validateAndSanitizeEmail(input);
      expect(result).toBeNull();
    });

    it("returns null for non-string input", () => {
      const input = null as any;
      const result = validateAndSanitizeEmail(input);
      expect(result).toBeNull();
    });

    it("handles valid email with special characters", () => {
      const input = "user+tag@example.com";
      const result = validateAndSanitizeEmail(input);
      expect(result).toBe("user+tag@example.com");
    });
  });

  describe("validateSafeString", () => {
    it("validates safe strings", () => {
      const safeStrings = [
        "Hello World",
        "Test123",
        "user-name",
        "text with spaces",
        "text, with. punctuation!",
      ];

      safeStrings.forEach((str) => {
        expect(validateSafeString(str)).toBe(true);
      });
    });

    it("rejects unsafe strings", () => {
      const unsafeStrings = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "onclick=alert('xss')",
        "text with <tags>",
      ];

      unsafeStrings.forEach((str) => {
        expect(validateSafeString(str)).toBe(false);
      });
    });

    it("respects maxLength parameter", () => {
      const longString = "a".repeat(256);
      expect(validateSafeString(longString, 255)).toBe(false);
      expect(validateSafeString(longString, 256)).toBe(true);
    });

    it("handles empty string", () => {
      expect(validateSafeString("")).toBe(false);
    });

    it("handles non-string input", () => {
      expect(validateSafeString(null as any)).toBe(false);
    });
  });

  describe("generateSecureToken", () => {
    it("generates token of specified length", () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(32);
    });

    it("generates different tokens", () => {
      const token1 = generateSecureToken(16);
      const token2 = generateSecureToken(16);
      expect(token1).not.toBe(token2);
    });

    it("generates token with correct characters", () => {
      const token = generateSecureToken(10);
      const validChars = /^[A-Za-z0-9]+$/;
      expect(token).toMatch(validChars);
    });

    it("uses default length when not specified", () => {
      const token = generateSecureToken();
      expect(token).toHaveLength(32);
    });
  });

  describe("validateUUID", () => {
    it("validates correct UUIDs", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ];

      validUUIDs.forEach((uuid) => {
        expect(validateUUID(uuid)).toBe(true);
      });
    });

    it("rejects invalid UUIDs", () => {
      const invalidUUIDs = [
        "not-a-uuid",
        "123e4567-e89b-12d3-a456-42661417400", // too short
        "123e4567-e89b-12d3-a456-4266141740000", // too long
        "123e4567-e89b-12d3-a456-42661417400g", // invalid character
        "",
        "   ",
      ];

      invalidUUIDs.forEach((uuid) => {
        expect(validateUUID(uuid)).toBe(false);
      });
    });
  });

  describe("sanitizeObject", () => {
    it("sanitizes string properties", () => {
      const input = {
        name: "<script>alert('xss')</script>John",
        email: "  TEST@EXAMPLE.COM  ",
        age: 25,
      };

      const result = sanitizeObject(input);
      expect(result.name).toBe("alert('xss')John");
      expect(result.email).toBe("test@example.com");
      expect(result.age).toBe(25);
    });

    it("handles nested objects", () => {
      const input = {
        user: {
          name: "<script>alert('xss')</script>John",
          email: "  TEST@EXAMPLE.COM  ",
        },
        active: true,
      };

      const result = sanitizeObject(input);
      expect(result.user?.name).toBe("alert('xss')John");
      expect(result.user?.email).toBe("test@example.com");
      expect(result.active).toBe(true);
    });

    it("handles arrays", () => {
      const input = {
        names: ["<script>alert('xss')</script>John", "Jane"],
        numbers: [1, 2, 3],
      };

      const result = sanitizeObject(input);
      expect(result.names).toEqual(["alert('xss')John", "Jane"]);
      expect(result.numbers).toEqual([1, 2, 3]);
    });

    it("handles empty object", () => {
      const input = {};
      const result = sanitizeObject(input);
      expect(result).toEqual({});
    });

    it("handles null and undefined", () => {
      const input = {
        name: null,
        email: undefined,
        age: 25,
      };

      const result = sanitizeObject(input);
      expect(result.name).toBeNull();
      expect(result.email).toBeUndefined();
      expect(result.age).toBe(25);
    });
  });

  describe("validateAllowedProperties", () => {
    it("validates object with only allowed properties", () => {
      const obj = { name: "John", email: "john@example.com" };
      const allowedProperties = ["name", "email"] as const;

      const result = validateAllowedProperties(obj, allowedProperties);
      expect(result).toBe(true);
    });

    it("rejects object with disallowed properties", () => {
      const obj = {
        name: "John",
        email: "john@example.com",
        password: "secret",
      };
      const allowedProperties = ["name", "email"] as const;

      const result = validateAllowedProperties(obj, allowedProperties);
      expect(result).toBe(false);
    });

    it("validates empty object", () => {
      const obj = {};
      const allowedProperties = ["name", "email"] as const;

      const result = validateAllowedProperties(obj, allowedProperties);
      expect(result).toBe(true);
    });

    it("validates object with subset of allowed properties", () => {
      const obj = { name: "John" };
      const allowedProperties = ["name", "email"] as const;

      const result = validateAllowedProperties(obj, allowedProperties);
      expect(result).toBe(true);
    });
  });
});
