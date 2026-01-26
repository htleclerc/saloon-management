-- ============================================================
-- SALOON MANAGEMENT - SUPABASE SCHEMA V2
-- Clean Slate & Comprehensive Implementation
-- ============================================================

-- RESET DATABASE (DANGER: Permanent Data Loss)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ============================================================
-- 1. UTILITIES & EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Global updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. CORE - USERS & SALONS
-- ============================================================

-- Global Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    user_code VARCHAR(12) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'owner', 'manager', 'worker', 'client')),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salons (Tenants)
CREATE TABLE salons (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'France',
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    logo_url TEXT,
    timezone VARCHAR(100) DEFAULT 'Europe/Paris',
    currency VARCHAR(10) DEFAULT 'EUR',
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Salon Junction (RBAC)
CREATE TABLE user_salons (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    role_in_salon VARCHAR(50) CHECK (role_in_salon IN ('Manager', 'Worker')),
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, salon_id)
);

-- Salon Settings
CREATE TABLE salon_settings (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT UNIQUE REFERENCES salons(id) ON DELETE CASCADE,
    allow_online_booking BOOLEAN DEFAULT TRUE,
    booking_advance_days INTEGER DEFAULT 30,
    booking_slot_duration INTEGER DEFAULT 30,
    require_client_approval BOOLEAN DEFAULT FALSE,
    send_email_confirmations BOOLEAN DEFAULT TRUE,
    send_sms_reminders BOOLEAN DEFAULT FALSE,
    tips_enabled BOOLEAN DEFAULT TRUE,
    tips_distribution_rule VARCHAR(50) DEFAULT 'EQUAL_ALL',
    default_worker_share_pct INTEGER DEFAULT 40,
    opening_hours JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. WORKFORCE
-- ============================================================

CREATE TABLE workers (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    color VARCHAR(7) DEFAULT '#8B5CF6',
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'OnLeave')),
    sharing_key INTEGER DEFAULT 50 CHECK (sharing_key >= 0 AND sharing_key <= 100),
    bio TEXT,
    specialties TEXT[], -- Array of strings
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. BUSINESS ASSETS
-- ============================================================

CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    birth_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_categories (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES service_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_url TEXT,
    sku VARCHAR(100),
    is_linked_to_service BOOLEAN DEFAULT FALSE,
    linked_service_id BIGINT REFERENCES services(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promo_codes (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER,
    start_date DATE,
    end_date DATE,
    affect_worker_share BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, code)
);

-- ============================================================
-- 5. OPERATIONS
-- ============================================================

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    end_time TIME,
    duration INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Created' CHECK (status IN ('Created', 'Pending', 'Confirmed', 'Started', 'Finished', 'Cancelled', 'PendingApproval', 'Rescheduled', 'Closed')),
    notes TEXT,
    income_id BIGINT, -- Will be set after payment
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Junctions
CREATE TABLE booking_services (
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (booking_id, service_id)
);

CREATE TABLE booking_workers (
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    worker_id BIGINT REFERENCES workers(id) ON DELETE CASCADE,
    PRIMARY KEY (booking_id, worker_id)
);

-- Financials
CREATE TABLE incomes (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
    client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending', 'Validated', 'Refused', 'Closed', 'Cancelled')),
    has_invoice BOOLEAN DEFAULT FALSE,
    invoice_url TEXT,
    promo_code_id BIGINT REFERENCES promo_codes(id) ON DELETE SET NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link booking back to income if needed
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_income FOREIGN KEY (income_id) REFERENCES incomes(id) ON DELETE SET NULL;

CREATE TABLE income_worker_shares (
    id BIGSERIAL PRIMARY KEY,
    income_id BIGINT REFERENCES incomes(id) ON DELETE CASCADE,
    worker_id BIGINT REFERENCES workers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE income_services (
    income_id BIGINT REFERENCES incomes(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (income_id, service_id)
);

CREATE TABLE income_products (
    id BIGSERIAL PRIMARY KEY,
    income_id BIGINT REFERENCES incomes(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    amount DECIMAL(10,2) NOT NULL
);

-- Expenses
CREATE TABLE expense_categories (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES expense_categories(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    payment_method VARCHAR(50),
    receipt_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. FEEDBACK & AUDIT
-- ============================================================

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    worker_id BIGINT REFERENCES workers(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interaction_history (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'booking', 'income', etc.
    entity_id BIGINT NOT NULL,
    user_code VARCHAR(12) NOT NULL,
    action TEXT NOT NULL,
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE salon_comments (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT REFERENCES salons(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    user_code VARCHAR(12) NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

-- List of tables requiring updated_at trigger
-- (Automatically applied to all tables with updated_at column)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t);
    END LOOP;
END;
$$;

-- ============================================================
-- 8. INDEXES (Performance)
-- ============================================================

-- Fast lookup by slug/code
CREATE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_users_code ON users(user_code);

-- Multi-tenant lookup optimizations
CREATE INDEX idx_workers_salon ON workers(salon_id);
CREATE INDEX idx_clients_salon ON clients(salon_id);
CREATE INDEX idx_bookings_salon ON bookings(salon_id);
CREATE INDEX idx_incomes_salon ON incomes(salon_id);
CREATE INDEX idx_expenses_salon ON expenses(salon_id);

-- Date based queries
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_incomes_date ON incomes(date);
CREATE INDEX idx_expenses_date ON expenses(date);

-- Status based queries
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_incomes_status ON incomes(status);
