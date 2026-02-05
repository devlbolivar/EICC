import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

// ResizeObserver polyfill
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminUsersPage from "@/app/workspace/admin/users/page";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { useAdmin } from "@/hooks/use-admin";
import { toast } from "sonner";

// Mock hooks
jest.mock("@/hooks/use-admin-users");
jest.mock("@/hooks/use-admin");
jest.mock("sonner");
jest.mock("next/navigation", () => ({
    useSearchParams: () => ({ get: jest.fn() }),
    redirect: jest.fn(),
}));

// Mock UI components to simplify testing
jest.mock("@/components/ui/select", () => ({
    Select: ({ children, onValueChange }: any) => {
        return (
            <div data-testid="mock-select" onClick={() => onValueChange("role-1")}>
                {children}
            </div>
        );
    },
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => <div>Select Value</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children }: any) => <div>{children}</div>,
}));

describe("AdminUsersPage", () => {
    const mockCreateUser = jest.fn();
    const mockFetchUsers = jest.fn();
    const mockGetRoles = jest.fn().mockResolvedValue([
        { id: "role-1", name: "Admin", permissions: [], isSystemRole: true },
    ]);
    const mockGetCompanies = jest.fn().mockResolvedValue([]);

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdmin as jest.Mock).mockReturnValue({ isAdmin: true });
        (useAdminUsers as jest.Mock).mockReturnValue({
            users: [],
            loading: false,
            error: null,
            pagination: { page: 1, total: 0, totalPages: 0 },
            filters: {},
            fetchUsers: mockFetchUsers,
            createUser: mockCreateUser,
            getRoles: mockGetRoles,
            getCompanies: mockGetCompanies,
            setFilters: jest.fn(),
        });
    });

    // Mock fetch for CSRF token and create user
    global.fetch = jest.fn((url, options) => {
        if (url === "/api/csrf") {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: { token: "mock-csrf-token" } }),
            });
        }
        if (url === "/api/admin/users/create") {
            // Verify CSRF header
            const headers = options?.headers as Record<string, string>;
            if (headers["x-csrf-token"] !== "mock-csrf-token") {
                return Promise.resolve({
                    ok: false,
                    status: 403,
                    json: () => Promise.resolve({ error: "CSRF validation failed" }),
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ id: "new-user-id" }),
            });
        }
        return Promise.reject(new Error("Unknown URL"));
    }) as jest.Mock;

    it("calls createUser with correct data when form is valid", async () => {
        render(<AdminUsersPage />);

        // Open create dialog
        const triggerButtons = screen.getAllByRole("button", { name: /crear usuario/i });
        fireEvent.click(triggerButtons[0]);

        // Fill form
        fireEvent.change(screen.getByLabelText(/nombre \*/i), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByLabelText(/email \*/i), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/contraseña \*/i), {
            target: { value: "password123" },
        });

        // Simulate selecting role (our mock triggers onValueChange on click)
        const select = screen.getAllByTestId("mock-select")[0]; // First select is Role
        fireEvent.click(select);

        // Submit
        // The submit button is inside the dialog. We need to find the specific one.
        // Since there are multiple "Crear Usuario" buttons (trigger and submit), we take the last one which is usually the submit in dialog
        const buttons = screen.getAllByRole("button", { name: /crear usuario/i });
        const submitButton = buttons[buttons.length - 1];
        fireEvent.click(submitButton);

        // Check success
        await waitFor(() => {
            expect(mockCreateUser).toHaveBeenCalledWith({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                roleId: "role-1",
                companyId: undefined,
                age: undefined,
                subscriptionId: undefined,
                isActive: true,
            });
            expect(toast.success).toHaveBeenCalledWith("Usuario creado correctamente");
        });
    });
});
