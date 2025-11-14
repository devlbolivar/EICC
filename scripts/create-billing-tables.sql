-- ============================================
-- Script de Migración: Sistema de Billing
-- Crea las tablas necesarias para Stripe
-- ============================================

-- Tabla de Suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    plan_name VARCHAR(100) NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    trial_end TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS company_subscription_idx ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS stripe_customer_idx ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS stripe_subscription_idx ON subscriptions(stripe_subscription_id);

-- Comentarios para subscriptions
COMMENT ON TABLE subscriptions IS 'Almacena las suscripciones de las empresas a planes pagos';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'ID del customer en Stripe';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'ID de la suscripción en Stripe';
COMMENT ON COLUMN subscriptions.status IS 'Estado: active, canceled, past_due, trialing, incomplete';
COMMENT ON COLUMN subscriptions.plan_name IS 'Nombre del plan: free, premium, enterprise, etc.';

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    status VARCHAR(50) NOT NULL,
    invoice_number VARCHAR(100),
    description TEXT,
    pdf_url TEXT,
    hosted_invoice_url TEXT,
    billing_reason VARCHAR(100),
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para invoices
CREATE INDEX IF NOT EXISTS company_invoice_idx ON invoices(company_id);
CREATE INDEX IF NOT EXISTS stripe_invoice_idx ON invoices(stripe_invoice_id);

-- Comentarios para invoices
COMMENT ON TABLE invoices IS 'Almacena el historial de facturas de Stripe';
COMMENT ON COLUMN invoices.stripe_invoice_id IS 'ID de la factura en Stripe';
COMMENT ON COLUMN invoices.amount IS 'Monto en centavos (ej: 29900 = $299.00)';
COMMENT ON COLUMN invoices.status IS 'Estado: paid, open, void, uncollectible';
COMMENT ON COLUMN invoices.pdf_url IS 'URL al PDF de la factura';
COMMENT ON COLUMN invoices.hosted_invoice_url IS 'URL a la factura hosteada por Stripe';

-- Verificación
SELECT 'Tablas de billing creadas exitosamente' AS message;

-- Verificar que las tablas existen
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'invoices')
ORDER BY table_name;

