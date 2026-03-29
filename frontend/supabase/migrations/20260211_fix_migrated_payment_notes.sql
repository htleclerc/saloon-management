-- Migration: Sync missing notes from history to main table
-- Date: 2026-02-11
-- Description: Copies the 'reason' from the first history entry to the main salary_payments.notes if empty

-- Update notes for migrated payments
UPDATE salary_payments sp
SET notes = ph.reason,
    updated_at = NOW()
FROM payment_status_history ph
WHERE sp.id = ph.payment_id
  AND (sp.notes IS NULL OR sp.notes = '' OR sp.notes = '-')
  AND ph.reason IS NOT NULL
  AND ph.reason != 'Payment recorded' -- Don't overwrite if it's just the generic default
  AND ph.previous_status IS NULL; -- Only use the initial creation/migration reason

-- For payments that truly just have generic reason but we want to show it
UPDATE salary_payments sp
SET notes = 'Payment recorded',
    updated_at = NOW()
WHERE (sp.notes IS NULL OR sp.notes = '')
  AND EXISTS (
      SELECT 1 FROM payment_status_history ph 
      WHERE ph.payment_id = sp.id 
      AND ph.reason = 'Payment recorded'
  );
