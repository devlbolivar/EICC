import { validateUUID } from "@/lib/validation";

describe("UUID Validation", () => {
  describe("validateUUID", () => {
    // ===== VALID UUIDs =====
    describe("valid UUIDs", () => {
      it("validates standard UUID format", () => {
        const result = validateUUID("123e4567-e89b-12d3-a456-426614174000");
        expect(result.isValid).toBe(true);
        expect(result.data).toBe("123e4567-e89b-12d3-a456-426614174000");
      });

      it("validates uppercase UUID", () => {
        const result = validateUUID("123E4567-E89B-12D3-A456-426614174000");
        expect(result.isValid).toBe(true);
        expect(result.data).toBe("123e4567-e89b-12d3-a456-426614174000");
      });

      it("validates mixed case UUID", () => {
        const result = validateUUID("123e4567-E89B-12d3-A456-426614174000");
        expect(result.isValid).toBe(true);
        expect(result.data).toBe("123e4567-e89b-12d3-a456-426614174000");
      });

      it("validates UUID v1", () => {
        const result = validateUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
        expect(result.isValid).toBe(true);
      });

      it("validates UUID v4", () => {
        const result = validateUUID("550e8400-e29b-41d4-a716-446655440000");
        expect(result.isValid).toBe(true);
      });

      it("validates all zeros UUID", () => {
        const result = validateUUID("00000000-0000-0000-0000-000000000000");
        expect(result.isValid).toBe(true);
      });
    });

    // ===== INVALID UUIDs =====
    describe("invalid UUIDs", () => {
      it("rejects empty string", () => {
        const result = validateUUID("");
        expect(result.isValid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors![0]).toContain("ID");
      });

      it("rejects numeric string", () => {
        const result = validateUUID("12345");
        expect(result.isValid).toBe(false);
        expect(result.errors).toBeDefined();
      });

      it("rejects random string", () => {
        const result = validateUUID("not-a-uuid");
        expect(result.isValid).toBe(false);
        expect(result.errors).toBeDefined();
      });

      it("rejects UUID without hyphens", () => {
        const result = validateUUID("123e4567e89b12d3a456426614174000");
        expect(result.isValid).toBe(false);
      });

      it("rejects UUID with wrong hyphen positions", () => {
        const result = validateUUID("123e456-7e89b-12d3-a456-426614174000");
        expect(result.isValid).toBe(false);
      });

      it("rejects UUID with extra characters", () => {
        const result = validateUUID("123e4567-e89b-12d3-a456-4266141740001");
        expect(result.isValid).toBe(false);
      });

      it("rejects UUID with missing characters", () => {
        const result = validateUUID("123e4567-e89b-12d3-a456-42661417400");
        expect(result.isValid).toBe(false);
      });

      it("rejects UUID with invalid characters (g)", () => {
        const result = validateUUID("123e4567-e89b-12d3-a456-42661417400g");
        expect(result.isValid).toBe(false);
      });

      it("rejects UUID with spaces", () => {
        const result = validateUUID("123e4567 e89b 12d3 a456 426614174000");
        expect(result.isValid).toBe(false);
      });

      it("rejects SQL injection attempt", () => {
        const result = validateUUID("'; DROP TABLE users; --");
        expect(result.isValid).toBe(false);
      });

      it("rejects XSS attempt", () => {
        const result = validateUUID("<script>alert('xss')</script>");
        expect(result.isValid).toBe(false);
      });

      it("rejects path traversal attempt", () => {
        const result = validateUUID("../../etc/passwd");
        expect(result.isValid).toBe(false);
      });

      it("rejects null-like values", () => {
        const result = validateUUID("null");
        expect(result.isValid).toBe(false);
      });

      it("rejects undefined-like values", () => {
        const result = validateUUID("undefined");
        expect(result.isValid).toBe(false);
      });

      it("rejects only whitespace", () => {
        const result = validateUUID("   ");
        expect(result.isValid).toBe(false);
      });

      it("rejects UUID with leading/trailing spaces", () => {
        const result = validateUUID(" 123e4567-e89b-12d3-a456-426614174000 ");
        expect(result.isValid).toBe(false);
      });
    });

    // ===== CUSTOM FIELD NAMES =====
    describe("custom field names", () => {
      it("uses custom field name in error message", () => {
        const result = validateUUID("invalid", "Course ID");
        expect(result.isValid).toBe(false);
        expect(result.errors![0]).toContain("Course ID");
      });

      it("uses custom field name for User ID", () => {
        const result = validateUUID("invalid", "ID de usuario");
        expect(result.isValid).toBe(false);
        expect(result.errors![0]).toContain("ID de usuario");
      });

      it("uses default field name when not provided", () => {
        const result = validateUUID("invalid");
        expect(result.isValid).toBe(false);
        expect(result.errors![0]).toContain("ID");
      });
    });

    // ===== EDGE CASES =====
    describe("edge cases", () => {
      it("handles very long strings", () => {
        const longString = "a".repeat(1000);
        const result = validateUUID(longString);
        expect(result.isValid).toBe(false);
      });

      it("handles special characters", () => {
        const result = validateUUID("!@#$%^&*()");
        expect(result.isValid).toBe(false);
      });

      it("handles unicode characters", () => {
        const result = validateUUID("123e4567-e89b-12d3-a456-42661417000");
        expect(result.isValid).toBe(false);
      });

      it("handles newlines in string", () => {
        const result = validateUUID("123e4567-e89b-12d3\na456-426614174000");
        expect(result.isValid).toBe(false);
      });
    });
  });
});
