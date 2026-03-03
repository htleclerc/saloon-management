-- ============================================
-- SALOON MANAGEMENT - COMPLETE SCHEMA v2.0
-- Multi-Tenant Architecture with Full Normalization
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- ============================================
-- 1. CORE - AUTHENTICATION & USERS
-- ============================================

-- Users table (all user types)
CREATE TABLE users (
  id                BIGSERIAL PRIMARY KEY,
  user_code         CHAR(12) UNIQUE NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  phone             VARCHAR(50),
  role              VARCHAR(50) NOT NULL CHECK (role IN ('SuperAdmin', 'Admin', 'Manager', 'Worker', 'Client')),
  is_active         BOOLEAN DEFAULT TRUE,
  email_verified_at TIMESTAMPTZ,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        CHAR(12),
  updated_by        CHAR(12)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_code ON users(user_code);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. CORE - SALONS
-- ============================================

CREATE TABLE salons (
  id                    BIGSERIAL PRIMARY KEY,
  name                  VARCHAR(255) NOT NULL,
  slug                  VARCHAR(255) UNIQUE NOT NULL,
  address               TEXT,
  city                  VARCHAR(100),
  postal_code           VARCHAR(20),
  country               VARCHAR(100) DEFAULT 'France',
  phone                 VARCHAR(50),
  email                 VARCHAR(255),
  website               VARCHAR(255),
  logo_url              TEXT,
  timezone              VARCHAR(100) DEFAULT 'Europe/Paris',
  currency              VARCHAR(3) DEFAULT 'EUR',
  subscription_plan     VARCHAR(50) DEFAULT 'free',
  subscription_status   VARCHAR(50) DEFAULT 'active',
  subscription_ends_at  TIMESTAMPTZ,
  is_active             BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  created_by            CHAR(12),
  updated_by            CHAR(12)
);

CREATE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_salons_subscription_plan ON salons(subscription_plan);

-- User-Salon relationship (multi-tenant)
CREATE TABLE user_salons (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salon_id        BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  role_in_salon   VARCHAR(50) NOT NULL CHECK (role_in_salon IN ('Admin', 'Manager', 'Worker')),
  is_active       BOOLEAN DEFAULT TRUE,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, salon_id)
);

CREATE INDEX idx_user_salons_user ON user_salons(user_id);
CREATE INDEX idx_user_salons_salon ON user_salons(salon_id);

-- Salon settings
CREATE TABLE salon_settings (
  id                        BIGSERIAL PRIMARY KEY,
  salon_id                  BIGINT UNIQUE NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  allow_online_booking      BOOLEAN DEFAULT TRUE,
  booking_advance_days      INTEGER DEFAULT 30,
  booking_slot_duration     INTEGER DEFAULT 30,
  require_client_approval   BOOLEAN DEFAULT FALSE,
  send_email_confirmations  BOOLEAN DEFAULT TRUE,
  send_sms_reminders        BOOLEAN DEFAULT FALSE,
  tips_enabled              BOOLEAN DEFAULT TRUE,
  tips_distribution_rule    VARCHAR(50) DEFAULT 'EQUAL_WORKERS',
  default_worker_share_pct  INTEGER DEFAULT 60,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. WORKFORCE - WORKERS
-- ============================================

CREATE TABLE workers (
  id              BIGSERIAL PRIMARY KEY,
  salon_id        BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(50),
  avatar_url      TEXT,
  color           VARCHAR(7) DEFAULT '#8B5CF6',
  status          VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'OnLeave')),
  sharing_key     INTEGER DEFAULT 50 CHECK (sharing_key >= 0 AND sharing_key <= 100),
  bio             TEXT,
  specialties     TEXT[],
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      CHAR(12),
  updated_by      CHAR(12)
);

CREATE INDEX idx_workers_salon ON workers(salon_id);
CREATE INDEX idx_workers_user ON workers(user_id);
CREATE INDEX idx_workers_status ON workers(status);

-- ============================================
-- 4. CLIENTS
-- ============================================

CREATE TABLE clients (
  id              BIGSERIAL PRIMARY KEY,
  salon_id        BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(50) NOT NULL,
  address         TEXT,
  city            VARCHAR(100),
  postal_code     VARCHAR(20),
  birth_date      DATE,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      CHAR(12),
  updated_by      CHAR(12)
);

