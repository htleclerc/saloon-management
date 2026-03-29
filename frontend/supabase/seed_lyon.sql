-- ============================================================
-- SEED DATA FOR SALON 2 (COIFFURE MODERNE LYON)
-- To be executed after seed_v2.sql
-- ============================================================

-- 1. SETUP - Get Salon ID 2
-- We assume Salon 2 is 'Coiffure Moderne Lyon' from seed_v2.sql

-- 2. SALON SETTINGS (Default)
INSERT INTO salon_settings (salon_id, allow_online_booking, booking_slot_duration, tips_distribution_rule, default_worker_share_pct)
VALUES (2, TRUE, 30, 'EQUAL_ALL', 40)
ON CONFLICT (salon_id) DO NOTHING;

-- 3. WORKERS FOR LYON
-- Orphelia is already Manager (User 2). We'll add another local worker.
INSERT INTO workers (
    salon_id, user_id, name, first_name, last_name, email, color, status, 
    employee_role, contract_type, base_salary, experience_level,
    sharing_key, specialties, weekly_schedule
)
VALUES 
(
    2, NULL, 'Lucas Martin', 'Lucas', 'Martin', 'lucas@moderne-lyon.com', '#F59E0B', 'Active',
    'Senior Stylist', 'full-time', 2200.00, 'intermediate',
    45, ARRAY['Cuts', 'Color'],
    '{"Mon": {"active": true, "start": "10:00", "end": "19:00"}, "Tue": {"active": true, "start": "10:00", "end": "19:00"}, "Wed": {"active": true, "start": "10:00", "end": "19:00"}, "Thu": {"active": true, "start": "10:00", "end": "19:00"}, "Fri": {"active": true, "start": "10:00", "end": "19:00"}, "Sat": {"active": true, "start": "09:00", "end": "17:00"}, "Sun": {"active": false, "start": "", "end": ""}}'::jsonb
);

-- 4. CLIENTS FOR LYON
INSERT INTO clients (salon_id, name, email, phone)
VALUES 
(2, 'Claire Dupont', 'claire@lyon.com', '0699887766'),
(2, 'Pierre Durand', 'pierre@lyon.com', '0655443322'),
(2, 'Lea Petit', 'lea@lyon.com', '0611111111');

-- 5. SERVICE CATEGORIES
INSERT INTO service_categories (salon_id, name, color, display_order)
VALUES 
(2, 'Coupe', '#3B82F6', 1),
(2, 'Coloration', '#EC4899', 2);

-- 6. SERVICES (Assuming IDs continue, but we use subqueries or just insert assuming sequence)
-- We'll just insert and let serial handle it.
INSERT INTO services (salon_id, category_id, name, price, duration)
VALUES 
(2, (SELECT id FROM service_categories WHERE salon_id = 2 AND name = 'Coupe' LIMIT 1), 'Coupe Homme', 28, 30),
(2, (SELECT id FROM service_categories WHERE salon_id = 2 AND name = 'Coupe' LIMIT 1), 'Coupe Femme', 45, 60),
(2, (SELECT id FROM service_categories WHERE salon_id = 2 AND name = 'Coloration' LIMIT 1), 'Coloration Complète', 85, 120);

-- 7. EXPENSE CATEGORIES
INSERT INTO expense_categories (salon_id, name, color)
VALUES 
(2, 'Loyer', '#EC4899'),
(2, 'Salaires', '#8B5CF6'),
(2, 'Produits', '#10B981');

-- 8. EXPENSES (To show stats!)
INSERT INTO expenses (salon_id, category_id, amount, date, description)
VALUES 
(2, (SELECT id FROM expense_categories WHERE salon_id = 2 AND name = 'Loyer' LIMIT 1), 950, CURRENT_DATE - INTERVAL '2 days', 'Loyer Mensuel'),
(2, (SELECT id FROM expense_categories WHERE salon_id = 2 AND name = 'Produits' LIMIT 1), 230, CURRENT_DATE - INTERVAL '5 days', 'Commande L\'Oréal'),
(2, (SELECT id FROM expense_categories WHERE salon_id = 2 AND name = 'Salaires' LIMIT 1), 2200, CURRENT_DATE - INTERVAL '1 month', 'Salaires Lucas');

-- 9. INCOMES (To show stats!)
-- We need bookings first ideally, but for stats 'incomes' table is key.
-- We'll creating Incomes directly for stats.

INSERT INTO incomes (salon_id, client_id, amount, final_amount, date, status, payment_method)
VALUES 
(2, (SELECT id FROM clients WHERE salon_id = 2 AND name = 'Claire Dupont' LIMIT 1), 85, 85, CURRENT_DATE, 'Validated', 'Card'),
(2, (SELECT id FROM clients WHERE salon_id = 2 AND name = 'Pierre Durand' LIMIT 1), 28, 28, CURRENT_DATE - INTERVAL '1 day', 'Validated', 'Cash'),
(2, (SELECT id FROM clients WHERE salon_id = 2 AND name = 'Lea Petit' LIMIT 1), 45, 45, CURRENT_DATE - INTERVAL '2 days', 'Validated', 'Card');

-- 10. BOOKINGS (For calendar)
INSERT INTO bookings (salon_id, client_id, date, time, duration, status)
VALUES 
(2, (SELECT id FROM clients WHERE salon_id = 2 AND name = 'Claire Dupont' LIMIT 1), CURRENT_DATE + INTERVAL '2 days', '14:00:00', 120, 'Confirmed');
