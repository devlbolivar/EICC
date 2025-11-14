# Variables de Entorno para Stripe

Este documento describe todas las variables de entorno necesarias para configurar Stripe en tu aplicación.

## Variables Requeridas

Agrega estas variables a tu archivo `.env` (o `.env.local` para desarrollo):

```env
# ===== STRIPE CONFIGURATION =====

# Stripe API Keys
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Webhook Secret
# Get this from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret

# Stripe Price IDs for Plans
# Create these in Stripe Dashboard under Products

# Premium Plan (Monthly) - Example: $299/month
STRIPE_PREMIUM_PRICE_ID=price_premium_monthly_id

# Premium Plan (Yearly) - Example: $2990/year (saves ~17%)
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_premium_yearly_id

# Enterprise Plan (Monthly) - Example: $999/month
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly_id

# Enterprise Plan (Yearly) - Example: $9990/year (saves ~17%)
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_enterprise_yearly_id

# Next.js Public URL
NEXT_PUBLIC_URL=http://localhost:3000
```

## Descripción de Variables

### `STRIPE_SECRET_KEY`

- **Tipo:** Backend (privada)
- **Uso:** Autenticación con la API de Stripe desde el servidor
- **Formato:** `sk_test_...` (test) o `sk_live_...` (producción)
- **Dónde obtenerla:** [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)

### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- **Tipo:** Frontend (pública)
- **Uso:** Inicializar Stripe.js en el navegador
- **Formato:** `pk_test_...` (test) o `pk_live_...` (producción)
- **Dónde obtenerla:** [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)

### `STRIPE_WEBHOOK_SECRET`

- **Tipo:** Backend (privada)
- **Uso:** Verificar la autenticidad de los webhooks de Stripe
- **Formato:** `whsec_...`
- **Dónde obtenerla:**
  - Producción: [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
  - Desarrollo: Stripe CLI (ver sección de desarrollo local)

### `STRIPE_PREMIUM_PRICE_ID` y similares

- **Tipo:** Backend (privadas, pero podrían ser públicas)
- **Uso:** Identificar los planes de suscripción
- **Formato:** `price_...`
- **Dónde obtenerlas:** [Stripe Dashboard > Products](https://dashboard.stripe.com/products)

## Modos de Operación

### Modo Test (Desarrollo)

- Usa claves que comienzan con `sk_test_` y `pk_test_`
- No se procesan pagos reales
- Usa [tarjetas de prueba de Stripe](https://stripe.com/docs/testing)
- Ejemplo de tarjeta de prueba: `4242 4242 4242 4242`

### Modo Live (Producción)

- Usa claves que comienzan con `sk_live_` y `pk_live_`
- Se procesan pagos reales
- Requiere activación de cuenta Stripe
- Asegúrate de tener todos los webhooks configurados correctamente

## Seguridad

⚠️ **IMPORTANTE:**

- Nunca compartas tu `STRIPE_SECRET_KEY`
- Nunca commitas el archivo `.env` al control de versiones
- Agrega `.env` a tu `.gitignore`
- Usa diferentes claves para desarrollo y producción
- Rota tus claves periódicamente si se comprometen

## Tarjetas de Prueba

Para testing en modo de prueba, usa estas tarjetas:

| Tarjeta        | Número              | Comportamiento         |
| -------------- | ------------------- | ---------------------- |
| Visa           | 4242 4242 4242 4242 | Pago exitoso           |
| Visa (decline) | 4000 0000 0000 0002 | Pago rechazado         |
| Mastercard     | 5555 5555 5555 4444 | Pago exitoso           |
| 3D Secure      | 4000 0027 6000 3184 | Requiere autenticación |

- Fecha de vencimiento: Cualquier fecha futura
- CVC: Cualquier 3 dígitos
- ZIP: Cualquier 5 dígitos

## Verificación

Para verificar que tus variables están configuradas correctamente:

1. Inicia tu servidor de desarrollo
2. Ve a `/workspace/company/billing`
3. Deberías ver los planes disponibles
4. Intenta crear una suscripción (usa tarjetas de prueba)
5. Verifica que los webhooks se reciban correctamente

## Recursos

- [Documentación de Stripe](https://stripe.com/docs)
- [Testing en Stripe](https://stripe.com/docs/testing)
- [Webhooks de Stripe](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
