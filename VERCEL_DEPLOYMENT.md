# 🚀 Guía de Deployment en Vercel

## ⚠️ Variables de Entorno Requeridas

Antes de hacer deploy, **DEBES** configurar estas variables de entorno en Vercel:

### 📍 Cómo configurar en Vercel:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega cada una de las variables a continuación

---

## 🔑 Variables CRÍTICAS (Requeridas)

### `DATABASE_URL`
**Descripción:** URL de conexión a PostgreSQL (Neon, Supabase, etc.)
**Ejemplo:** `postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require`
**Ambientes:** Production, Preview, Development

**Cómo obtenerla:**
- **Neon Database:** Dashboard → Connection String → Copy
- **Supabase:** Project Settings → Database → Connection String

---

### `JWT_SECRET`
**Descripción:** Secreto para firmar tokens JWT (mínimo 32 caracteres)
**Ejemplo:** Genera uno con: `openssl rand -base64 32`
**Ambientes:** Production, Preview, Development

⚠️ **IMPORTANTE:** Usa un secreto DIFERENTE para cada ambiente

```bash
# Generar JWT_SECRET seguro:
openssl rand -base64 32
```

---

### `NEXT_PUBLIC_APP_URL`
**Descripción:** URL pública de tu aplicación
**Ejemplos:**
- Production: `https://tu-app.vercel.app`
- Preview: `https://tu-app-git-branch.vercel.app`
- Development: `http://localhost:3000`

**Ambientes:** Production, Preview, Development

---

## 💳 Variables de Stripe (Opcionales pero recomendadas)

### `STRIPE_SECRET_KEY`
**Descripción:** Stripe Secret Key
**Ejemplo:** `sk_live_...` (producción) o `sk_test_...` (desarrollo)
**Dónde obtenerla:** [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

### `STRIPE_PUBLISHABLE_KEY`
**Descripción:** Stripe Publishable Key
**Ejemplo:** `pk_live_...` (producción) o `pk_test_...` (desarrollo)

### `STRIPE_WEBHOOK_SECRET`
**Descripción:** Webhook signing secret para verificar eventos
**Ejemplo:** `whsec_...`
**Dónde obtenerla:** Stripe Dashboard → Developers → Webhooks

---

## 🤖 Variables de Google AI (Opcional)

### `GOOGLE_GENERATIVE_AI_API_KEY`
**Descripción:** API Key de Google Generative AI para generación de cursos
**Dónde obtenerla:** [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 📧 Variables de SMTP (Opcional)

Para envío de emails:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@tu-dominio.com
```

---

## 📋 Checklist de Deployment

- [ ] ✅ Variables de entorno configuradas en Vercel
- [ ] ✅ `DATABASE_URL` apunta a base de datos de producción
- [ ] ✅ `JWT_SECRET` generado de forma segura (no uses el del .env local)
- [ ] ✅ `NEXT_PUBLIC_APP_URL` apunta a tu dominio de Vercel
- [ ] ✅ Stripe configurado con keys de producción (si aplica)
- [ ] ⚠️ `.env` local **NO** se usa en Vercel (solo variables del dashboard)

---

## 🔧 Build Settings en Vercel

Estas configuraciones ya están en `next.config.js`:

```javascript
{
  eslint: { ignoreDuringBuilds: true },      // ✅ OK
  typescript: { ignoreBuildErrors: true },   // ⚠️ Temporal
}
```

**Nota:** `ignoreBuildErrors` está en `true` temporalmente. Una vez resueltos los errores de `useSearchParams`, cámbialo a `false`.

---

## 🐛 Troubleshooting

### Error: "JWT_SECRET must be set in production environment"
**Solución:** Configura `JWT_SECRET` en Vercel Environment Variables

### Error: "DATABASE_URL environment variable is not set"
**Solución:** Configura `DATABASE_URL` en Vercel Environment Variables

### Error: "useSearchParams() should be wrapped in a suspense boundary"
**Solución Temporal:** El proyecto está configurado con `ignoreBuildErrors: true`
**Solución Permanente:** Envolver componentes con `<Suspense>` (ver TODO en código)

---

## 📚 Recursos

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Database](https://neon.tech/)
- [Stripe API Keys](https://dashboard.stripe.com/apikeys)
- [Google AI Studio](https://makersuite.google.com/)

---

## 🔒 Seguridad

⚠️ **NUNCA** commitees archivos con:
- `.env.local` (git ignoreado)
- Valores reales de `JWT_SECRET`
- API keys de producción
- Credenciales de base de datos

✅ **SOLO** usa:
- `.env.example` (template sin valores sensibles)
- Variables de entorno de Vercel para valores reales
