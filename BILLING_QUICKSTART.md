# ⚡ Quick Start: Configuración de Billing en 10 Minutos

Esta guía te permite configurar el sistema de billing rápidamente para empezar a probar.

## ✅ Checklist de Configuración

### Paso 1: Cuenta de Stripe (5 min)

- [ ] Crear cuenta en [stripe.com](https://stripe.com)
- [ ] Ir a [Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
- [ ] Copiar `pk_test_...` (Publishable key)
- [ ] Copiar `sk_test_...` (Secret key)

### Paso 2: Crear Productos (3 min)

- [ ] Ir a [Dashboard > Products](https://dashboard.stripe.com/products)
- [ ] Crear producto "Premium" con precio $299/mes
- [ ] Copiar Price ID del plan mensual
- [ ] Crear precio adicional $2990/año
- [ ] Copiar Price ID del plan anual
- [ ] Crear producto "Enterprise" con precio $999/mes
- [ ] Copiar Price ID del plan mensual
- [ ] Crear precio adicional $9990/año
- [ ] Copiar Price ID del plan anual

### Paso 3: Variables de Entorno (2 min)

Agregar a tu archivo `.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_[tu_clave]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[tu_clave]

# Price IDs
STRIPE_PREMIUM_PRICE_ID=price_[premium_monthly]
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_[premium_yearly]
STRIPE_ENTERPRISE_PRICE_ID=price_[enterprise_monthly]
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_[enterprise_yearly]

# URL
NEXT_PUBLIC_URL=http://localhost:3000
```

### Paso 4: Stripe CLI para Webhooks (5 min)

**Windows:**

```bash
winget install stripe
stripe login
stripe listen --forward-to localhost:3000/api/billing/webhooks
```

**macOS:**

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/billing/webhooks
```

**Linux:**

```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
stripe login
stripe listen --forward-to localhost:3000/api/billing/webhooks
```

- [ ] Copiar el webhook secret que aparece (empieza con `whsec_`)
- [ ] Agregarlo a `.env` como `STRIPE_WEBHOOK_SECRET=whsec_...`

### Paso 5: Migrar Base de Datos (1 min)

```bash
npm run db:generate
npm run db:push
```

- [ ] Verificar que se crearon las tablas `subscriptions` e `invoices`

### Paso 6: Iniciar Aplicación (1 min)

```bash
npm run dev
```

- [ ] Ir a `http://localhost:3000/workspace/company/billing`
- [ ] Deberías ver la página de billing con los planes

### Paso 7: Primera Prueba (3 min)

- [ ] Click en "Mejorar Plan" o "Cambiar Plan"
- [ ] Seleccionar un plan
- [ ] Click en "Seleccionar"
- [ ] En Stripe Checkout usar tarjeta: `4242 4242 4242 4242`
- [ ] Fecha: cualquier futura
- [ ] CVC: cualquier 3 dígitos
- [ ] Completar pago
- [ ] Verificar que redirige y muestra suscripción activa
- [ ] En la terminal de Stripe CLI ver los webhooks recibidos

---

## 🎯 Verificación Rápida

### ¿Todo funciona?

Verifica estos puntos:

- ✅ Ves los planes en la página de billing
- ✅ Puedes iniciar el checkout
- ✅ El pago se completa exitosamente
- ✅ Recibes webhooks en la terminal
- ✅ La suscripción se guarda en la base de datos
- ✅ La página muestra el plan activo

### Si algo no funciona:

1. **No veo los planes**

   - Verifica las variables de entorno en `.env`
   - Asegúrate de que los Price IDs sean correctos
   - Reinicia el servidor

2. **Error en checkout**

   - Verifica `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Asegúrate de estar usando claves de test
   - Revisa la consola del navegador

3. **Webhooks no se reciben**

   - Verifica que Stripe CLI esté corriendo
   - Verifica la URL del webhook
   - Asegúrate de que `STRIPE_WEBHOOK_SECRET` esté configurado

4. **Suscripción no se guarda**
   - Verifica que las tablas existen en la DB
   - Revisa los logs del servidor
   - Verifica los webhooks en Stripe CLI

---

## 🧪 Tarjetas de Prueba

| Escenario      | Número              | CVC | Fecha |
| -------------- | ------------------- | --- | ----- |
| Pago exitoso   | 4242 4242 4242 4242 | 123 | 12/34 |
| Pago rechazado | 4000 0000 0000 0002 | 123 | 12/34 |
| Requiere 3DS   | 4000 0027 6000 3184 | 123 | 12/34 |

---

## 📚 Siguiente Paso

Una vez que todo funcione en desarrollo:

1. **Lee la guía completa:** `BILLING_SETUP.md`
2. **Configura producción:** Sección de deployment
3. **Personaliza planes:** Ajusta precios y características en `lib/stripe.ts`

---

## 💡 Tips

- **Webhook Secret local cambia:** Cada vez que ejecutas `stripe listen`, obtienes un nuevo secret
- **Mantén Stripe CLI corriendo:** Los webhooks solo funcionan mientras corre
- **Modo test vs live:** Las claves son diferentes, cuidado al cambiar
- **Vercel/Producción:** Necesitas configurar webhooks reales en Stripe Dashboard

---

## ✨ ¡Listo!

Ahora puedes:

- Probar diferentes planes
- Ver el portal de gestión
- Descargar facturas
- Cancelar suscripciones
- Todo en modo test, sin pagos reales

**¿Problemas?** Consulta `BILLING_SETUP.md` para troubleshooting detallado.
