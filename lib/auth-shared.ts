import { SECURITY_CONFIG } from "@/lib/config";

// ===== CONSTANTES =====
export const PASSWORD_REQUIREMENTS = {
    MIN_LENGTH: SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
} as const;

// ===== VALIDACIÓN DE DATOS =====
export function validateEmail(email: string): boolean {
    // Regex más estricto que no permite puntos consecutivos ni dominios inválidos
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && !email.includes("..");
}

export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
        errors.push(`La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.MIN_LENGTH} caracteres`);
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("La contraseña debe contener al menos una letra mayúscula");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("La contraseña debe contener al menos una letra minúscula");
    }

    if (!/\d/.test(password)) {
        errors.push("La contraseña debe contener al menos un número");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

export function validateOrganizationSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
}

// ===== SANITIZACIÓN =====
export function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

export function sanitizeName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
}

export function sanitizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
