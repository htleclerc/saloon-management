-- Migration: User Tracking with Fixed-Length Codes (12 chars)
-- Format: RRNNNPPPCCCX where:
--   RR = Role (2 chars)
--   NNN = Last name (3 chars)
--   PPP = First name (3 chars)
--   CCC = Sequence number (3 digits)
--   X = Check digit (1 digit)

-- ============================================
-- Add Tracking Columns to All Tables
-- ============================================

-- Workers
ALTER TABLE workers ADD COLUMN IF NOT EXISTS created_by VARCHAR(12);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS updated_by VARCHAR(12);

-- Clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_by VARCHAR(12);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_by VARCHAR(12);

-- Services
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_by VARCHAR(12);
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_by VARCHAR(12);

-- Bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by VARCHAR(12);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_by VARCHAR(12);

-- Incomes
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS created_by VARCHAR(12);
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS updated_by VARCHAR(12);

-- Expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by VARCHAR(12);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS updated_by VARCHAR(12);

-- Expense Categories
ALTER TABLE expense_categories ADD COLUMN IF NOT EXISTS created_by VARCHAR(12);
ALTER TABLE expense_categories ADD COLUMN IF NOT EXISTS updated_by VARCHAR(12);

-- ============================================
-- User Codes Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_codes (
  id BIGSERIAL PRIMARY KEY,
  user_code CHAR(12) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  is_system BOOLEAN DEFAULT FALSE,
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (LENGTH(user_code) = 12)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_codes_code ON user_codes(user_code);
CREATE INDEX IF NOT EXISTS idx_user_codes_role ON user_codes(role);
CREATE INDEX IF NOT EXISTS idx_user_codes_email ON user_codes(email);

-- Sequence for user codes
CREATE SEQUENCE IF NOT EXISTS user_code_seq START WITH 1;

-- ============================================
-- Calculate Check Digit (Luhn-like algorithm)
-- ============================================
CREATE OR REPLACE FUNCTION calculate_check_digit(p_code VARCHAR)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_sum INTEGER := 0;
  v_char CHAR;
  v_value INTEGER;
  v_pos INTEGER;
BEGIN
  -- Convert each character to number and sum
  FOR v_pos IN 1..LENGTH(p_code) LOOP
    v_char := SUBSTRING(p_code FROM v_pos FOR 1);
    
    -- Convert to number
    IF v_char ~ '[0-9]' THEN
      v_value := v_char::INTEGER;
    ELSE
      -- A=1, B=2, ..., Z=26
      v_value := ASCII(UPPER(v_char)) - ASCII('A') + 1;
    END IF;
    
    -- Alternate weight 1 and 2
    IF v_pos % 2 = 0 THEN
      v_value := v_value * 2;
      IF v_value > 9 THEN
        v_value := v_value - 9;
      END IF;
    END IF;
    
    v_sum := v_sum + v_value;
  END LOOP;
  
  -- Return check digit (0-9)
  RETURN (10 - (v_sum % 10)) % 10;
END;
$$;

-- ============================================
-- Generate User Code (Fixed 12 chars)
-- ============================================
CREATE OR REPLACE FUNCTION generate_user_code(
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_role VARCHAR
)
RETURNS CHAR(12)
LANGUAGE plpgsql
AS $$
DECLARE
  v_code CHAR(12);
  v_role_prefix CHAR(2);
  v_last_part CHAR(3);
  v_first_part CHAR(3);
  v_seq_num INTEGER;
  v_seq_str CHAR(3);
  v_base CHAR(11);
  v_check_digit INTEGER;
  v_exists BOOLEAN;
BEGIN
  -- Determine role prefix (2 chars)
  v_role_prefix := CASE p_role
    WHEN 'SuperAdmin' THEN 'SA'
    WHEN 'Admin' THEN 'AD'
    WHEN 'Manager' THEN 'MG'
    WHEN 'Worker' THEN 'WK'
    WHEN 'Client' THEN 'CL'
    WHEN 'System' THEN 'SY'
    ELSE 'US'
  END;

  -- Last name (3 chars, padded with X if needed)
  v_last_part := RPAD(UPPER(LEFT(REGEXP_REPLACE(p_last_name, '[^A-Za-z]', '', 'g'), 3)), 3, 'X');
  
  -- First name (3 chars, padded with X if needed)
  v_first_part := RPAD(UPPER(LEFT(REGEXP_REPLACE(p_first_name, '[^A-Za-z]', '', 'g'), 3)), 3, 'X');
  
  -- Get next sequence number and try until unique
  FOR v_seq_num IN 1..999 LOOP
    v_seq_str := LPAD(v_seq_num::TEXT, 3, '0');
    
    -- Build base code (11 chars)
    v_base := v_role_prefix || v_last_part || v_first_part || v_seq_str;
    
    -- Calculate check digit
    v_check_digit := calculate_check_digit(v_base);
    
    -- Final code (12 chars)
    v_code := v_base || v_check_digit::TEXT;
    
    -- Check if unique
    SELECT EXISTS(SELECT 1 FROM user_codes WHERE user_code = v_code) INTO v_exists;
    
    IF NOT v_exists THEN
      RETURN v_code;
    END IF;
  END LOOP;
  
  RAISE EXCEPTION 'Unable to generate unique user code for % %', p_first_name, p_last_name;
END;
$$;

-- ============================================
-- Validate User Code Check Digit
-- ============================================
CREATE OR REPLACE FUNCTION validate_user_code(p_code CHAR(12))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_base CHAR(11);
  v_check_digit INTEGER;
  v_expected_check INTEGER;
BEGIN
  IF LENGTH(p_code) != 12 THEN
    RETURN FALSE;
  END IF;
  
  v_base := LEFT(p_code, 11);
  v_check_digit := RIGHT(p_code, 1)::INTEGER;
  v_expected_check := calculate_check_digit(v_base);
  
  RETURN v_check_digit = v_expected_check;
END;
$$;

-- ============================================
-- Get or Create User Code
-- ============================================
CREATE OR REPLACE FUNCTION get_or_create_user_code(
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_role VARCHAR,
  p_email VARCHAR DEFAULT NULL,
  p_is_system BOOLEAN DEFAULT FALSE
)
RETURNS CHAR(12)
LANGUAGE plpgsql
AS $$
DECLARE
  v_code CHAR(12);
  v_seq_num INTEGER;
BEGIN
  -- Try to find existing user by email
  IF p_email IS NOT NULL THEN
    SELECT user_code INTO v_code 
    FROM user_codes 
    WHERE email = p_email 
    LIMIT 1;
    
    IF v_code IS NOT NULL THEN
      RETURN v_code;
    END IF;
  END IF;
  
  -- Generate new code
  v_code := generate_user_code(p_first_name, p_last_name, p_role);
  
  -- Extract sequence number from code
  v_seq_num := SUBSTRING(v_code FROM 9 FOR 3)::INTEGER;
  
  -- Insert into user_codes table
  INSERT INTO user_codes (user_code, first_name, last_name, role, email, is_system, sequence_number)
  VALUES (v_code, p_first_name, p_last_name, p_role, p_email, p_is_system, v_seq_num);
  
  RETURN v_code;
END;
$$;

-- ============================================
-- Auto-Set created_by/updated_by Triggers
-- ============================================
CREATE OR REPLACE FUNCTION set_user_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Set created_by if not provided
    IF NEW.created_by IS NULL THEN
      NEW.created_by := get_or_create_user_code('System', 'User', 'System', NULL, TRUE);
    END IF;
    NEW.updated_by := NEW.created_by;
  
  ELSIF TG_OP = 'UPDATE' THEN
    -- Keep original created_by
    NEW.created_by := OLD.created_by;
    -- Set updated_by if not provided or same as old
    IF NEW.updated_by IS NULL OR NEW.updated_by = OLD.updated_by THEN
      NEW.updated_by := get_or_create_user_code('System', 'User', 'System', NULL, TRUE);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Apply Triggers to All Tables
-- ============================================
DROP TRIGGER IF EXISTS set_user_tracking_workers ON workers;
CREATE TRIGGER set_user_tracking_workers
  BEFORE INSERT OR UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

DROP TRIGGER IF EXISTS set_user_tracking_clients ON clients;
CREATE TRIGGER set_user_tracking_clients
  BEFORE INSERT OR UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

DROP TRIGGER IF EXISTS set_user_tracking_services ON services;
CREATE TRIGGER set_user_tracking_services
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

DROP TRIGGER IF EXISTS set_user_tracking_bookings ON bookings;
CREATE TRIGGER set_user_tracking_bookings
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

DROP TRIGGER IF EXISTS set_user_tracking_incomes ON incomes;
CREATE TRIGGER set_user_tracking_incomes
  BEFORE INSERT OR UPDATE ON incomes
  FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

DROP TRIGGER IF EXISTS set_user_tracking_expenses ON expenses;
CREATE TRIGGER set_user_tracking_expenses
  BEFORE INSERT OR UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

DROP TRIGGER IF EXISTS set_user_tracking_expense_categories ON expense_categories;
CREATE TRIGGER set_user_tracking_expense_categories
  BEFORE INSERT OR UPDATE ON expense_categories
  FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

-- ============================================
-- Insert System User Code
-- ============================================
INSERT INTO user_codes (user_code, first_name, last_name, role, is_system, sequence_number)
VALUES ('SYUSESYS0017', 'System', 'User', 'System', TRUE, 1)
ON CONFLICT (user_code) DO NOTHING;

-- ============================================
-- Example User Codes
-- ============================================
-- SuperAdmin: Sophie Dupont
-- SELECT get_or_create_user_code('Sophie', 'Dupont', 'SuperAdmin', 'sophie@example.com');
-- Result: SADUPSOP0014 (SA=SuperAdmin, DUP=Dupont, SOP=Sophie, 001=seq, 4=check)

-- Worker: Marie Martin  
-- SELECT get_or_create_user_code('Marie', 'Martin', 'Worker', 'marie@example.com');
-- Result: WKMARMAR0018 (WK=Worker, MAR=Martin, MAR=Marie, 001=seq, 8=check)

-- Client: Jean Doe
-- SELECT get_or_create_user_code('Jean', 'Doe', 'Client', 'jean@example.com');
-- Result: CLDOEJEA0015 (CL=Client, DOE=Doe, JEA=Jean, 001=seq, 5=check)

-- Validate code
-- SELECT validate_user_code('SADUPSOP0014');
-- Result: TRUE or FALSE
