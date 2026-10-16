-- ============================================================
-- Shared bookings (primary stylist + assistants) and manager finance visibility
-- ============================================================

-- The stylist booked first stays the primary one; assistants added later by the manager are not primary
ALTER TABLE booking_workers
    ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;

-- Keep at most one primary stylist per booking
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_workers_one_primary
    ON booking_workers(booking_id) WHERE is_primary;

-- Existing bookings: promote the first assigned worker (lowest id) to primary
UPDATE booking_workers bw
SET is_primary = TRUE
WHERE bw.is_primary = FALSE
  AND bw.worker_id = (
      SELECT MIN(worker_id) FROM booking_workers b2 WHERE b2.booking_id = bw.booking_id
  )
  AND NOT EXISTS (
      SELECT 1 FROM booking_workers b3 WHERE b3.booking_id = bw.booking_id AND b3.is_primary = TRUE
  );

-- Salon settings: whether managers can see income, expenses and reports
ALTER TABLE salon_settings
    ADD COLUMN IF NOT EXISTS managers_can_view_finances BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN salon_settings.managers_can_view_finances IS 'When false, managers only see scheduling features (no income, expenses or reports)';
