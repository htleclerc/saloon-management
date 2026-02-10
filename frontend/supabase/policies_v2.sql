-- ============================================================
-- SALOON MANAGEMENT - SUPABASE RLS POLICIES V2
-- ⚠️ WARNING: These policies are PUBLIC - for DEMO mode only!
-- ============================================================

-- ============================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_worker_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. CREATE PUBLIC ACCESS POLICIES (DEMO MODE)
-- ============================================================

-- Function to create policies for a table
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'users', 'salons', 'user_salons', 'salon_settings', 
        'workers', 'clients', 'service_categories', 'services', 
        'products', 'promo_codes', 'bookings', 'booking_services', 
        'booking_workers', 'incomes', 'income_worker_shares', 
        'income_services', 'income_products', 'expense_categories', 
        'expenses', 'reviews', 'interaction_history', 'salon_comments'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- SELECT
        EXECUTE format('DROP POLICY IF EXISTS "Public read access on %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Public read access on %I" ON %I FOR SELECT USING (true);', t, t);
        
        -- INSERT
        EXECUTE format('DROP POLICY IF EXISTS "Public insert access on %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Public insert access on %I" ON %I FOR INSERT WITH CHECK (true);', t, t);
        
        -- UPDATE
        EXECUTE format('DROP POLICY IF EXISTS "Public update access on %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Public update access on %I" ON %I FOR UPDATE USING (true);', t, t);
        
        -- DELETE
        EXECUTE format('DROP POLICY IF EXISTS "Public delete access on %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Public delete access on %I" ON %I FOR DELETE USING (true);', t, t);
    END LOOP;
END;
$$;

-- ============================================================
-- 3. GRANT PERMISSIONS TO ANON AND AUTHENTICATED ROLES
-- ============================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant access to all sequences (for ID generation)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant access to all functions
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure views are specifically granted SELECT access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
-- (Note: In PostgreSQL, views are included in "ALL TABLES" for GRANT SELECT)

-- ============================================================
-- 4. VERIFY POLICIES
-- ============================================================
-- SELECT * FROM pg_policies;
