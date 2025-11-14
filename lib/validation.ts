/**
 * Librería de validación de inputs para la plataforma E-Learning
 *
 * Proporciona funciones de validación y sanitización para todos los endpoints de la API
 * evitando inyección SQL, XSS, y otros ataques comunes.
 */

// ============================================
// TIPOS
// ============================================

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  data?: T;
  errors?: string[];
}

// ============================================
// VALIDACIÓN DE EMAIL
// ============================================

export function validateEmail(email: string): ValidationResult<string> {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email || typeof email !== 'string') {
    return { isValid: false, errors: ['Email es requerido'] };
  }

  const sanitized = email.toLowerCase().trim();

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, errors: ['Email inválido'] };
  }

  if (sanitized.length > 255) {
    return { isValid: false, errors: ['Email demasiado largo (máximo 255 caracteres)'] };
  }

  return { isValid: true, data: sanitized };
}

// ============================================
// VALIDACIÓN DE CONTRASEÑA
// ============================================

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
};

export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): ValidationResult<string> {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Contraseña es requerida'] };
  }

  if (password.length < requirements.minLength) {
    errors.push(`La contraseña debe tener al menos ${requirements.minLength} caracteres`);
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, data: password };
}

// ============================================
// VALIDACIÓN DE RUT (Chile)
// ============================================

export function validateRUT(rut: string): ValidationResult<string> {
  if (!rut || typeof rut !== 'string') {
    return { isValid: false, errors: ['RUT es requerido'] };
  }

  // Sanitizar: remover puntos y guiones
  const sanitized = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();

  // Formato: 12345678-9 o 123456789 (sin guión)
  const rutRegex = /^(\d{7,8})([0-9Kk])$/;
  const match = sanitized.match(rutRegex);

  if (!match) {
    return {
      isValid: false,
      errors: ['Formato de RUT inválido. Formato esperado: 12345678-9'],
    };
  }

  const [, digits, verifier] = match;

  // Algoritmo de validación del dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedVerifier = 11 - (sum % 11);
  const calculatedVerifier =
    expectedVerifier === 11 ? '0' : expectedVerifier === 10 ? 'K' : expectedVerifier.toString();

  if (calculatedVerifier !== verifier) {
    return { isValid: false, errors: ['RUT inválido (dígito verificador incorrecto)'] };
  }

  // Retornar en formato estándar con guión
  return { isValid: true, data: `${digits}-${verifier}` };
}

// ============================================
// VALIDACIÓN DE TEXTO GENÉRICO
// ============================================

export interface TextValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowEmpty?: boolean;
  trimWhitespace?: boolean;
  alphanumericOnly?: boolean;
  customRegex?: RegExp;
}

export function validateText(
  text: string,
  fieldName: string,
  options: TextValidationOptions = {}
): ValidationResult<string> {
  const {
    minLength = 1,
    maxLength = 255,
    allowEmpty = false,
    trimWhitespace = true,
    alphanumericOnly = false,
    customRegex,
  } = options;

  if (!text && !allowEmpty) {
    return { isValid: false, errors: [`${fieldName} es requerido`] };
  }

  if (!text && allowEmpty) {
    return { isValid: true, data: '' };
  }

  if (typeof text !== 'string') {
    return { isValid: false, errors: [`${fieldName} debe ser texto`] };
  }

  const sanitized = trimWhitespace ? text.trim() : text;

  if (sanitized.length < minLength) {
    return {
      isValid: false,
      errors: [`${fieldName} debe tener al menos ${minLength} caracteres`],
    };
  }

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      errors: [`${fieldName} debe tener máximo ${maxLength} caracteres`],
    };
  }

  if (alphanumericOnly && !/^[a-zA-Z0-9\s]+$/.test(sanitized)) {
    return {
      isValid: false,
      errors: [`${fieldName} solo puede contener letras, números y espacios`],
    };
  }

  if (customRegex && !customRegex.test(sanitized)) {
    return {
      isValid: false,
      errors: [`${fieldName} tiene un formato inválido`],
    };
  }

  return { isValid: true, data: sanitized };
}

// ============================================
// VALIDACIÓN DE UUID
// ============================================

export function validateUUID(id: string, fieldName: string = 'ID'): ValidationResult<string> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!id || typeof id !== 'string') {
    return { isValid: false, errors: [`${fieldName} es requerido`] };
  }

  if (!uuidRegex.test(id)) {
    return { isValid: false, errors: [`${fieldName} inválido`] };
  }

  return { isValid: true, data: id.toLowerCase() };
}

// ============================================
// VALIDACIÓN DE DATOS DE EMPRESA
// ============================================

export interface CompanyData {
  name: string;
  rut: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large';
  description?: string;
}

