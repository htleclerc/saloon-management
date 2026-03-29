-- ============================================================
-- REFERRAL SYSTEM
-- ============================================================

-- Per-salon referral program configuration
CREATE TABLE IF NOT EXISTS referral_settings (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    referrer_reward_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (referrer_reward_type IN ('percentage', 'fixed')),
    referrer_reward_value NUMERIC(10,2) NOT NULL DEFAULT 10,
    referred_reward_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (referred_reward_type IN ('percentage', 'fixed')),
    referred_reward_value NUMERIC(10,2) NOT NULL DEFAULT 10,
    max_referrals_per_client INTEGER DEFAULT NULL,
    reward_expiry_days INTEGER DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id)
);

-- Referral tracking (who referred whom)
CREATE TABLE IF NOT EXISTS referrals (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    referrer_client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    referred_client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    referrer_promo_code_id BIGINT REFERENCES promo_codes(id),
    referred_promo_code_id BIGINT REFERENCES promo_codes(id),
    referrer_reward_used BOOLEAN DEFAULT false,
    referred_reward_used BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, referred_client_id)
);

-- Add referral fields to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referred_by_client_id BIGINT REFERENCES clients(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_salon ON referrals(salon_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_client_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_client_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(salon_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_referral_code ON clients(referral_code);

-- RLS Policies
ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_settings_select" ON referral_settings FOR SELECT USING (true);
CREATE POLICY "referral_settings_all" ON referral_settings FOR ALL USING (true);

CREATE POLICY "referrals_select" ON referrals FOR SELECT USING (true);
CREATE POLICY "referrals_all" ON referrals FOR ALL USING (true);
