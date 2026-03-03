-- RLS Policies for Demo Mode
-- ⚠️ WARNING: These policies are PUBLIC - for DEMO mode only!

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Workers - Public Access (DEMO)
-- ============================================
CREATE POLICY "Public read access on workers"
  ON workers FOR SELECT
  USING (true);

CREATE POLICY "Public insert access on workers"
  ON workers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access on workers"
  ON workers FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access on workers"
  ON workers FOR DELETE
  USING (true);

-- ============================================
-- Clients - Public Access (DEMO)
-- ============================================
CREATE POLICY "Public read access on clients"
  ON clients FOR SELECT
  USING (true);

CREATE POLICY "Public insert access on clients"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access on clients"
  ON clients FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access on clients"
  ON clients FOR DELETE
  USING (true);

-- ============================================
-- Services - Public Access (DEMO)
-- ============================================
CREATE POLICY "Public read access on services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Public insert access on services"
  ON services FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access on services"
  ON services FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access on services"
  ON services FOR DELETE
  USING (true);

-- ============================================
-- Bookings - Public Access (DEMO)
-- ============================================
CREATE POLICY "Public read access on bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Public insert access on bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access on bookings"
  ON bookings FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access on bookings"
  ON bookings FOR DELETE
  USING (true);

-- ============================================
-- Incomes - Public Access (DEMO)
-- ============================================
CREATE POLICY "Public read access on incomes"
  ON incomes FOR SELECT
  USING (true);

CREATE POLICY "Public insert access on incomes"
  ON incomes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access on incomes"
  ON incomes FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access on incomes"
  ON incomes FOR DELETE
  USING (true);

-- ============================================
-- Expenses - Public Access (DEMO)
-- ============================================
CREATE POLICY "Public read access on expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Public insert access on expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access on expenses"
  ON expenses FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access on expenses"
  ON expenses FOR DELETE
  USING (true);

-- ============================================
-- Expense Categories - Public Access (DEMO)
-- ============================================
CREATE POLICY "Public read access on expense_categories"
  ON expense_categories FOR SELECT
  USING (true);

CREATE POLICY "Public insert access on expense_categories"
  ON expense_categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access on expense_categories"
  ON expense_categories FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access on expense_categories"
  ON expense_categories FOR DELETE
  USING (true);
