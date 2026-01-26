-- ============================================
-- RLS POLICIES - Multi-Tenant Security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DEMO MODE - PUBLIC ACCESS (for testing)
-- ============================================
-- ⚠️ WARNING: These are PUBLIC policies for DEMO mode only!
-- For production, replace with proper auth-based policies

-- Users - Public (demo)
CREATE POLICY "Demo: Users public access" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Salons - Public (demo)
CREATE POLICY "Demo: Salons public access" ON salons
  FOR ALL USING (true) WITH CHECK (true);

-- User Salons - Public (demo)
CREATE POLICY "Demo: User salons public access" ON user_salons
  FOR ALL USING (true) WITH CHECK (true);

-- Settings - Public (demo)
CREATE POLICY "Demo: Salon settings public access" ON salon_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Workers - Public (demo)
CREATE POLICY "Demo: Workers public access" ON workers
  FOR ALL USING (true) WITH CHECK (true);

-- Clients - Public (demo)
CREATE POLICY "Demo: Clients public access" ON clients
  FOR ALL USING (true WITH CHECK (true);

-- Service Categories - Public (demo)
CREATE POLICY "Demo: Service categories public access" ON service_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Services - Public (demo)
CREATE POLICY "Demo: Services public access" ON services
  FOR ALL USING (true) WITH CHECK (true);

-- Products - Public (demo)
CREATE POLICY "Demo: Products public access" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Bookings - Public (demo)
CREATE POLICY "Demo: Bookings public access" ON bookings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Booking workers public access" ON booking_workers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Booking services public access" ON booking_services
  FOR ALL USING (true) WITH CHECK (true);

-- Incomes - Public (demo)
CREATE POLICY "Demo: Incomes public access" ON incomes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Income workers public access" ON income_workers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Income services public access" ON income_services
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Income products public access" ON income_products
  FOR ALL USING (true) WITH CHECK (true);

-- Expenses - Public (demo)
CREATE POLICY "Demo: Expenses public access" ON expenses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Expense categories public access" ON expense_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Reviews - Public (demo)
CREATE POLICY "Demo: Reviews public access" ON reviews
  FOR ALL USING (true) WITH CHECK (true);

-- Promo Codes - Public (demo)
CREATE POLICY "Demo: Promo codes public access" ON promo_codes
  FOR ALL USING (true) WITH CHECK (true);

-- Audit - Public (demo)
CREATE POLICY "Demo: Interaction history public access" ON interaction_history
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Comments public access" ON comments
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PRODUCTION POLICIES - Multi-Tenant (commented for reference)
-- ============================================

/*
-- Helper function to get user's accessible salons
CREATE OR REPLACE FUNCTION auth.user_salons()
RETURNS SETOF BIGINT AS $$
  SELECT salon_id 
  FROM user_salons 
  WHERE user_id = auth.uid() AND is_active = TRUE
$$ LANGUAGE SQL STABLE;

-- Salons - User can see their salons
CREATE POLICY "Users see their salons" ON salons
  FOR SELECT
  USING (
    id IN (SELECT auth.user_salons())
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'SuperAdmin'
    )
  );

-- Workers - Scoped to user's salons
CREATE POLICY "Users see workers in their salons" ON workers
  FOR SELECT
  USING (salon_id IN (SELECT auth.user_salons()));

CREATE POLICY "Users manage workers in their salons" ON workers
  FOR INSERT
  WITH CHECK (salon_id IN (SELECT auth.user_salons()));

-- Similar patterns for other tables...
*/
