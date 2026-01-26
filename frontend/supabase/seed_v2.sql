-- ============================================================
-- SALOON MANAGEMENT - SUPABASE SEED DATA V2
-- Initial Demo Data
-- ============================================================

-- 1. SALONS
INSERT INTO salons (name, slug, address, city, country, timezone, currency, subscription_plan)
VALUES ('Demo Salon', 'demo-salon', '123 Rue de la Coiffe', 'Paris', 'France', 'Europe/Paris', 'EUR', 'pro');

-- 2. USERS
INSERT INTO users (user_code, email, first_name, last_name, role)
VALUES 
('ADM-001-999', 'admin@demosalon.com', 'Admin', 'Demo', 'super_admin'),
('OWN-001-888', 'owner@demosalon.com', 'Orphelia', 'Brandy', 'owner'),
('WRK-001-777', 'worker@demosalon.com', 'Jean', 'Dupont', 'worker');

-- 3. USER-SALON JUNCTION
INSERT INTO user_salons (user_id, salon_id, role_in_salon)
VALUES 
(2, 1, 'Manager'), -- Orphelia is Manager/Owner
(3, 1, 'Worker');  -- Jean is Worker

-- 4. SALON SETTINGS
INSERT INTO salon_settings (salon_id, allow_online_booking, booking_slot_duration, tips_distribution_rule, default_worker_share_pct)
VALUES (1, TRUE, 30, 'EQUAL_ALL', 40);

-- 5. WORKERS
INSERT INTO workers (salon_id, user_id, name, email, color, status, sharing_key, specialties)
VALUES 
(1, 2, 'Orphelia', 'orphelia@demosalon.com', '#EC4899', 'Active', 60, ARRAY['Braids', 'Cuts']),
(1, 3, 'Jean', 'jean@demosalon.com', '#3B82F6', 'Active', 40, ARRAY['Barber', 'Color']);

-- 6. CLIENTS
INSERT INTO clients (salon_id, name, email, phone)
VALUES 
(1, 'Sophie Laurent', 'sophie@email.com', '0601020304'),
(1, 'Marc Bernard', 'marc@email.com', '0708091011');

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
(1, 2, CURRENT_DATE + INTERVAL '2 days', '14:00:00', 30, 'Pending');

-- Junctions for the first booking
INSERT INTO booking_services (booking_id, service_id) VALUES (1, 1);
INSERT INTO booking_workers (booking_id, worker_id) VALUES (1, 1);
