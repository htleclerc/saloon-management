-- ============================================
-- VIEWS - CALCULATED FIELDS
-- ============================================

-- Worker Statistics View
CREATE OR REPLACE VIEW worker_stats AS
SELECT 
  w.id AS worker_id,
  w.salon_id,
  w.name,
  COUNT(DISTINCT bw.booking_id) AS total_bookings,
  COUNT(DISTINCT b.client_id) AS total_clients,
  COUNT(DISTINCT CASE WHEN b.status = 'Finished' THEN b.id END) AS completed_bookings,
  COALESCE(SUM(iw.amount), 0) AS total_revenue,
  COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM i.date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM i.date) = EXTRACT(YEAR FROM CURRENT_DATE) THEN iw.amount ELSE 0 END), 0) AS month_revenue,
  COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM i.date) = EXTRACT(YEAR FROM CURRENT_DATE) THEN iw.amount ELSE 0 END), 0) AS year_revenue,
  COALESCE(AVG(r.rating), 0) AS avg_rating,
  COUNT(r.id) FILTER (WHERE r.is_approved = TRUE) AS total_reviews
FROM workers w
LEFT JOIN booking_workers bw ON w.id = bw.worker_id
LEFT JOIN bookings b ON bw.booking_id = b.id
LEFT JOIN income_workers iw ON w.id = iw.worker_id
LEFT JOIN incomes i ON iw.income_id = i.id AND i.status = 'Validated'
LEFT JOIN reviews r ON w.id = r.worker_id AND r.is_approved = TRUE
WHERE w.is_active = TRUE
GROUP BY w.id, w.salon_id, w.name;

-- Salon Statistics View
CREATE OR REPLACE VIEW salon_stats AS
SELECT
  s.id AS salon_id,
  s.name AS salon_name,
  COUNT(DISTINCT w.id) FILTER (WHERE w.is_active = TRUE) AS total_workers,
  COUNT(DISTINCT c.id) FILTER (WHERE c.is_active = TRUE) AS total_clients,
  COUNT(DISTINCT b.id) AS total_bookings,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'Finished') AS completed_bookings,
  COALESCE(SUM(i.final_amount) FILTER (WHERE i.status = 'Validated'), 0) AS total_revenue,
  COALESCE(SUM(i.final_amount) FILTER (WHERE i.status = 'Validated' AND EXTRACT(MONTH FROM i.date) = EXTRACT(MONTH FROM CURRENT_DATE)), 0) AS month_revenue,
  COALESCE(SUM(e.amount), 0) AS total_expenses,
  COALESCE(SUM(e.amount) FILTER (WHERE EXTRACT(MONTH FROM e.date) = EXTRACT(MONTH FROM CURRENT_DATE)), 0) AS month_expenses
FROM salons s
LEFT JOIN workers w ON s.id = w.salon_id
LEFT JOIN clients c ON s.id = c.salon_id
LEFT JOIN bookings b ON s.id = b.salon_id
LEFT JOIN incomes i ON s.id = i.salon_id
LEFT JOIN expenses e ON s.id = e.salon_id AND e.is_active = TRUE
WHERE s.is_active = TRUE
GROUP BY s.id, s.name;

-- Client Statistics View
CREATE OR REPLACE VIEW client_stats AS
SELECT
  c.id AS client_id,
  c.salon_id,
  c.name,
  COUNT(DISTINCT b.id) AS total_bookings,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'Finished') AS completed_bookings,
  COALESCE(SUM(i.final_amount) FILTER (WHERE i.status = 'Validated'), 0) AS total_spent,
  MAX(b.date) AS last_booking_date,
  COALESCE(AVG(r.rating), 0) AS avg_rating_given
FROM clients c
LEFT JOIN bookings b ON c.id = b.client_id
LEFT JOIN incomes i ON c.id = i.client_id
LEFT JOIN reviews r ON c.id = r.client_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.salon_id, c.name;

