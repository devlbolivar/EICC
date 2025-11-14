-- Add taxIdType column to companies table
-- This migration adds support for international tax ID types

-- Add the taxIdType column with default value 'rut' for backward compatibility
ALTER TABLE companies ADD COLUMN IF NOT EXISTS "taxIdType" VARCHAR(20) DEFAULT 'rut';

-- Update existing companies to have 'rut' as the tax ID type
UPDATE companies SET "taxIdType" = 'rut' WHERE "taxIdType" IS NULL;

-- Expand the rut column length to accommodate international formats
ALTER TABLE companies ALTER COLUMN rut TYPE VARCHAR(50);

-- Add a comment to document the new column
COMMENT ON COLUMN companies."taxIdType" IS 'Type of tax identification: rut (Chile), vat (Europe), ein (US), cnpj (Brazil), tax_id (generic), other';

COMMENT ON COLUMN companies.rut IS 'Tax identification number (expanded to support international formats)';
