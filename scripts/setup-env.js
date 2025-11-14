#!/usr/bin/env node

/**
 * Script de configuración de ambiente para EICC Platform
 *
 * Este script ayuda a configurar el archivo .env.local automáticamente
 * generando valores seguros para las claves secretas.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar al usuario
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Generar string aleatorio seguro
function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n╔══════════════════════════════════════════════════════╗', 'bright');
  log('║   🎓 EICC Platform - Configuración de Ambiente      ║', 'bright');
  log('╚══════════════════════════════════════════════════════╝\n', 'bright');

  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  // Verificar si .env.local ya existe
  if (fs.existsSync(envPath)) {
    log('⚠️  El archivo .env.local ya existe.', 'yellow');
    const overwrite = await question('¿Deseas sobrescribirlo? (s/N): ');
    if (overwrite.toLowerCase() !== 's') {
      log('\n✅ Configuración cancelada. Tu archivo .env.local no fue modificado.', 'green');
      rl.close();
      return;
    }
  }

  log('\n📝 Vamos a configurar tu ambiente paso a paso...\n', 'blue');

  // 1. Database URL
  log('1️⃣  Base de Datos (PostgreSQL)', 'bright');
  log('   Ejemplo local: postgresql://postgres:postgres@localhost:5432/eicc_db', 'blue');
  log('   Ejemplo Neon:  postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb\n', 'blue');

  const dbUrl = await question('   Database URL: ');

  // 2. JWT Secret (auto-generado)
  log('\n2️⃣  Seguridad JWT', 'bright');
  const jwtSecret = generateSecureSecret(32);
  log(`   ✓ JWT Secret generado automáticamente (seguro)\n`, 'green');

  // 3. Stripe (opcional)
  log('3️⃣  Stripe (Sistema de Pagos) - Opcional', 'bright');
  log('   Puedes dejarlo en blanco y configurarlo después\n', 'blue');

  const stripeSecretKey = await question('   Stripe Secret Key (sk_test_...): ');
  const stripePublishableKey = await question('   Stripe Publishable Key (pk_test_...): ');
  const stripeWebhookSecret = await question('   Stripe Webhook Secret (whsec_...): ');

  // 4. Google AI (opcional)
  log('\n4️⃣  Google AI (Generación de Contenido) - Opcional', 'bright');
  log('   Obtén tu API key en: https://makersuite.google.com/app/apikey\n', 'blue');

  const googleAiKey = await question('   Google AI API Key: ');

  // 5. Email (opcional)
  log('\n5️⃣  Configuración de Email - Opcional', 'bright');
  log('   Para desarrollo, usa Mailtrap: https://mailtrap.io\n', 'blue');

  const smtpHost = await question('   SMTP Host (ej: sandbox.smtp.mailtrap.io): ');
  const smtpUser = await question('   SMTP User: ');
  const smtpPass = await question('   SMTP Password: ');

  // Construir archivo .env.local
  const envContent = `# ============================================
# PLATAFORMA E-LEARNING - CONFIGURACIÓN DE ENTORNO
# ============================================
# Generado automáticamente el ${new Date().toISOString()}

# ============================================
# BASE DE DATOS
# ============================================
DATABASE_URL=${dbUrl || 'postgresql://user:password@localhost:5432/eicc_db'}

# ============================================
# SEGURIDAD - JWT
# ============================================
# Generado automáticamente - NO compartir
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# ============================================
# STRIPE - SISTEMA DE PAGOS
# ============================================
${stripeSecretKey ? `STRIPE_SECRET_KEY=${stripeSecretKey}` : '# STRIPE_SECRET_KEY=sk_test_your_key'}
${stripePublishableKey ? `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}` : '# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key'}
${stripeWebhookSecret ? `STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}` : '# STRIPE_WEBHOOK_SECRET=whsec_your_secret'}

# Price IDs (configurar después de crear productos en Stripe)
# NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_xxx
# NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_YEARLY=price_xxx
# NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_xxx
# NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_xxx

# ============================================
# GOOGLE AI - GENERACIÓN DE CONTENIDO
# ============================================
${googleAiKey ? `GOOGLE_GENERATIVE_AI_API_KEY=${googleAiKey}` : '# GOOGLE_GENERATIVE_AI_API_KEY=your_api_key'}

# ============================================
# EMAIL - SMTP
# ============================================
${smtpHost ? `SMTP_HOST=${smtpHost}` : '# SMTP_HOST=sandbox.smtp.mailtrap.io'}
${smtpHost ? `SMTP_PORT=2525` : '# SMTP_PORT=2525'}
${smtpUser ? `SMTP_USER=${smtpUser}` : '# SMTP_USER=your_user'}
${smtpPass ? `SMTP_PASS=${smtpPass}` : '# SMTP_PASS=your_password'}

EMAIL_FROM=noreply@tu-plataforma.com
EMAIL_FROM_NAME=Plataforma E-Learning

# ============================================
# NEXT.JS
# ============================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# CONFIGURACIÓN ADICIONAL (OPCIONAL)
# ============================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
ENABLE_DEBUG_LOGS=false
`;

  // Guardar archivo
  fs.writeFileSync(envPath, envContent);

  log('\n╔══════════════════════════════════════════════════════╗', 'green');
  log('║   ✅ Configuración completada exitosamente!          ║', 'green');
  log('╚══════════════════════════════════════════════════════╝\n', 'green');

  log('📄 Archivo creado: .env.local\n', 'bright');

  log('🚀 Próximos pasos:', 'bright');
  log('   1. Revisa el archivo .env.local', 'blue');
  log('   2. Instala las dependencias: npm install', 'blue');
  log('   3. Ejecuta las migraciones: npm run db:push', 'blue');
  log('   4. Inicia el servidor: npm run dev\n', 'blue');

  if (!stripeSecretKey || !googleAiKey || !smtpHost) {
    log('💡 Recordatorio:', 'yellow');
    if (!stripeSecretKey) log('   - Configura Stripe para habilitar el sistema de pagos', 'yellow');
    if (!googleAiKey) log('   - Configura Google AI para generar contenido de cursos', 'yellow');
    if (!smtpHost) log('   - Configura SMTP para enviar emails\n', 'yellow');
  }

  log('📚 Documentación: Ver README.md y archivos en la carpeta raíz\n', 'blue');

  rl.close();
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
