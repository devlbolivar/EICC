/**
 * Password utility functions for enhanced security
 */

// Password strength calculation
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
  if (password.length >= 16) {
    score += 3;
  } else if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Password is too short");
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

  // Bonus for multiple special characters
  if ((password.match(/[^A-Za-z0-9]/g) || []).length >= 2) {
    score += 1;
  }

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push("Avoid repeated characters");
  }

  // Penalty for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    score -= 1;
    feedback.push("Avoid sequential letters");
  }

  if (/(?:012|123|234|345|456|567|678|789)/.test(password)) {
    score -= 1;
    feedback.push("Avoid sequential numbers");
  }

  // Penalty for common weak passwords
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /^letmein/i,
    /^welcome/i,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 2;
    feedback.push("Avoid common passwords");
  }

  // Normalize score (0-5)
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

// Check if password meets minimum requirements
export function meetsMinimumRequirements(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate password requirements object for real-time validation
export function getPasswordRequirements(password: string): Record<string, boolean> {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

// Check password history (placeholder for future implementation)
export async function checkPasswordHistory(
  _userId: string,
  _newPassword: string,
  _historyCount: number = 3
): Promise<boolean> {
  // TODO: Implement password history table
  // This would check the last N passwords to prevent reuse
  //
  // Implementation steps:
  // 1. Create password_history table with: userId, passwordHash, createdAt
  // 2. On password change, store old hash in history
  // 3. Compare new password hash against history entries
  // 4. Return false if match found

  return true; // Allow by default until implemented
}

// Generate secure random password
export function generateSecurePassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + special;

  let password = "";

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Estimate password crack time (simplified)
export function estimateCrackTime(password: string): string {
  const { score } = calculatePasswordStrength(password);

  const times = [
    "Instantly",
    "Minutes",
    "Hours",
    "Days",
    "Months",
    "Years",
  ];

  return times[score] || "Unknown";
}
