-- ============================================================
-- Payment System Tables
-- Supports multi-provider payment architecture
-- ============================================================

-- Link between salons and their customer IDs at each payment provider
CREATE TABLE IF NOT EXISTS payment_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,              -- 'stripe', 'paypal', 'mobilemoney'
    customer_id TEXT NOT NULL,           -- Customer ID at the provider (e.g. cus_xxx for Stripe)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(salon_id, provider)
);

-- Webhook event log for idempotency and debugging
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL UNIQUE,       -- Event ID from the provider (for idempotency)
    event_type TEXT NOT NULL,            -- e.g. 'checkout.session.completed'
    salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,
    payload JSONB,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_customers_salon_id ON payment_customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_payment_customers_provider ON payment_customers(provider);
CREATE INDEX IF NOT EXISTS idx_payment_events_salon_id ON payment_events(salon_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_provider ON payment_events(provider);
CREATE INDEX IF NOT EXISTS idx_payment_events_event_type ON payment_events(event_type);

-- RLS (Row Level Security)
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own salon's payment customers
CREATE POLICY "Users can view own salon payment customers"
    ON payment_customers FOR SELECT
    USING (
        salon_id IN (
            SELECT us.salon_id FROM user_salons us
            JOIN users u ON u.id = us.user_id
            WHERE u.auth_id = auth.uid()
            AND us.is_active = true
        )
    );

-- Policy: Service role can manage all payment data (via API routes)
CREATE POLICY "Service role full access to payment_customers"
    ON payment_customers FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to payment_events"
    ON payment_events FOR ALL
    USING (auth.role() = 'service_role');
