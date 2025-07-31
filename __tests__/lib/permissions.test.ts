import {
  hasPermissionHierarchical,
  getMostRestrictiveRole,
  validateRouteAccess,
  hasFeatureAccess,
  getAllUserPermissions,
  canPerformAction,
} from "@/lib/permissions";
import { Permission } from "@/app/types";

describe("Permissions Utilities", () => {
  describe("hasPermissionHierarchical", () => {
    it("returns true when user has the exact permission", () => {
      const userPermissions: Permission[] = ["courses:read", "courses:write"];
      const requiredPermission: Permission = "courses:read";

      const result = hasPermissionHierarchical(
        userPermissions,
        requiredPermission
      );
      expect(result).toBe(true);
    });

    it("returns true when user has a higher permission that includes the required one", () => {
      const userPermissions: Permission[] = ["platform:admin"];
      const requiredPermission: Permission = "platform:read";

      const result = hasPermissionHierarchical(
        userPermissions,
        requiredPermission
      );
      expect(result).toBe(true);
    });

    it("returns false when user doesn't have the permission", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const requiredPermission: Permission = "courses:write";

      const result = hasPermissionHierarchical(
        userPermissions,
        requiredPermission
      );
      expect(result).toBe(false);
    });

    it("returns false when user has no permissions", () => {
      const userPermissions: Permission[] = [];
      const requiredPermission: Permission = "courses:read";

      const result = hasPermissionHierarchical(
        userPermissions,
        requiredPermission
      );
      expect(result).toBe(false);
    });
  });

  describe("getMostRestrictiveRole", () => {
    it("returns admin for platform:admin permission", () => {
      const permissions: Permission[] = ["platform:admin"];
      const result = getMostRestrictiveRole(permissions);
      expect(result).toBe("admin");
    });

    it("returns company for company:admin permission", () => {
      const permissions: Permission[] = ["company:admin"];
      const result = getMostRestrictiveRole(permissions);
      expect(result).toBe("company");
    });

    it("returns student for courses:enroll permission", () => {
      const permissions: Permission[] = ["courses:enroll"];
      const result = getMostRestrictiveRole(permissions);
      expect(result).toBe("student");
    });

    it("returns admin for platform:read permission", () => {
      const permissions: Permission[] = ["platform:read"];
      const result = getMostRestrictiveRole(permissions);
      expect(result).toBe("admin");
    });

    it("returns student for any permission when no specific role permissions", () => {
      const permissions: Permission[] = ["content:read"];
      const result = getMostRestrictiveRole(permissions);
      expect(result).toBe("student");
    });

    it("returns null when no permissions", () => {
      const permissions: Permission[] = [];
      const result = getMostRestrictiveRole(permissions);
      expect(result).toBe(null);
    });
  });

  describe("validateRouteAccess", () => {
    it("allows access to admin routes for admin users", () => {
      const userPermissions: Permission[] = ["platform:admin"];
      const route = "/workspace/admin";

      const result = validateRouteAccess(userPermissions, route);
      expect(result).toBe(true);
    });

    it("allows access to company routes for company users", () => {
      const userPermissions: Permission[] = ["company:admin"];
      const route = "/workspace/company";

      const result = validateRouteAccess(userPermissions, route);
      expect(result).toBe(true);
    });

    it("allows access to student routes for student users", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const route = "/workspace/student";

      const result = validateRouteAccess(userPermissions, route);
      expect(result).toBe(true);
    });

    it("denies access to admin routes for non-admin users", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const route = "/workspace/admin";

      const result = validateRouteAccess(userPermissions, route);
      expect(result).toBe(false);
    });

    it("allows access to unknown routes", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const route = "/unknown/route";

      const result = validateRouteAccess(userPermissions, route);
      expect(result).toBe(true);
    });
  });

  describe("hasFeatureAccess", () => {
    it("allows access to admin-dashboard for admin users", () => {
      const userPermissions: Permission[] = ["platform:admin"];
      const feature = "admin-dashboard";

      const result = hasFeatureAccess(userPermissions, feature);
      expect(result).toBe(true);
    });

    it("allows access to company-dashboard for company users", () => {
      const userPermissions: Permission[] = ["company:admin"];
      const feature = "company-dashboard";

      const result = hasFeatureAccess(userPermissions, feature);
      expect(result).toBe(true);
    });

    it("allows access to unknown features", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const feature = "unknown-feature";

      const result = hasFeatureAccess(userPermissions, feature);
      expect(result).toBe(true);
    });

    it("denies access when user lacks required permissions", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const feature = "admin-dashboard";

      const result = hasFeatureAccess(userPermissions, feature);
      expect(result).toBe(false);
    });
  });

  describe("getAllUserPermissions", () => {
    it("returns all permissions including hierarchical ones", () => {
      const userPermissions: Permission[] = ["platform:admin"];
      const result = getAllUserPermissions(userPermissions);

      expect(result).toContain("platform:admin");
      expect(result).toContain("platform:read");
      expect(result).toContain("platform:write");
    });

    it("returns original permissions when no hierarchy exists", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const result = getAllUserPermissions(userPermissions);

      expect(result).toEqual(userPermissions);
    });

    it("removes duplicates", () => {
      const userPermissions: Permission[] = ["platform:admin", "platform:read"];
      const result = getAllUserPermissions(userPermissions);

      // Debería tener solo una instancia de cada permiso
      expect(result.filter((p) => p === "platform:read")).toHaveLength(1);
    });
  });

  describe("canPerformAction", () => {
    it("allows create-user action for users with users:manage", () => {
      const userPermissions: Permission[] = ["users:manage"];
      const action = "create-user";

      const result = canPerformAction(userPermissions, action);
      expect(result).toBe(true);
    });

    it("allows create-course action for users with courses:create", () => {
      const userPermissions: Permission[] = ["courses:create"];
      const action = "create-course";

      const result = canPerformAction(userPermissions, action);
      expect(result).toBe(true);
    });

    it("allows unknown actions", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const action = "unknown-action";

      const result = canPerformAction(userPermissions, action);
      expect(result).toBe(true);
    });

    it("denies action when user lacks required permissions", () => {
      const userPermissions: Permission[] = ["courses:read"];
      const action = "create-user";

      const result = canPerformAction(userPermissions, action);
      expect(result).toBe(false);
    });
  });
});
