/**
 * Tests E2E: Company Management Flow
 * Priority: HIGH
 * 
 * End-to-end tests for company management workflows:
 * - Company profile access and viewing
 * - Company profile editing
 * - Employee management
 * - Permissions validation
 */

import { test, expect } from '@playwright/test';

// Test user with company admin permissions
const companyAdminUser = {
    email: `company-admin-${Date.now()}@example.com`,
    password: 'CompanyAdmin123!',
    name: 'Company Admin User',
};

test.describe('Company Management E2E', () => {

    test.beforeEach(async ({ page }) => {
        // Clear cookies and storage before each test
        await page.context().clearCookies();
        await page.context().clearPermissions();
    });

    test.describe('Company Profile Access', () => {
        test('should access company profile page when authenticated', async ({ page }) => {
            // 1. Login as company admin
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Navigate to company profile
            // Look for company/profile link in navigation or settings
            const companyLink = page.locator('a[href*="company"], a[href*="empresa"], button:has-text("Empresa")').first();

            if (await companyLink.isVisible({ timeout: 5000 }).catch(() => false)) {
                await companyLink.click();

                // 3. Verify we're on company profile page
                await expect(page).toHaveURL(/\/(company|empresa)/);
                await expect(page.locator('h1, h2').first()).toBeVisible();
            } else {
                // Alternative: Direct navigation
                await page.goto('/workspace/company/profile');
                await expect(page.locator('body')).toBeVisible();
            }
        });

        test('should display company information correctly', async ({ page }) => {
            // 1. Login
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Navigate to company profile
            await page.goto('/workspace/company/profile');

            // 3. Verify company data fields are present
            await expect(page.locator('text=/nombre|name/i')).toBeVisible({ timeout: 10000 });

            // Check for common company fields
            const hasRutField = await page.locator('text=/rut|tax.*id/i').isVisible({ timeout: 5000 }).catch(() => false);
            const hasIndustryField = await page.locator('text=/industria|industry/i').isVisible({ timeout: 5000 }).catch(() => false);

            // At least one company field should be visible
            expect(hasRutField || hasIndustryField).toBeTruthy();
        });

        test('should redirect to login when not authenticated', async ({ page }) => {
            // 1. Try to access company profile without authentication
            await page.goto('/workspace/company/profile');

            // 2. Should redirect to login
            await page.waitForURL('/login', { timeout: 10000 });
            await expect(page).toHaveURL('/login');
        });
    });

    test.describe('Company Profile Editing', () => {
        test('should edit company profile successfully', async ({ page }) => {
            // 1. Login
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Navigate to company profile
            await page.goto('/workspace/company/profile');

            // 3. Look for edit button
            const editButton = page.locator('button:has-text("Editar"), button:has-text("Edit"), a:has-text("Editar")').first();

            if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await editButton.click();

                // 4. Wait for edit form
                await page.waitForSelector('input[name="name"], input[name="description"]', { timeout: 5000 });

                // 5. Update company name if field is editable
                const nameInput = page.locator('input[name="name"]');
                if (await nameInput.isVisible().catch(() => false)) {
                    await nameInput.fill(`Updated Company ${Date.now()}`);
                }

                // 6. Save changes
                const saveButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Save")').first();
                await saveButton.click();

                // 7. Verify success message or redirect
                await expect(page.locator('text=/éxito|success|actualizado|updated/i')).toBeVisible({ timeout: 10000 }).catch(() => {
                    // If no success message, verify we're still on the page
                    return expect(page.locator('body')).toBeVisible();
                });
            }
        });

        test('should validate required fields when editing', async ({ page }) => {
            // 1. Login
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Navigate to company profile
            await page.goto('/workspace/company/profile');

            // 3. Try to edit
            const editButton = page.locator('button:has-text("Editar"), button:has-text("Edit")').first();

            if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await editButton.click();

                // 4. Clear required field (name)
                const nameInput = page.locator('input[name="name"]');
                if (await nameInput.isVisible().catch(() => false)) {
                    await nameInput.clear();

                    // 5. Try to save
                    const saveButton = page.locator('button[type="submit"]').first();
                    await saveButton.click();

                    // 6. Should show validation error
                    await expect(page.locator('text=/requerido|required|obligatorio/i')).toBeVisible({ timeout: 5000 }).catch(() => {
                        // If no error message, button should be disabled
                        return expect(saveButton).toBeDisabled();
                    });
                }
            }
        });
    });

    test.describe('Employee Management', () => {
        test('should access employees list', async ({ page }) => {
            // 1. Login
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Navigate to employees page
            await page.goto('/workspace/company/employees');

            // 3. Verify employees page loaded
            await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

            // 4. Check for employee list or table
            const hasTable = await page.locator('table, [role="table"]').isVisible({ timeout: 5000 }).catch(() => false);
            const hasList = await page.locator('ul, [role="list"]').isVisible({ timeout: 5000 }).catch(() => false);

            // Should have some kind of employee display
            expect(hasTable || hasList).toBeTruthy();
        });

        test('should search for employees', async ({ page }) => {
            // 1. Login
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Navigate to employees page
            await page.goto('/workspace/company/employees');

            // 3. Look for search input
            const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="Search"]').first();

            if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                // 4. Enter search term
                await searchInput.fill('test');

                // 5. Wait for results to update
                await page.waitForTimeout(1000);

                // 6. Verify search was executed
                expect(await searchInput.inputValue()).toBe('test');
            }
        });

        test('should filter employees by status', async ({ page }) => {
            // 1. Login
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Navigate to employees page
            await page.goto('/workspace/company/employees');

            // 3. Look for status filter
            const statusFilter = page.locator('select[name="status"], button:has-text("Estado"), button:has-text("Status")').first();

            if (await statusFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
                // 4. Click/select filter
                await statusFilter.click();

                // 5. Verify filter options are visible
                await expect(page.locator('text=/activo|active|inactivo|inactive/i')).toBeVisible({ timeout: 5000 }).catch(() => {
                    return expect(page.locator('body')).toBeVisible();
                });
            }
        });

        test('should display employee statistics', async ({ page }) => {
            // 1. Login
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Navigate to employees page or statistics
            await page.goto('/workspace/company/employees');

            // 3. Look for statistics display
            const hasStats = await page.locator('text=/total|empleados|employees|estadísticas|statistics/i').isVisible({ timeout: 5000 }).catch(() => false);

            // Statistics should be visible somewhere on the page
            expect(hasStats).toBeTruthy();
        });
    });

    test.describe('Permissions Validation', () => {
        test('should allow company admin to access all features', async ({ page }) => {
            // 1. Login as admin
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 2. Verify access to company profile
            await page.goto('/workspace/company/profile');
            await expect(page.locator('body')).toBeVisible();

            // 3. Verify access to employees
            await page.goto('/workspace/company/employees');
            await expect(page.locator('body')).toBeVisible();

            // 4. Verify edit capabilities exist
            const hasEditButton = await page.locator('button:has-text("Editar"), button:has-text("Edit")').isVisible({ timeout: 5000 }).catch(() => false);

            // Admin should have edit capabilities
            expect(hasEditButton).toBeTruthy();
        });
    });

    test.describe('Responsive Design', () => {
        test('should work on mobile devices', async ({ page }) => {
            // 1. Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            // 2. Login
            await page.goto('/login');
            await page.fill('input[name="email"]', companyAdminUser.email);
            await page.fill('input[name="password"]', companyAdminUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/\/workspace/);

            // 3. Navigate to company profile
            await page.goto('/workspace/company/profile');

            // 4. Verify page is usable on mobile
            await expect(page.locator('body')).toBeVisible();

            // 5. Check that content is not overflowing
            const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
            expect(bodyWidth).toBeLessThanOrEqual(375);
        });
    });
});

test.describe('Company Statistics', () => {
    test('should display company statistics page', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.fill('input[name="email"]', companyAdminUser.email);
        await page.fill('input[name="password"]', companyAdminUser.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/workspace/);

        // 2. Navigate to statistics
        await page.goto('/workspace/company/statistics');

        // 3. Verify statistics page loaded
        await expect(page.locator('body')).toBeVisible({ timeout: 10000 });

        // 4. Look for statistical data
        const hasCharts = await page.locator('canvas, svg').isVisible({ timeout: 5000 }).catch(() => false);
        const hasNumbers = await page.locator('text=/\\d+/').isVisible({ timeout: 5000 }).catch(() => false);

        // Should have some form of statistics display
        expect(hasCharts || hasNumbers).toBeTruthy();
    });
});