-- ============================================
-- TRIGGERS - AUTO UPDATE
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salon_settings_updated_at BEFORE UPDATE ON salon_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- BUSINESS LOGIC TRIGGERS
-- ============================================

-- Calculate booking end_time based on services
CREATE OR REPLACE FUNCTION calculate_booking_end_time()
RETURNS TRIGGER AS $$
DECLARE
  total_duration INTEGER;
BEGIN
  -- Get total duration from services
  SELECT COALESCE(SUM(s.duration), 30) INTO total_duration
  FROM booking_services bs
  JOIN services s ON bs.service_id = s.id
  WHERE bs.booking_id = NEW.id;
  
  -- Set duration and end_time
  NEW.duration = total_duration;
  NEW.end_time = (NEW.time::TIME + (total_duration || ' minutes')::INTERVAL)::TIME;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger should run AFTER booking_services are inserted
-- For now, we'll calculate manually in application code

-- Calculate income final_amount
CREATE OR REPLACE FUNCTION calculate_income_final_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_amount = NEW.amount - COALESCE(NEW.discount_amount, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_income_amount BEFORE INSERT OR UPDATE ON incomes
    FOR EACH ROW EXECUTE FUNCTION calculate_income_final_amount();

-- Increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.promo_code_id IS NOT NULL THEN
    UPDATE promo_codes 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.promo_code_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_promo_on_income AFTER INSERT ON incomes
    FOR EACH ROW EXECUTE FUNCTION increment_promo_usage();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if booking has conflicts
CREATE OR REPLACE FUNCTION check_booking_conflicts(
  p_salon_id BIGINT,
  p_worker_ids BIGINT[],
  p_date DATE,
  p_time TIME,
  p_end_time TIME,
  p_exclude_booking_id BIGINT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM bookings b
  JOIN booking_workers bw ON b.id = bw.booking_id
  WHERE b.salon_id = p_salon_id
    AND b.date = p_date
    AND b.status NOT IN ('Cancelled', 'Closed')
    AND bw.worker_id = ANY(p_worker_ids)
    AND (
      (p_time >= b.time AND p_time < b.end_time) OR
      (p_end_time > b.time AND p_end_time <= b.end_time) OR
      (p_time <= b.time AND p_end_time >= b.end_time)
    )
    AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id);
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Get worker revenue for period
CREATE OR REPLACE FUNCTION get_worker_revenue(
  p_worker_id BIGINT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(iw.amount), 0) INTO total
  FROM income_workers iw
  JOIN incomes i ON iw.income_id = i.id
  WHERE iw.worker_id = p_worker_id
    AND i.date BETWEEN p_start_date AND p_end_date
    AND i.status = 'Validated';
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Get salon revenue for period
CREATE OR REPLACE FUNCTION get_salon_revenue(
  p_salon_id BIGINT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(final_amount), 0) INTO total
  FROM incomes
  WHERE salon_id = p_salon_id
    AND date BETWEEN p_start_date AND p_end_date
    AND status = 'Validated';
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Get top performers
CREATE OR REPLACE FUNCTION get_top_workers(
  p_salon_id BIGINT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  worker_id BIGINT,
  worker_name VARCHAR,
  total_revenue DECIMAL,
  total_bookings BIGINT,
  avg_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ws.worker_id,
    ws.name::VARCHAR,
    ws.total_revenue,
    ws.total_bookings,
    ws.avg_rating
  FROM worker_stats ws
  WHERE ws.salon_id = p_salon_id
  ORDER BY ws.total_revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DEMO DATA CLEANUP (for demo mode)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_demo_data()
RETURNS void AS $$
BEGIN
  -- Delete data older than 7 days in demo salons
  DELETE FROM bookings WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM incomes WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM expenses WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM reviews WHERE created_at < NOW() - INTERVAL '7 days';
  
  RAISE NOTICE 'Demo data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Note: Schedule with pg_cron if needed
-- SELECT cron.schedule('cleanup-demo-data-daily', '0 3 * * *', $$SELECT cleanup_demo_data()$$);
