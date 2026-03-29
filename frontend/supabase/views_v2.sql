-- ============================================================
-- SALOON MANAGEMENT - SUPABASE VIEWS V2
-- Statistics & Analytics for Dashboard KPIs
-- ============================================================

-- ============================================================
-- 1. WORKER PERFORMANCE STATS
-- ============================================================

CREATE OR REPLACE VIEW worker_stats AS
SELECT 
    w.id AS worker_id,
    w.salon_id,
    w.name,
    COUNT(b.id) AS total_bookings,
    COUNT(DISTINCT b.client_id) AS total_clients,
    COUNT(b.id) FILTER (WHERE b.status = 'Finished') AS completed_bookings,
    COALESCE(SUM(iws.amount), 0) AS total_revenue,
    COALESCE(SUM(iws.amount) FILTER (WHERE i.date >= DATE_TRUNC('month', CURRENT_DATE)::DATE), 0) AS month_revenue,
    COALESCE(SUM(iws.amount) FILTER (WHERE i.date >= DATE_TRUNC('year', CURRENT_DATE)::DATE), 0) AS year_revenue,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.id) AS total_reviews
FROM 
    workers w
LEFT JOIN booking_workers bw ON w.id = bw.worker_id
LEFT JOIN bookings b ON bw.booking_id = b.id
LEFT JOIN income_worker_shares iws ON w.id = iws.worker_id
LEFT JOIN incomes i ON iws.income_id = i.id AND i.status = 'Validated'
LEFT JOIN reviews r ON w.id = r.worker_id AND r.is_approved = TRUE
GROUP BY 
    w.id, w.salon_id, w.name;

-- ============================================================
-- 2. CLIENT ANALYTICS
-- ============================================================

CREATE OR REPLACE VIEW client_stats AS
SELECT 
    c.id AS client_id,
    c.salon_id,
    c.name,
    COUNT(b.id) AS total_bookings,
    COUNT(b.id) FILTER (WHERE b.status = 'Finished') AS completed_bookings,
    COALESCE(SUM(i.final_amount), 0) AS total_spent,
    MAX(b.date) AS last_booking_date,
    COALESCE(AVG(r.rating), 0) AS avg_rating_given
FROM 
    clients c
LEFT JOIN bookings b ON c.id = b.client_id
LEFT JOIN incomes i ON b.id = i.booking_id AND i.status = 'Validated'
LEFT JOIN reviews r ON c.id = r.client_id
GROUP BY 
    c.id, c.salon_id, c.name;

-- ============================================================
-- 3. SALON OVERALL PERFORMANCE
-- ============================================================

CREATE OR REPLACE VIEW salon_stats AS
SELECT 
    s.id AS salon_id,
    s.name AS salon_name,
    (SELECT COUNT(*) FROM workers w WHERE w.salon_id = s.id AND w.is_active = TRUE) AS total_workers,
    (SELECT COUNT(*) FROM clients c WHERE c.salon_id = s.id AND c.is_active = TRUE) AS total_clients,
    COUNT(b.id) AS total_bookings,
    COUNT(b.id) FILTER (WHERE b.status = 'Finished') AS completed_bookings,
    COALESCE(SUM(i.final_amount), 0) AS total_revenue,
    COALESCE(SUM(i.final_amount) FILTER (WHERE i.date >= DATE_TRUNC('month', CURRENT_DATE)::DATE), 0) AS month_revenue,
    COALESCE((SELECT SUM(amount) FROM expenses e WHERE e.salon_id = s.id), 0) AS total_expenses,
    COALESCE((SELECT SUM(amount) FROM expenses e WHERE e.salon_id = s.id AND e.date >= DATE_TRUNC('month', CURRENT_DATE)::DATE), 0) AS month_expenses
FROM 
    salons s
LEFT JOIN bookings b ON s.id = b.salon_id
LEFT JOIN incomes i ON s.id = i.salon_id AND i.status = 'Validated'
GROUP BY 
    s.id, s.name;

-- ============================================================
-- 4. REVENUE BREAKDOWN BY PERIOD (Helper for Charts)
-- ============================================================

CREATE OR REPLACE VIEW revenue_by_month AS
SELECT 
    salon_id,
    DATE_TRUNC('month', date)::DATE AS month,
    SUM(final_amount) AS revenue,
    COUNT(id) AS income_count
FROM 
    incomes
WHERE 
    status = 'Validated'
GROUP BY 
    salon_id, month
ORDER BY 
    month DESC;
