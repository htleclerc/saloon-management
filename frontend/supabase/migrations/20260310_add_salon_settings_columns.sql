-- Migration: Add vat_rate and tips_custom_percentage to salon_settings
-- Created: 2026-03-10
-- Description: Adds VAT rate and custom tips percentage columns to salon_settings table

-- Step 1: Add vat_rate column (percentage 0-100, default 20%)
ALTER TABLE salon_settings
ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5,2) DEFAULT 20;

-- Step 2: Add tips_custom_percentage column (percentage 0-100, for CUSTOM_PERCENTAGE rule)
ALTER TABLE salon_settings
ADD COLUMN IF NOT EXISTS tips_custom_percentage NUMERIC(5,2) DEFAULT 0;

-- Step 3: Comments for documentation
COMMENT ON COLUMN salon_settings.vat_rate IS 'VAT/Tax rate percentage (0-100) used for invoicing';
COMMENT ON COLUMN salon_settings.tips_custom_percentage IS 'Salon percentage for CUSTOM_PERCENTAGE tips distribution rule (0-100)';
