-- ============================================================
-- Service add-ons (options with extra price and extra duration)
-- Defined once per salon, attached to one or more services,
-- selected on bookings with a price/duration snapshot.
-- ============================================================

-- Catalog of add-ons per salon
CREATE TABLE IF NOT EXISTS service_addons (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    extra_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (extra_price >= 0),
    extra_duration INTEGER NOT NULL DEFAULT 0 CHECK (extra_duration >= 0), -- minutes
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Which add-ons are offered on which service
CREATE TABLE IF NOT EXISTS service_addon_links (
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    addon_id BIGINT NOT NULL REFERENCES service_addons(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, addon_id)
);

-- Add-ons selected on a booking (snapshot so later price changes do not alter past bookings)
CREATE TABLE IF NOT EXISTS booking_addons (
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id BIGINT NOT NULL REFERENCES service_addons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price_snapshot DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_snapshot INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (booking_id, addon_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_addons_salon ON service_addons(salon_id);
CREATE INDEX IF NOT EXISTS idx_service_addon_links_addon ON service_addon_links(addon_id);
CREATE INDEX IF NOT EXISTS idx_booking_addons_addon ON booking_addons(addon_id);

-- updated_at trigger (same function as the rest of the schema)
DROP TRIGGER IF EXISTS update_service_addons_updated_at ON service_addons;
CREATE TRIGGER update_service_addons_updated_at
    BEFORE UPDATE ON service_addons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: same public demo policies as the other catalog tables (see policies_v2.sql)
ALTER TABLE service_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_addon_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['service_addons', 'service_addon_links', 'booking_addons'];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public read access on %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Public read access on %I" ON %I FOR SELECT USING (true);', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Public insert access on %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Public insert access on %I" ON %I FOR INSERT WITH CHECK (true);', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Public update access on %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Public update access on %I" ON %I FOR UPDATE USING (true);', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Public delete access on %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Public delete access on %I" ON %I FOR DELETE USING (true);', t, t);
    END LOOP;
END;
$$;
