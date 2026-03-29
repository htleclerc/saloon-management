-- Add custom_permissions JSONB column to salon_settings
-- Stores per-salon role permission overrides set by the owner
ALTER TABLE salon_settings
ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT NULL;

COMMENT ON COLUMN salon_settings.custom_permissions IS 'JSON object storing custom permission overrides per role. Format: { "permKey": { "manager": bool, "worker": bool } }';
