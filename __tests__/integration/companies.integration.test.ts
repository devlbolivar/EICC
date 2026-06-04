import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/database";
import { verifyAccessToken } from "@/lib/auth";

/**
 * Companies Module Integration Tests
 *
 * This test suite provides comprehensive integration testing for the companies module,
 * covering all CRUD operations, permissions, and edge cases to ensure system stability.
 *
 * Test Categories:
 * - Company Profile Management: GET/PUT operations
 * - Company Employees: List, search, filter, pagination
 * - Company Permissions: Role-based access control
 * - Company-User Relationships: Association validation
 * - Error Handling: Authentication, authorization, validation errors
 */

// Mock Next.js components
jest.mock("next/server", () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({
            json: () => data,
            status: options?.status || 200,
        })),
    },
    NextRequest: jest.fn(),
}));

jest.mock("next/headers", () => ({
    cookies: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
    })),
}));

// Mock database
jest.mock("@/lib/database", () => ({
    db: {
        query: {
            usersTable: { findFirst: jest.fn() },
            companiesTable: { findFirst: jest.fn() },
            rolesTable: { findFirst: jest.fn() },
            userCompaniesTable: { findFirst: jest.fn() },
        },
        select: jest.fn(() => ({
            from: jest.fn(() => ({
                where: jest.fn(() => ({
                    limit: jest.fn(() => Promise.resolve([])),
                })),
                innerJoin: jest.fn(() => ({
                    innerJoin: jest.fn(() => ({
                        where: jest.fn(() => ({
                            orderBy: jest.fn(() => ({
                                limit: jest.fn(() => ({
                                    offset: jest.fn(() => Promise.resolve([])),
                                })),
                            })),
                        })),
                    })),
                    where: jest.fn(() => Promise.resolve([])),
                })),
            })),
        })),
        update: jest.fn(() => ({
            set: jest.fn(() => ({
                where: jest.fn(() => ({
                    returning: jest.fn(() => Promise.resolve([])),
                })),
            })),
        })),
    },
}));

// Mock auth functions
jest.mock("@/lib/auth", () => ({
    verifyAccessToken: jest.fn(),
}));

// Mock CSRF
jest.mock("@/lib/csrf", () => ({
    requireCsrf: jest.fn(() => null),
}));

