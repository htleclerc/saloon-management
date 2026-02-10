-- ============================================================
-- SALOON MANAGEMENT - SUPABASE SEED DATA V2
-- Initial Demo Data
-- ============================================================

-- 1. SALONS
INSERT INTO salons (name, slug, address, city, country, timezone, currency, subscription_plan, mode)
VALUES 
('Demo Salon', 'demo-salon', '123 Rue de la Coiffe', 'Paris', 'France', 'Europe/Paris', 'EUR', 'pro', 'demo'),
('Coiffure Moderne Lyon', 'moderne-lyon', '45 Rue de la République', 'Lyon', 'France', 'Europe/Paris', 'EUR', 'pro', 'demo');

-- 2. USERS
INSERT INTO users (user_code, email, first_name, last_name, role)
VALUES 
('ADM-001-999', 'admin@demosalon.com', 'Admin', 'Demo', 'super_admin'),
('OWN-001-888', 'owner@demosalon.com', 'Orphelia', 'Brandy', 'owner'),
('WRK-001-777', 'worker@demosalon.com', 'Jean', 'Dupont', 'worker');

-- 3. USER-SALON JUNCTION
INSERT INTO user_salons (user_id, salon_id, role_in_salon)
VALUES 
(2, 1, 'Manager'), -- Orphelia is Manager/Owner of Demo Salon
(2, 2, 'Manager'), -- Orphelia is also Manager/Owner of Moderne Lyon
(3, 1, 'Worker');  -- Jean is Worker

-- 4. SALON SETTINGS
INSERT INTO salon_settings (salon_id, allow_online_booking, booking_slot_duration, tips_distribution_rule, default_worker_share_pct)
VALUES (1, TRUE, 30, 'EQUAL_ALL', 40);

-- 5. WORKERS
INSERT INTO workers (
    salon_id, user_id, name, first_name, last_name, email, color, status, 
    address, city, postal_code, birth_date, gender, 
    employee_role, contract_type, hire_date, base_salary, experience_level,
    sharing_key, specialties, weekly_schedule
)
VALUES 
(
    1, 2, 'Orphelia Brandy', 'Orphelia', 'Brandy', 'orphelia@demosalon.com', '#EC4899', 'Active',
    '15 Avenue des Champs-Élysées', 'Paris', '75008', '1990-05-15', 'female',
    'Manager', 'full-time', '2023-01-01', 3500.00, 'expert',
    60, ARRAY['Braids', 'Cuts', 'Wedding Styling'],
    '{"Mon": {"active": true, "start": "09:00", "end": "18:00"}, "Tue": {"active": true, "start": "09:00", "end": "18:00"}, "Wed": {"active": true, "start": "09:00", "end": "18:00"}, "Thu": {"active": true, "start": "09:00", "end": "18:00"}, "Fri": {"active": true, "start": "09:00", "end": "18:00"}, "Sat": {"active": false, "start": "", "end": ""}, "Sun": {"active": false, "start": "", "end": ""}}'::jsonb
),
(
    1, 3, 'Jean Dupont', 'Jean', 'Dupont', 'jean@demosalon.com', '#3B82F6', 'Active',
    '8 Rue de la Paix', 'Paris', '75002', '1985-11-20', 'male',
    'Barber', 'full-time', '2023-06-15', 2800.00, 'intermediate',
    40, ARRAY['Barber', 'Hot Shave', 'Fade'],
    '{"Mon": {"active": true, "start": "10:00", "end": "19:00"}, "Tue": {"active": true, "start": "10:00", "end": "19:00"}, "Wed": {"active": true, "start": "10:00", "end": "19:00"}, "Thu": {"active": true, "start": "10:00", "end": "19:00"}, "Fri": {"active": true, "start": "10:00", "end": "19:00"}, "Sat": {"active": true, "start": "09:00", "end": "14:00"}, "Sun": {"active": false, "start": "", "end": ""}}'::jsonb
),
(
    1, NULL, 'Marie Smith', 'Marie', 'Smith', 'marie@demosalon.com', '#10B981', 'Active',
    '22 Rue de Rivoli', 'Paris', '75004', '1992-03-10', 'female',
    'Colorist', 'part-time', '2024-01-10', 1500.00, 'expert',
    50, ARRAY['Balayage', 'Color Correction', 'Highlights'],
    '{"Mon": {"active": false, "start": "", "end": ""}, "Tue": {"active": false, "start": "", "end": ""}, "Wed": {"active": true, "start": "09:00", "end": "18:00"}, "Thu": {"active": true, "start": "09:00", "end": "18:00"}, "Fri": {"active": true, "start": "09:00", "end": "18:00"}, "Sat": {"active": false, "start": "", "end": ""}, "Sun": {"active": false, "start": "", "end": ""}}'::jsonb
);