CREATE INDEX idx_clients_salon ON clients(salon_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE UNIQUE INDEX idx_clients_salon_email ON clients(salon_id, email) WHERE email IS NOT NULL;

-- ============================================
-- 5. SERVICES & PRODUCTS
-- ============================================

CREATE TABLE service_categories (
  id              BIGSERIAL PRIMARY KEY,
  salon_id        BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  color           VARCHAR(7),
  icon            VARCHAR(50),
  display_order   INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      CHAR(12),
  updated_by      CHAR(12),
  
  UNIQUE(salon_id, name)
);

CREATE INDEX idx_service_categories_salon ON service_categories(salon_id);

CREATE TABLE services (
  id              BIGSERIAL PRIMARY KEY,
  salon_id        BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  category_id     BIGINT REFERENCES service_categories(id) ON DELETE SET NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  duration        INTEGER NOT NULL,
  icon            VARCHAR(50),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      CHAR(12),
  updated_by      CHAR(12)
);

CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_services_category ON services(category_id);

CREATE TABLE products (
  id                      BIGSERIAL PRIMARY KEY,
  salon_id                BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name                    VARCHAR(255) NOT NULL,
  description             TEXT,
  price                   DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock                   INTEGER DEFAULT 0,
  category                VARCHAR(100),
  image_url               TEXT,
  sku                     VARCHAR(100),
  is_linked_to_service    BOOLEAN DEFAULT FALSE,
  linked_service_id       BIGINT REFERENCES services(id) ON DELETE SET NULL,
  is_active               BOOLEAN DEFAULT TRUE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  created_by              CHAR(12),
  updated_by              CHAR(12)
);

CREATE INDEX idx_products_salon ON products(salon_id);
CREATE INDEX idx_products_sku ON products(sku);

-- ============================================
-- 6. BOOKINGS
-- ============================================

CREATE TABLE bookings (
  id                  BIGSERIAL PRIMARY KEY,
  salon_id            BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id           BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  date                DATE NOT NULL,
  time                TIME NOT NULL,
  end_time            TIME NOT NULL,
  duration            INTEGER NOT NULL,
  status              VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Created', 'Pending', 'Confirmed', 'Started', 'Finished', 'Cancelled', 'Closed')),
  notes               TEXT,
  is_sensitive        BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  created_by          CHAR(12),
  updated_by          CHAR(12)
);

CREATE INDEX idx_bookings_salon ON bookings(salon_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Booking-Worker junction
CREATE TABLE booking_workers (
  id              BIGSERIAL PRIMARY KEY,
  booking_id      BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  worker_id       BIGINT NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(booking_id, worker_id)
);

CREATE INDEX idx_booking_workers_booking ON booking_workers(booking_id);
CREATE INDEX idx_booking_workers_worker ON booking_workers(worker_id);

-- Booking-Service junction
CREATE TABLE booking_services (
  id              BIGSERIAL PRIMARY KEY,
  booking_id      BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(booking_id, service_id)
);

CREATE INDEX idx_booking_services_booking ON booking_services(booking_id);
CREATE INDEX idx_booking_services_service ON booking_services(service_id);

-- ============================================
-- 7. INCOMES & PAYMENTS
-- ============================================

CREATE TABLE incomes (
  id                  BIGSERIAL PRIMARY KEY,
  salon_id            BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  booking_id          BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
  client_id           BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  amount              DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  discount_amount     DECIMAL(10,2) DEFAULT 0,
  final_amount        DECIMAL(10,2) NOT NULL CHECK (final_amount >= 0),
  date                DATE NOT NULL,
  payment_method      VARCHAR(50),
  status              VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending', 'Validated', 'Refused', 'Closed', 'Cancelled')),
  has_invoice         BOOLEAN DEFAULT FALSE,
  invoice_url         TEXT,
  promo_code_id       BIGINT REFERENCES promo_codes(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  created_by          CHAR(12),
  updated_by          CHAR(12)
);

CREATE INDEX idx_incomes_salon ON incomes(salon_id);
CREATE INDEX idx_incomes_date ON incomes(date);
CREATE INDEX idx_incomes_status ON incomes(status);

-- Income-Worker junction (revenue sharing)
CREATE TABLE income_workers (
  id              BIGSERIAL PRIMARY KEY,
  income_id       BIGINT NOT NULL REFERENCES incomes(id) ON DELETE CASCADE,
  worker_id       BIGINT NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  amount          DECIMAL(10,2) NOT NULL,
  percentage      INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(income_id, worker_id)
);

CREATE INDEX idx_income_workers_income ON income_workers(income_id);
CREATE INDEX idx_income_workers_worker ON income_workers(worker_id);

-- Income-Service junction
CREATE TABLE income_services (
  id              BIGSERIAL PRIMARY KEY,
  income_id       BIGINT NOT NULL REFERENCES incomes(id) ON DELETE CASCADE,
  service_id      BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(income_id, service_id)
);

CREATE INDEX idx_income_services_income ON income_services(income_id);

-- Income-Product junction
CREATE TABLE income_products (
  id              BIGSERIAL PRIMARY KEY,
  income_id       BIGINT NOT NULL REFERENCES incomes(id) ON DELETE CASCADE,
  product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(income_id, product_id)
);

CREATE INDEX idx_income_products_income ON income_products(income_id);

-- ============================================
-- 8. EXPENSES
-- ============================================

CREATE TABLE expense_categories (
  id              BIGSERIAL PRIMARY KEY,
  salon_id        BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  color           VARCHAR(7),
  icon            VARCHAR(50),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      CHAR(12),
  updated_by      CHAR(12),
  
  UNIQUE(salon_id, name)
);

CREATE INDEX idx_expense_categories_salon ON expense_categories(salon_id);

CREATE TABLE expenses (
  id              BIGSERIAL PRIMARY KEY,
  salon_id        BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  category_id     BIGINT NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  amount          DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  date            DATE NOT NULL,
  description     TEXT,
  payment_method  VARCHAR(50),
  receipt_url     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      CHAR(12),
  updated_by      CHAR(12)
);

CREATE INDEX idx_expenses_salon ON expenses(salon_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- ============================================
-- 9. RATINGS & REVIEWS
-- ============================================

CREATE TABLE reviews (
  id              BIGSERIAL PRIMARY KEY,
  salon_id        BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  booking_id      BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
  client_id       BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  worker_id       BIGINT REFERENCES workers(id) ON DELETE SET NULL,
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  is_approved     BOOLEAN DEFAULT FALSE,
  is_public       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_salon ON reviews(salon_id);
CREATE INDEX idx_reviews_worker ON reviews(worker_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- 10. PROMO CODES
-- ============================================

CREATE TABLE promo_codes (
  id                      BIGSERIAL PRIMARY KEY,
  salon_id                BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  code                    VARCHAR(50) NOT NULL,
  type                    VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value                   DECIMAL(10,2) NOT NULL,
  is_active               BOOLEAN DEFAULT TRUE,
  usage_count             INTEGER DEFAULT 0,
  max_usage               INTEGER,
  start_date              DATE,
  end_date                DATE,
  affect_worker_share     BOOLEAN DEFAULT FALSE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  created_by              CHAR(12),
  updated_by              CHAR(12),
  
  UNIQUE(salon_id, code)
);

CREATE INDEX idx_promo_codes_salon ON promo_codes(salon_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);

-- ============================================
-- 11. AUDIT & HISTORY
-- ============================================

CREATE TABLE interaction_history (
  id              BIGSERIAL PRIMARY KEY,
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       BIGINT NOT NULL,
  user_code       CHAR(12) NOT NULL,
  action          VARCHAR(100) NOT NULL,
  comment         TEXT,
  timestamp       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interaction_entity ON interaction_history(entity_type, entity_id);
CREATE INDEX idx_interaction_user ON interaction_history(user_code);
CREATE INDEX idx_interaction_timestamp ON interaction_history(timestamp);

CREATE TABLE comments (
  id              BIGSERIAL PRIMARY KEY,
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       BIGINT NOT NULL,
  user_code       CHAR(12) NOT NULL,
  text            TEXT NOT NULL,
  timestamp       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_timestamp ON comments(timestamp);

-- Forward reference for promo_codes (already defined above)
-- This is just to ensure incomes can reference it