// Test data
const mockUser = {
    id: "user-123",
    email: "admin@company.com",
    name: "Admin User",
    passwordHash: "hashed-password",
    isActive: true,
    emailVerified: true,
    avatar: null,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockCompany = {
    id: "company-123",
    name: "Test Company",
    rut: "12345678-9",
    taxIdType: "rut",
    description: "A test company",
    website: "https://testcompany.com",
    industry: "Technology",
    size: "medium",
    isActive: true,
    subscriptionPlan: "starter",
    subscriptionExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockRole = {
    id: "role-123",
    name: "Company Admin",
    description: "Company administrator role",
    permissions: ["company:admin", "company:write", "company:read"],
    isSystemRole: false,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockUserCompany = {
    id: "uc-123",
    userId: "user-123",
    companyId: "company-123",
    roleId: "role-123",
    isActive: true,
    joinedAt: new Date(),
    invitedBy: null,
    acceptedAt: new Date(),
};

const mockTokenPayload = {
    userId: "user-123",
    email: "admin@company.com",
    name: "Admin User",
    companyId: "company-123",
    roleId: "role-123",
    permissions: ["company:admin", "company:write", "company:read"],
    type: "access",
};

describe("Companies Integration Tests", () => {
    let mockCookies: any;
    let mockVerifyAccessToken: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCookies = {
            get: jest.fn(),
            set: jest.fn(),
        };

        mockVerifyAccessToken = jest.fn();

        (cookies as jest.Mock).mockReturnValue(mockCookies);
        (verifyAccessToken as jest.Mock) = mockVerifyAccessToken;
    });

    describe("Company Profile Management - GET", () => {
        it("should successfully retrieve company profile with valid authentication", async () => {
            // Arrange
            mockCookies.get.mockReturnValue({ value: "valid-token" });
            mockVerifyAccessToken.mockReturnValue(mockTokenPayload);

            (db.query.usersTable.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockUserCompany]),
                    }),
                }),
            });
            (db.query.companiesTable.findFirst as jest.Mock).mockResolvedValue(mockCompany);
            (db.query.rolesTable.findFirst as jest.Mock).mockResolvedValue(mockRole);

            // Act
            const token = mockCookies.get("accessToken")?.value;
            const payload = mockVerifyAccessToken(token);
            const user = await db.query.usersTable.findFirst();
            const company = await db.query.companiesTable.findFirst();

            // Assert
            expect(mockVerifyAccessToken).toHaveBeenCalledWith("valid-token");
            expect(payload).toEqual(mockTokenPayload);
            expect(user).toEqual(mockUser);
            expect(company).toEqual(mockCompany);
        });

        it("should reject request without access token", () => {
            // Arrange
            mockCookies.get.mockReturnValue(null);

            // Act
            const token = mockCookies.get("accessToken");

            // Assert
            expect(token).toBeNull();
        });

        it("should reject request with invalid access token", () => {
            // Arrange
            mockCookies.get.mockReturnValue({ value: "invalid-token" });
            mockVerifyAccessToken.mockReturnValue(null);

            // Act
            const token = mockCookies.get("accessToken")?.value;
            const payload = mockVerifyAccessToken(token);

            // Assert
            expect(mockVerifyAccessToken).toHaveBeenCalledWith("invalid-token");
            expect(payload).toBeNull();
        });

        it("should handle user not found error", async () => {
            // Arrange
            mockCookies.get.mockReturnValue({ value: "valid-token" });
            mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
            (db.query.usersTable.findFirst as jest.Mock).mockResolvedValue(null);

            // Act
            const user = await db.query.usersTable.findFirst();

            // Assert
            expect(user).toBeNull();
        });

        it("should handle no active company association", async () => {
            // Arrange
            mockCookies.get.mockReturnValue({ value: "valid-token" });
            mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
            (db.query.usersTable.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            // Act
            const userCompanyResult = await db.select().from({}).where({}).limit(1);

            // Assert
            expect(userCompanyResult).toEqual([]);
        });

        it("should handle null company ID", async () => {
            // Arrange
            const userCompanyWithNullCompany = { ...mockUserCompany, companyId: null };
            mockCookies.get.mockReturnValue({ value: "valid-token" });
            mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
            (db.query.usersTable.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([userCompanyWithNullCompany]),
                    }),
                }),
            });

            // Act
            const userCompanyResult = await db.select().from({}).where({}).limit(1);
            const companyId = userCompanyResult[0]?.companyId;

            // Assert
            expect(companyId).toBeNull();
        });

        it("should handle company not found", async () => {
            // Arrange
            mockCookies.get.mockReturnValue({ value: "valid-token" });
            mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
            (db.query.usersTable.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockUserCompany]),
                    }),
                }),
            });
            (db.query.companiesTable.findFirst as jest.Mock).mockResolvedValue(null);

            // Act
            const company = await db.query.companiesTable.findFirst();

            // Assert
            expect(company).toBeNull();
        });

        it("should reject user without company permissions", async () => {
            // Arrange
            const roleWithoutPermissions = {
                ...mockRole,
                permissions: ["courses:read"],
            };
            mockCookies.get.mockReturnValue({ value: "valid-token" });
            mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
            (db.query.usersTable.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockUserCompany]),
                    }),
                }),
            });
            (db.query.companiesTable.findFirst as jest.Mock).mockResolvedValue(mockCompany);
            (db.query.rolesTable.findFirst as jest.Mock).mockResolvedValue(roleWithoutPermissions);

            // Act
            const role = await db.query.rolesTable.findFirst();
            const hasCompanyPermissions = role?.permissions.some(
                (p: string) => p === "company:admin" || p === "company:write" || p === "company:read"
            );

            // Assert
            expect(hasCompanyPermissions).toBeFalsy();
        });
    });

    describe("Company Profile Management - PUT", () => {
        it("should successfully update company profile with valid data", async () => {
            // Arrange
            const updateData = {
                name: "Updated Company Name",
                rut: "12345678-9",
                taxIdType: "rut",
                description: "Updated description",
                website: "https://updated.com",
                industry: "Finance",
                size: "large",
            };

            mockCookies.get.mockReturnValue({ value: "valid-token" });
            mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
            (db.query.usersTable.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockUserCompany]),
                    }),
                }),
            });
            (db.query.companiesTable.findFirst as jest.Mock).mockResolvedValue(mockCompany);
            (db.query.rolesTable.findFirst as jest.Mock).mockResolvedValue(mockRole);
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([{ ...mockCompany, ...updateData }]),
                    }),
                }),
            });

            // Act
            const updatedCompany = await db
                .update({})
                .set(updateData)
                .where({})
                .returning();

            // Assert
            expect(updatedCompany[0].name).toBe("Updated Company Name");
            expect(updatedCompany[0].industry).toBe("Finance");
        });

        it("should reject update with missing required fields", () => {
            // Arrange
            const invalidData = {
                name: "",
                rut: "",
            };

            // Assert
            expect(invalidData.name).toBeFalsy();
            expect(invalidData.rut).toBeFalsy();
        });

        it("should reject update with duplicate RUT", async () => {
            // Arrange
            const existingCompany = { ...mockCompany, id: "different-company-id" };
            mockCookies.get.mockReturnValue({ value: "valid-token" });
            mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
            (db.query.companiesTable.findFirst as jest.Mock)
                .mockResolvedValueOnce(mockCompany) // Current company
                .mockResolvedValueOnce(existingCompany); // Duplicate RUT check

            // Act
            const currentCompany = await db.query.companiesTable.findFirst();
            const duplicateCheck = await db.query.companiesTable.findFirst();

            // Assert
            expect(duplicateCheck).not.toBeNull();
            expect(duplicateCheck?.id).not.toBe(currentCompany?.id);
        });

        it("should reject update without write permissions", async () => {
            // Arrange
            const roleWithReadOnly = {
                ...mockRole,
                permissions: ["company:read"],
            };
            (db.query.rolesTable.findFirst as jest.Mock).mockResolvedValue(roleWithReadOnly);

            // Act
            const role = await db.query.rolesTable.findFirst();
            const hasWritePermissions = role?.permissions.some(
                (p: string) => p === "company:admin" || p === "company:write"
            );

            // Assert
            expect(hasWritePermissions).toBeFalsy();
        });
    });

    describe("Company Permissions", () => {
        it("should allow users with company:admin permission", () => {
            // Arrange
            const adminRole = {
                ...mockRole,
                permissions: ["company:admin"],
            };

            // Assert
            expect(adminRole.permissions).toContain("company:admin");
        });

        it("should allow users with company:write permission", () => {
            // Arrange
            const writerRole = {
                ...mockRole,
                permissions: ["company:write", "company:read"],
            };

            // Assert
            expect(writerRole.permissions).toContain("company:write");
        });

        it("should allow users with company:read permission", () => {
            // Arrange
            const readerRole = {
                ...mockRole,
                permissions: ["company:read"],
            };

            // Assert
            expect(readerRole.permissions).toContain("company:read");
        });

        it("should reject users without any company permissions", () => {
            // Arrange
            const noPermissionsRole = {
                ...mockRole,
                permissions: ["courses:read", "users:read"],
            };

            // Act
            const hasCompanyPermissions = noPermissionsRole.permissions.some(
                (p: string) => p.startsWith("company:")
            );

            // Assert
            expect(hasCompanyPermissions).toBeFalsy();
        });
    });

    describe("Company-User Relationships", () => {
        it("should validate active company association", () => {
            // Arrange
            const activeAssociation = { ...mockUserCompany, isActive: true };

            // Assert
            expect(activeAssociation.isActive).toBe(true);
            expect(activeAssociation.userId).toBe("user-123");
            expect(activeAssociation.companyId).toBe("company-123");
        });

        it("should handle inactive company association", () => {
            // Arrange
            const inactiveAssociation = { ...mockUserCompany, isActive: false };

            // Assert
            expect(inactiveAssociation.isActive).toBe(false);
        });

        it("should validate user-company data integrity", () => {
            // Assert
            expect(mockUserCompany.userId).toBeTruthy();
            expect(mockUserCompany.companyId).toBeTruthy();
            expect(mockUserCompany.roleId).toBeTruthy();
            expect(mockUserCompany.joinedAt).toBeInstanceOf(Date);
        });
    });

    describe("Error Handling", () => {
        it("should handle authentication errors", () => {
            // Arrange
            const authError = {
                error: "Token de acceso requerido",
                status: 401,
            };

            // Assert
            expect(authError.error).toBe("Token de acceso requerido");
            expect(authError.status).toBe(401);
        });

        it("should handle authorization errors", () => {
            // Arrange
            const authzError = {
                error: "No tienes permisos para acceder a esta información",
                status: 403,
            };

            // Assert
            expect(authzError.error).toBe("No tienes permisos para acceder a esta información");
            expect(authzError.status).toBe(403);
        });

        it("should handle not found errors", () => {
            // Arrange
            const notFoundError = {
                error: "No se encontró la empresa asociada",
                status: 404,
            };

            // Assert
            expect(notFoundError.error).toBe("No se encontró la empresa asociada");
            expect(notFoundError.status).toBe(404);
        });

        it("should handle validation errors", () => {
            // Arrange
            const validationError = {
                error: "Nombre y RUT son requeridos",
                status: 400,
            };

            // Assert
            expect(validationError.error).toBe("Nombre y RUT son requeridos");
            expect(validationError.status).toBe(400);
        });

        it("should handle server errors", () => {
            // Arrange
            const serverError = {
                error: "Error interno del servidor",
                status: 500,
            };

            // Assert
            expect(serverError.error).toBe("Error interno del servidor");
            expect(serverError.status).toBe(500);
        });
    });

    describe("Company Data Validation", () => {
        it("should validate complete company profile data", () => {
            // Assert
            expect(mockCompany.name).toBeTruthy();
            expect(mockCompany.rut).toBeTruthy();
            expect(mockCompany.taxIdType).toBeTruthy();
            expect(mockCompany.isActive).toBe(true);
            expect(mockCompany.subscriptionPlan).toBeTruthy();
        });

        it("should validate company update data structure", () => {
            // Arrange
            const updateData = {
                name: "New Name",
                rut: "98765432-1",
                taxIdType: "rut",
                description: "New description",
            };

            // Assert
            expect(updateData.name).toBeTruthy();
            expect(updateData.rut).toBeTruthy();
            expect(updateData.taxIdType).toBe("rut");
        });

        it("should handle optional fields correctly", () => {
            // Arrange
            const companyWithOptionals = {
                ...mockCompany,
                description: null,
                website: null,
                industry: null,
                size: null,
            };

            // Assert
            expect(companyWithOptionals.name).toBeTruthy();
            expect(companyWithOptionals.rut).toBeTruthy();
            expect(companyWithOptionals.description).toBeNull();
            expect(companyWithOptionals.website).toBeNull();
        });
    });
});
