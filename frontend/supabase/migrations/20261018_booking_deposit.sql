-- ============================================================
-- Online booking deposit and booking terms
-- Salon rule (none / fixed / percent) + per-booking deposit tracking
-- ============================================================

-- Salon settings: deposit rule and intake terms the client must accept
ALTER TABLE salon_settings
    ADD COLUMN IF NOT EXISTS deposit_type VARCHAR(10) NOT NULL DEFAULT 'none'
        CHECK (deposit_type IN ('none', 'fixed', 'percent')),
    ADD COLUMN IF NOT EXISTS deposit_value NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (deposit_value >= 0),
    ADD COLUMN IF NOT EXISTS booking_terms JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN salon_settings.deposit_type IS 'Deposit rule for online bookings: none, fixed amount or percent of the total';
COMMENT ON COLUMN salon_settings.deposit_value IS 'Fixed amount in salon currency, or percentage (0-100) when deposit_type = percent';
COMMENT ON COLUMN salon_settings.booking_terms IS 'Array of statements the client must accept before booking';

-- Bookings: price snapshot and deposit tracking
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(20) NOT NULL DEFAULT 'none'
        CHECK (deposit_status IN ('none', 'pending', 'paid', 'refunded', 'failed')),
    ADD COLUMN IF NOT EXISTS deposit_reference TEXT,
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bookings_deposit_status ON bookings(deposit_status);