-- 6. CLIENTS
INSERT INTO clients (salon_id, name, email, phone)
VALUES 
(1, 'Sophie Laurent', 'sophie@email.com', '0601020304'),
(1, 'Marc Bernard', 'marc@email.com', '0708091011'),
(1, 'Alice Dubois', 'alice@email.com', '0611223344'),
(1, 'Thomas Petit', 'thomas@email.com', '0622334455'),
(1, 'Julie Martin', 'julie@email.com', '0633445566'),
(1, 'Nicolas Lefebvre', 'nicolas@email.com', '0644556677'),
(1, 'Emma Morel', 'emma@email.com', '0655667788');

-- 7. SERVICE CATEGORIES
INSERT INTO service_categories (salon_id, name, color, display_order)
VALUES 
(1, 'Coiffure Femme', '#EC4899', 1),
(1, 'Coiffure Homme', '#3B82F6', 2),
(1, 'Soins', '#10B981', 3);

-- 8. SERVICES
INSERT INTO services (salon_id, category_id, name, price, duration)
VALUES 
(1, 1, 'Coupe & Brushing', 45, 60),
(1, 1, 'Tresses Box Braids', 120, 240),
(1, 2, 'Coupe Homme', 25, 30),
(1, 3, 'Soin Hydratant', 35, 45);

-- 9. PRODUCTS
INSERT INTO products (salon_id, name, price, stock, category, sku)
VALUES 
(1, 'Huile de Coco Bio', 15, 20, 'Soins', 'COCO-001'),
(1, 'Gel de Tressage Pro', 18, 15, 'Styling', 'GEL-002');

-- 10. BOOKINGS (Examples)
INSERT INTO bookings (salon_id, client_id, date, time, duration, status)
VALUES 
(1, 1, CURRENT_DATE + INTERVAL '1 day', '10:00:00', 60, 'Confirmed'),
(1, 2, CURRENT_DATE + INTERVAL '2 days', '14:00:00', 30, 'Pending'),
(1, 3, CURRENT_DATE, '15:30:00', 240, 'Finished'),
(1, 4, CURRENT_DATE - INTERVAL '1 day', '11:00:00', 45, 'Finished'),
(1, 5, CURRENT_DATE + INTERVAL '1 day', '16:00:00', 60, 'Confirmed'),
(1, 6, CURRENT_DATE + INTERVAL '3 days', '09:00:00', 120, 'Confirmed');

-- Junctions for the bookings
INSERT INTO booking_services (booking_id, service_id) VALUES (1, 1), (2, 3), (3, 2), (4, 4), (5, 1), (6, 2);
INSERT INTO booking_workers (booking_id, worker_id) VALUES (1, 1), (2, 2), (3, 1), (4, 2), (5, 3), (6, 3);

-- 11. EXPENSE CATEGORIES
INSERT INTO expense_categories (salon_id, name, color)
VALUES 
(1, 'Salaries', '#8B5CF6'),
(1, 'Rent', '#EC4899'),
(1, 'Supplies', '#F59E0B'),
(1, 'Utilities', '#10B981');

-- 12. EXPENSES
INSERT INTO expenses (salon_id, category_id, amount, date, description)
VALUES 
(1, 1, 3500, CURRENT_DATE - INTERVAL '1 month', 'Monthly Salaries'),
(1, 2, 1200, CURRENT_DATE - INTERVAL '1 month', 'Monthly Rent'),
(1, 3, 450, CURRENT_DATE - INTERVAL '15 days', 'Hair Products Bulk'),
(1, 4, 300, CURRENT_DATE - INTERVAL '5 days', 'Electricity & Water');

-- 13. INCOMES (Demo Revenue)
INSERT INTO incomes (salon_id, booking_id, client_id, amount, final_amount, date, status, payment_method)
VALUES 
(1, 3, 3, 120, 120, CURRENT_DATE, 'Validated', 'Card'),
(1, 4, 4, 35, 35, CURRENT_DATE - INTERVAL '1 day', 'Validated', 'Cash'),
(1, NULL, 5, 80, 80, CURRENT_DATE - INTERVAL '2 days', 'Validated', 'Card');

-- 14. INCOME WORKER SHARES
INSERT INTO income_worker_shares (income_id, worker_id, amount, percentage)
VALUES 
(1, 1, 48, 40),
(2, 2, 14, 40),
(3, 3, 32, 40);

-- 15. ONE TIME TOKENS (For Secure Downloads)
CREATE TABLE IF NOT EXISTS one_time_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE one_time_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (Owners) to create tokens
CREATE POLICY "Enable insert for authenticated users only" ON one_time_tokens
FOR INSERT TO authenticated WITH CHECK (true);

-- Policy: Allow anyone to read tokens (needed for download page which is public)
CREATE POLICY "Enable select for all users" ON one_time_tokens
FOR SELECT TO public USING (true);

-- Policy: Allow anyone to update used_at (needed for consuming token)
CREATE POLICY "Enable update for all users" ON one_time_tokens
FOR UPDATE TO public USING (true);

