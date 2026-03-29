-- Add email_config JSONB column to salon_settings
-- Stores per-salon email provider configuration (Brevo API key, sender info)
ALTER TABLE salon_settings
ADD COLUMN IF NOT EXISTS email_config JSONB DEFAULT NULL;

COMMENT ON COLUMN salon_settings.email_config IS 'JSON object storing custom email config. Format: { "brevoApiKey": "...", "senderEmail": "...", "senderName": "..." }';
