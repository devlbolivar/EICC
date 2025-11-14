/**
 * Validador de variables de entorno
 * Verifica que todas las variables requeridas estén configuradas al inicio de la aplicación
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

const optionalEnvVars: Record<string, string> = {
  'STRIPE_SECRET_KEY': 'Sistema de facturación estará deshabilitado',
  'STRIPE_WEBHOOK_SECRET': 'Webhooks de Stripe no funcionarán',
  'GOOGLE_GENERATIVE_AI_API_KEY': 'Generación de cursos con IA estará deshabilitada',
  'SMTP_HOST': 'Envío de emails estará deshabilitado',
  'SMTP_PORT': 'Envío de emails estará deshabilitado',
  'SMTP_USER': 'Envío de emails estará deshabilitado',
  'SMTP_PASS': 'Envío de emails estará deshabilitado',
};

/**
 * Valida que todas las variables de entorno requeridas estén configuradas
 * Lanza error si falta alguna variable crítica
 * Muestra advertencias para variables opcionales faltantes
 */
export function validateEnv() {
  // Solo ejecutar en servidor
  if (typeof window !== 'undefined') {
    return;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar variables requeridas
  requiredEnvVars.forEach(key => {
    if (!process.env[key]) {
      errors.push(`❌ ${key} - REQUERIDO`);
    }
  });

  // Validar JWT_SECRET si existe
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      errors.push('❌ JWT_SECRET debe tener al menos 32 caracteres para seguridad');
    }

    if (process.env.JWT_SECRET === 'CHANGE_THIS_TO_A_RANDOM_STRING_OF_AT_LEAST_32_CHARACTERS') {
      errors.push('❌ JWT_SECRET sigue usando el valor por defecto. Genera uno seguro con: openssl rand -base64 32');
    }
  }

  // Verificar DATABASE_URL si existe
  if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
      errors.push('❌ DATABASE_URL debe ser una URL de PostgreSQL válida (postgresql://...)');
    }
  }

  // Verificar variables opcionales
  Object.entries(optionalEnvVars).forEach(([key, description]) => {
    if (!process.env[key]) {
      warnings.push(`⚠️  ${key} - ${description}`);
    }
  });

  // Mostrar errores y terminar si hay problemas críticos
  if (errors.length > 0) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🔴 ERROR: Variables de entorno faltantes o inválidas');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    errors.forEach(error => console.error(`   ${error}`));
    console.error('\n📝 Solución:');
    console.error('   1. Copia .env.example a .env.local');
    console.error('   2. Configura las variables requeridas');
    console.error('   3. Genera JWT_SECRET con: openssl rand -base64 32');
    console.error('   4. Reinicia el servidor\n');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    throw new Error('Variables de entorno faltantes. Revisa los mensajes arriba.');
  }

  // Mostrar advertencias si hay
  if (warnings.length > 0) {
    console.warn('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('⚠️  Variables de entorno opcionales faltantes:');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    warnings.forEach(warning => console.warn(`   ${warning}`));
    console.warn('\n💡 Estas funcionalidades estarán limitadas hasta que configures las variables.');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // Todo OK
  console.log('✅ Variables de entorno validadas correctamente\n');
}

/**
 * Obtiene una variable de entorno con validación
 * @param key - Nombre de la variable
 * @param defaultValue - Valor por defecto si no existe
 * @returns Valor de la variable o default
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Variable de entorno ${key} no encontrada y no tiene valor por defecto`);
  }

  return value;
}

/**
 * Verifica si una variable de entorno existe
 * @param key - Nombre de la variable
 * @returns true si existe
 */
export function hasEnv(key: string): boolean {
  return !!process.env[key];
}
