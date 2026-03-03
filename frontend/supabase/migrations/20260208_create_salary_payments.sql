-- Migration: Create salary_payments table for payroll payment tracking
-- Created: 2026-02-08

-- Create salary_payments table
CREATE TABLE IF NOT EXISTS salary_payments (
    id SERIAL PRIMARY KEY,
    worker_id BIGINT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    salon_id BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    payment_month DATE NOT NULL, -- First day of the month (e.g., '2026-02-01')
    base_salary DECIMAL(10,2) DEFAULT 0,
    commission DECIMAL(10,2) DEFAULT 0,
    tips DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    paid_date DATE NOT NULL,
    paid_by BIGINT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_salary_payments_worker ON salary_payments(worker_id);
CREATE INDEX idx_salary_payments_salon ON salary_payments(salon_id);
CREATE INDEX idx_salary_payments_month ON salary_payments(payment_month);
CREATE INDEX idx_salary_payments_date ON salary_payments(paid_date);

-- Add RLS policies
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view payments for their salon
CREATE POLICY salary_payments_select_policy ON salary_payments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_salons 
            WHERE user_salons.salon_id = salary_payments.salon_id 
            AND user_salons.user_id = (SELECT id FROM users WHERE user_code = current_user)
        )
    );

-- Policy: Users can insert payments for their salon
CREATE POLICY salary_payments_insert_policy ON salary_payments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_salons 
            WHERE user_salons.salon_id = salary_payments.salon_id 
            AND user_salons.user_id = (SELECT id FROM users WHERE user_code = current_user)
        )
    );

-- Policy: Users can update payments for their salon
CREATE POLICY salary_payments_update_policy ON salary_payments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_salons 
            WHERE user_salons.salon_id = salary_payments.salon_id 
            AND user_salons.user_id = (SELECT id FROM users WHERE user_code = current_user)
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_salary_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER salary_payments_updated_at
    BEFORE UPDATE ON salary_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_salary_payments_updated_at();