export function validateCompanyData(data: Partial<CompanyData>): ValidationResult<CompanyData> {
  const errors: string[] = [];
  const sanitized: Partial<CompanyData> = {};

  // Nombre (requerido)
  const nameValidation = validateText(data.name || '', 'Nombre de empresa', {
    minLength: 2,
    maxLength: 255,
  });
  if (!nameValidation.isValid) {
    errors.push(...(nameValidation.errors || []));
  } else {
    sanitized.name = nameValidation.data;
  }

  // RUT (requerido)
  const rutValidation = validateRUT(data.rut || '');
  if (!rutValidation.isValid) {
    errors.push(...(rutValidation.errors || []));
  } else {
    sanitized.rut = rutValidation.data;
  }

  // Email (opcional)
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...(emailValidation.errors || []));
    } else {
      sanitized.email = emailValidation.data;
    }
  }

  // Phone (opcional)
  if (data.phone) {
    const phoneValidation = validateText(data.phone, 'Teléfono', {
      minLength: 7,
      maxLength: 20,
      allowEmpty: true,
    });
    if (!phoneValidation.isValid) {
      errors.push(...(phoneValidation.errors || []));
    } else {
      sanitized.phone = phoneValidation.data;
    }
  }

  // Website (opcional)
  if (data.website) {
    const urlRegex = /^https?:\/\/.+\..+/;
    if (!urlRegex.test(data.website)) {
      errors.push('URL del sitio web inválida');
    } else {
      sanitized.website = data.website.trim();
    }
  }

  // Industry (opcional)
  if (data.industry) {
    sanitized.industry = data.industry.trim();
  }

  // Size (opcional)
  if (data.size) {
    if (!['small', 'medium', 'large'].includes(data.size)) {
      errors.push('Tamaño de empresa inválido');
    } else {
      sanitized.size = data.size;
    }
  }

  // Description (opcional)
  if (data.description) {
    const descValidation = validateText(data.description, 'Descripción', {
      maxLength: 1000,
      allowEmpty: true,
    });
    if (!descValidation.isValid) {
      errors.push(...(descValidation.errors || []));
    } else {
      sanitized.description = descValidation.data;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, data: sanitized as CompanyData };
}

// ============================================
// VALIDACIÓN DE DATOS DE CURSO
// ============================================

export interface CourseData {
  name: string;
  description: string;
  category: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  numberOfChapters?: number;
  difficulty?: string;
}

export function validateCourseData(data: Partial<CourseData>): ValidationResult<CourseData> {
  const errors: string[] = [];
  const sanitized: Partial<CourseData> = {};

  // Nombre (requerido)
  const nameValidation = validateText(data.name || '', 'Nombre del curso', {
    minLength: 3,
    maxLength: 255,
  });
  if (!nameValidation.isValid) {
    errors.push(...(nameValidation.errors || []));
  } else {
    sanitized.name = nameValidation.data;
  }

  // Descripción (requerido)
  const descValidation = validateText(data.description || '', 'Descripción', {
    minLength: 10,
    maxLength: 2000,
  });
  if (!descValidation.isValid) {
    errors.push(...(descValidation.errors || []));
  } else {
    sanitized.description = descValidation.data;
  }

  // Categoría (requerido)
  const categoryValidation = validateText(data.category || '', 'Categoría', {
    minLength: 2,
    maxLength: 100,
  });
  if (!categoryValidation.isValid) {
    errors.push(...(categoryValidation.errors || []));
  } else {
    sanitized.category = categoryValidation.data;
  }

  // Nivel (requerido)
  if (!data.level) {
    errors.push('Nivel es requerido');
  } else if (!['Básico', 'Intermedio', 'Avanzado'].includes(data.level)) {
    errors.push('Nivel inválido. Debe ser: Básico, Intermedio o Avanzado');
  } else {
    sanitized.level = data.level;
  }

  // Número de capítulos (opcional)
  if (data.numberOfChapters !== undefined) {
    const chapters = Number(data.numberOfChapters);
    if (isNaN(chapters) || chapters < 1 || chapters > 100) {
      errors.push('Número de capítulos debe estar entre 1 y 100');
    } else {
      sanitized.numberOfChapters = chapters;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, data: sanitized as CourseData };
}

// ============================================
// VALIDACIÓN DE DATOS DE USUARIO
// ============================================

export interface UserData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export function validateUserData(data: Partial<UserData>): ValidationResult<UserData> {
  const errors: string[] = [];
  const sanitized: Partial<UserData> = {};

  // Nombre (requerido)
  const nameValidation = validateText(data.name || '', 'Nombre', {
    minLength: 2,
    maxLength: 255,
  });
  if (!nameValidation.isValid) {
    errors.push(...(nameValidation.errors || []));
  } else {
    sanitized.name = nameValidation.data;
  }

  // Email (requerido)
  const emailValidation = validateEmail(data.email || '');
  if (!emailValidation.isValid) {
    errors.push(...(emailValidation.errors || []));
  } else {
    sanitized.email = emailValidation.data;
  }

  // Phone (opcional)
  if (data.phone) {
    const phoneValidation = validateText(data.phone, 'Teléfono', {
      minLength: 7,
      maxLength: 20,
      allowEmpty: true,
    });
    if (!phoneValidation.isValid) {
      errors.push(...(phoneValidation.errors || []));
    } else {
      sanitized.phone = phoneValidation.data;
    }
  }

  // Location (opcional)
  if (data.location) {
    const locationValidation = validateText(data.location, 'Ubicación', {
      maxLength: 255,
      allowEmpty: true,
    });
    if (!locationValidation.isValid) {
      errors.push(...(locationValidation.errors || []));
    } else {
      sanitized.location = locationValidation.data;
    }
  }

  // Bio (opcional)
  if (data.bio) {
    const bioValidation = validateText(data.bio, 'Biografía', {
      maxLength: 1000,
      allowEmpty: true,
    });
    if (!bioValidation.isValid) {
      errors.push(...(bioValidation.errors || []));
    } else {
      sanitized.bio = bioValidation.data;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, data: sanitized as UserData };
}

// ============================================
// SANITIZACIÓN XSS
// ============================================

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remover tags peligrosos
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remover event handlers
    .replace(/javascript:/gi, '')
    .trim();
}
