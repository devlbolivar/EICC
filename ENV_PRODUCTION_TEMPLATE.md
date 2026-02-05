# ===== SEGURIDAD (OBLIGATORIO) =====
NODE_ENV=production
JWT_SECRET=<generar-con-openssl-rand-base64-32>
COOKIE_SECRET=<generar-con-openssl-rand-base64-32>

# ===== BASE DE DATOS (OBLIGATORIO) =====
DATABASE_URL=postgresql://user:password@host:port/database

# ===== APLICACIÓN (OBLIGATORIO) =====
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
CORS_ORIGIN=https://tu-dominio.com

# ===== EMAIL (OBLIGATORIO) =====
# Configuración SMTP para envío de emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@tu-dominio.com

# ===== JWT CONFIGURATION (OBLIGATORIO) =====
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# ===== RATE LIMITING (RECOMENDADO) =====
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# ===== FEATURES OPCIONALES (Configurar según necesidad) =====
# Certificados: Generar certificados automáticamente al completar cursos
ENABLE_CERTIFICATES=false

# Billing: Sistema de facturación con Stripe
ENABLE_BILLING=false
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Generación de cursos con IA
ENABLE_AI_GENERATION=false
GOOGLE_GENAI_API_KEY=

# Sistema de tickets de soporte
ENABLE_SUPPORT_TICKETS=false

# ===== LOGGING Y MONITOREO (OPCIONAL) =====
# Nivel de logging: error, warn, info, debug
LOG_LEVEL=info

# Sentry para monitoreo de errores (opcional)
# SENTRY_DSN=
# SENTRY_ENVIRONMENT=production

# ===== NOTAS IMPORTANTES =====
# 1. NUNCA commitear este archivo con valores reales
# 2. Generar JWT_SECRET y COOKIE_SECRET únicos:
#    - Linux/Mac: openssl rand -base64 32
#    - PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
# 3. En producción, usar variables de entorno del proveedor de hosting
# 4. Validar configuración con: npm run db:test
