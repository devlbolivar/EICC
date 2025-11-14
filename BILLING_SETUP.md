# 💳 Guía de Configuración de Billing con Stripe

Esta guía te ayudará a configurar el sistema completo de facturación y suscripciones con Stripe en tu plataforma de aprendizaje online.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Stripe](#configuración-de-stripe)
3. [Configuración del Proyecto](#configuración-del-proyecto)
4. [Migración de Base de Datos](#migración-de-base-de-datos)
5. [Testing Local](#testing-local)
6. [Deployment a Producción](#deployment-a-producción)
7. [Troubleshooting](#troubleshooting)

## 🔧 Requisitos Previos

- Node.js 18+
- Cuenta de Stripe (crear en [stripe.com](https://stripe.com))
- PostgreSQL database configurada
- Variables de entorno existentes funcionando

## 🎯 Configuración de Stripe

### Paso 1: Crear Cuenta y Obtener API Keys

1. **Regístrate en Stripe**

   - Ve a [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
   - Completa el registro (no necesitas activar la cuenta para testing)

2. **Obtén tus API Keys**
   - Ve a [Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys)
   - Copia la "Publishable key" (empieza con `pk_test_`)
   - Copia la "Secret key" (empieza con `sk_test_`)

### Paso 2: Crear Productos y Precios

1. **Ve a la sección de Productos**

   - Navega a [Dashboard > Products](https://dashboard.stripe.com/products)

2. **Crea el Plan Premium**
   - Click en "Add product"
   - Nombre: `Premium`
   - Descripción: `Ideal para empresas en crecimiento`
   - Precio mensual: `$299 USD`
   - Modelo de precios: `Recurring` > `Monthly`
   - Guarda y copia el **Price ID** (empieza con `price_`)
3. **Crea el precio anual de Premium**

   - En el mismo producto Premium
   - Click en "Add another price"
   - Precio: `$2990 USD`
   - Modelo de precios: `Recurring` > `Yearly`
   - Guarda y copia el **Price ID**

4. **Crea el Plan Enterprise**
   - Repite el proceso para Enterprise
   - Precio mensual: `$999 USD`
   - Precio anual: `$9990 USD`
   - Copia ambos **Price IDs**

### Paso 3: Configurar Webhooks

1. **Ve a Webhooks**

   - Navega a [Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)

2. **Añade un Endpoint** (solo para producción por ahora)

   - Click en "Add endpoint"
   - URL: `https://tudominio.com/api/billing/webhooks`
   - Descripción: `Online Learning Platform Webhooks`

3. **Selecciona los Eventos**
   Marca estos eventos:

   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.finalized`

4. **Guarda el Webhook Secret**
   - Copia el "Signing secret" (empieza con `whsec_`)

## ⚙️ Configuración del Proyecto

### Paso 1: Variables de Entorno

Crea o actualiza tu archivo `.env` con estas variables:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica

# Stripe Webhook Secret (obtener con Stripe CLI para local)
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# Stripe Price IDs
STRIPE_PREMIUM_PRICE_ID=price_tu_price_id_premium_mensual
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_tu_price_id_premium_anual
STRIPE_ENTERPRISE_PRICE_ID=price_tu_price_id_enterprise_mensual
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_tu_price_id_enterprise_anual

# URL de tu aplicación
NEXT_PUBLIC_URL=http://localhost:3000
```

### Paso 2: Instalar Dependencias

Las dependencias ya están instaladas si seguiste la implementación. Si no:

```bash
npm install stripe @stripe/stripe-js
```

## 🗄️ Migración de Base de Datos

### Paso 1: Generar Migración

```bash
npm run db:generate
```

Esto generará las migraciones para las nuevas tablas:

- `subscriptions` - Almacena las suscripciones de las empresas
- `invoices` - Almacena el historial de facturas

### Paso 2: Aplicar Migración

```bash
npm run db:push
```

### Paso 3: Verificar Tablas

Verifica que las tablas se crearon correctamente:

```bash
npm run db:studio
```

Deberías ver las nuevas tablas `subscriptions` y `invoices` en Drizzle Studio.

## 🧪 Testing Local

### Paso 1: Instalar Stripe CLI

**Windows:**

```bash
winget install stripe
```

**macOS:**

```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**

```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Paso 2: Login a Stripe

```bash
stripe login
```

Esto abrirá tu navegador para autorizar el CLI.

### Paso 3: Forward Webhooks

```bash
stripe listen --forward-to localhost:3000/api/billing/webhooks
```

Copia el webhook signing secret que aparece (empieza con `whsec_`) y agrégalo a tu `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_el_secret_del_cli
```

### Paso 4: Iniciar Desarrollo

En una terminal separada:

```bash
npm run dev
```

### Paso 5: Probar el Flujo Completo

1. **Navega a Billing**

   ```
   http://localhost:3000/workspace/company/billing
   ```

2. **Selecciona un Plan**

   - Click en "Mejorar Plan" o "Cambiar Plan"
   - Selecciona Premium o Enterprise
   - Click en "Seleccionar"

3. **Completa el Checkout**

   - Usa tarjeta de prueba: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
   - ZIP: Cualquier 5 dígitos

4. **Verifica los Webhooks**

   - En la terminal con Stripe CLI deberías ver los eventos
   - Verifica en la base de datos que se creó la suscripción

5. **Prueba el Portal de Cliente**
   - Click en "Gestionar Suscripción"
   - Deberías ser redirigido al portal de Stripe
   - Prueba cambiar método de pago, cancelar, etc.

## 🚀 Deployment a Producción

### Paso 1: Activar Cuenta de Stripe

1. Ve a [Dashboard > Settings](https://dashboard.stripe.com/settings)
2. Completa la información de tu negocio
3. Activa tu cuenta

### Paso 2: Obtener Claves de Producción

1. Ve a [API Keys](https://dashboard.stripe.com/apikeys)
2. Cambia a "Live mode" (toggle en la esquina superior izquierda)
3. Copia las nuevas claves live (`sk_live_` y `pk_live_`)

### Paso 3: Configurar Webhooks de Producción

1. Ve a [Webhooks](https://dashboard.stripe.com/webhooks) en modo Live
2. Añade endpoint: `https://tudominio.com/api/billing/webhooks`
3. Selecciona los mismos eventos
4. Copia el webhook secret

### Paso 4: Actualizar Variables de Entorno

En tu plataforma de hosting (Vercel, Netlify, etc.), actualiza:

```env
# Claves LIVE de Stripe
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_live
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_live
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_live

# Price IDs en modo live
STRIPE_PREMIUM_PRICE_ID=price_live_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_live_...
STRIPE_ENTERPRISE_PRICE_ID=price_live_...
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_live_...

# URL de producción
NEXT_PUBLIC_URL=https://tudominio.com
```

### Paso 5: Testing en Producción

⚠️ **IMPORTANTE:** En producción se procesan pagos reales.

1. Primero haz pruebas internas con tarjetas de prueba si es posible
2. Verifica que los webhooks se reciban correctamente
3. Haz una transacción pequeña real y luego cancélala
4. Monitorea el [Dashboard de Stripe](https://dashboard.stripe.com) regularmente

## 🔍 Troubleshooting

### Los Webhooks No Se Reciben

**Problema:** Los eventos de Stripe no actualizan la base de datos.

**Soluciones:**

1. Verifica que la URL del webhook sea correcta
2. Asegúrate de que `STRIPE_WEBHOOK_SECRET` esté configurado
3. Revisa los logs en [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
4. Verifica que el endpoint responda correctamente: debería retornar 200

### Error: "No autenticado"

**Problema:** Las rutas API retornan 401.

**Soluciones:**

1. Verifica que estés logueado
2. Asegúrate de tener permisos de company admin
3. Verifica que el token JWT sea válido

### Error: "Plan no encontrado"

**Problema:** Los planes no se muestran o Price ID inválido.

**Soluciones:**

1. Verifica que los Price IDs en `.env` sean correctos
2. Asegúrate de usar Price IDs del modo correcto (test vs live)
3. Verifica que los productos estén activos en Stripe

### La Suscripción No Se Actualiza

**Problema:** Después del pago, la suscripción sigue en "inactive".

**Soluciones:**

1. Verifica que los webhooks se estén recibiendo
2. Revisa los logs del servidor
3. Asegúrate de que `companyId` esté en los metadatos de Stripe
4. Verifica la base de datos directamente

### Tarjetas de Prueba No Funcionan

**Problema:** Las tarjetas de prueba son rechazadas.

**Soluciones:**

1. Asegúrate de estar en modo test (claves con `sk_test_`)
2. Usa tarjetas de [documentación de Stripe](https://stripe.com/docs/testing)
3. Verifica que Stripe esté en modo test en el dashboard

## 📊 Monitoreo

### Métricas Importantes

Monitorea estas métricas en el Dashboard de Stripe:

1. **MRR (Monthly Recurring Revenue)** - Ingresos recurrentes mensuales
2. **Churn Rate** - Tasa de cancelación
3. **Failed Payments** - Pagos fallidos
4. **Active Subscriptions** - Suscripciones activas

### Alertas Recomendadas

Configura alertas para:

- Pagos fallidos
- Cancelaciones de suscripción
- Errores en webhooks
- Chargebacks

## 🔐 Seguridad

### Mejores Prácticas

1. **Nunca expongas `STRIPE_SECRET_KEY`** en el frontend
2. **Valida siempre las firmas de webhooks** (ya implementado)
3. **Usa HTTPS en producción** (requerido por Stripe)
4. **Rota las claves periódicamente** si se comprometen
5. **Mantén logs de todas las transacciones**
6. **Implementa rate limiting** en las rutas de API

### Cumplimiento

- Stripe maneja PCI compliance por ti
- No almacenes información de tarjetas
- Implementa términos de servicio y política de privacidad
- Cumple con GDPR/CCPA según tu jurisdicción

## 📚 Recursos Adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [Testing Guide](https://stripe.com/docs/testing)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Security Best Practices](https://stripe.com/docs/security)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor
2. Consulta el [Dashboard de Stripe](https://dashboard.stripe.com)
3. Revisa la [documentación de Stripe](https://stripe.com/docs)
4. Contacta al [soporte de Stripe](https://support.stripe.com)

## 🎉 ¡Listo!

Tu sistema de billing con Stripe está configurado y listo para usar. Los usuarios pueden:

- ✅ Ver planes disponibles
- ✅ Suscribirse a un plan
- ✅ Gestionar su suscripción
- ✅ Ver historial de facturas
- ✅ Descargar facturas en PDF
- ✅ Actualizar métodos de pago
- ✅ Cancelar suscripciones

---

**¿Necesitas ayuda?** Consulta la sección de Troubleshooting o revisa la documentación de Stripe.
