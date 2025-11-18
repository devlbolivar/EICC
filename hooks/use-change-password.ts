"use client";

import { useState } from "react";
import { z } from "zod";

// Password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
  confirmPassword: z.string().min(1, "Please confirm password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordFormData = z.infer<typeof passwordSchema>;

export interface ChangePasswordResult {
  success: boolean;
  message: string;
}

export interface FieldErrors {
  currentPassword?: string[];
  newPassword?: string[];
  confirmPassword?: string[];
}

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const changePassword = async (data: PasswordFormData): Promise<ChangePasswordResult> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    try {
      // Client-side validation
      const validation = passwordSchema.safeParse(data);
      if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        setFieldErrors(errors as FieldErrors);
        const firstError = Object.values(errors)[0];
        const errorMessage = firstError?.[0] || "Validation failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // API call
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle field-specific errors from backend
        if (result.details) {
          setFieldErrors(result.details);
        }
        throw new Error(result.error || "Failed to change password");
      }

      setSuccess(true);
      return {
        success: true,
        message: result.message || "Password changed successfully",
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change password";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setFieldErrors({});
    setSuccess(false);
  };

  return {
    changePassword,
    loading,
    error,
    fieldErrors,
    success,
    reset,
  };
}

// Password strength calculator
export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { score: 0, label: "None", feedback: [] };
  }

  // Length scoring
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  // Character type scoring
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add special characters");
  }

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push("Avoid repeated characters");
  }

  if (/^[a-z]+$|^[A-Z]+$|^[0-9]+$/.test(password)) {
    score -= 1;
    feedback.push("Mix different character types");
  }

  // Normalize score
  score = Math.max(0, Math.min(5, score));

  // Determine label
  let label: string;
  if (score <= 1) {
    label = "Weak";
  } else if (score <= 2) {
    label = "Fair";
  } else if (score <= 3) {
    label = "Good";
  } else if (score <= 4) {
    label = "Strong";
  } else {
    label = "Very Strong";
  }

  return { score, label, feedback };
}
