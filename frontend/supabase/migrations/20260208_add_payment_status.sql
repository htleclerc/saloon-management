-- Migration: Add Payment Status and History Tracking
-- Created: 2026-02-08
-- Description: Adds status workflow to salary_payments and creates history tracking table

-- Step 1: Add status columns to salary_payments table
ALTER TABLE salary_payments
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS worker_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS worker_rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS last_status_change_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_status_changed_by INTEGER REFERENCES users(id);

-- Step 2: Add check constraint for status values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'salary_payments_status_check'
    ) THEN
        ALTER TABLE salary_payments
        ADD CONSTRAINT salary_payments_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'disputed', 'auto_approved'));
    END IF;
END $$;

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_salary_payments_status 
ON salary_payments(status);

CREATE INDEX IF NOT EXISTS idx_salary_payments_worker_status 
ON salary_payments(worker_id, status);

CREATE INDEX IF NOT EXISTS idx_salary_payments_salon_status 
ON salary_payments(salon_id, status);

-- Step 4: Create payment_status_history table
CREATE TABLE IF NOT EXISTS payment_status_history (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES salary_payments(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    reason TEXT,
    metadata JSONB,
    CONSTRAINT payment_history_status_check 
    CHECK (new_status IN ('pending', 'approved', 'rejected', 'disputed', 'auto_approved'))
);

-- Step 5: Create indexes for history table
CREATE INDEX IF NOT EXISTS idx_payment_history_payment 
ON payment_status_history(payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_changed_at 
ON payment_status_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_history_changed_by 
ON payment_status_history(changed_by);

-- Step 6: Set existing payments to auto_approved status
-- Only update payments that don't have a status yet
UPDATE salary_payments
SET status = 'auto_approved',
    last_status_change_at = created_at
WHERE status = 'pending' OR status IS NULL;

-- Step 7: Create initial history entries for existing payments
INSERT INTO payment_status_history (payment_id, previous_status, new_status, changed_at, reason)
SELECT 
    id,
    NULL,
    'auto_approved',
    created_at,
    'Migrated from legacy system'
FROM salary_payments
WHERE id NOT IN (SELECT payment_id FROM payment_status_history);

-- Step 8: Add trigger to automatically update last_status_change_at
CREATE OR REPLACE FUNCTION update_payment_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_status_change_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS salary_payments_status_update ON salary_payments;
CREATE TRIGGER salary_payments_status_update
    BEFORE UPDATE OF status ON salary_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_status_timestamp();

-- Step 9: Add trigger to automatically create history entry on status change
CREATE OR REPLACE FUNCTION create_payment_history_entry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO payment_status_history (
            payment_id,
            previous_status,
            new_status,
            changed_by,
            changed_at,
            reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.last_status_changed_by,
            NOW(),
            CASE 
                WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
                ELSE NULL
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS salary_payments_create_history ON salary_payments;
CREATE TRIGGER salary_payments_create_history
    AFTER UPDATE OF status ON salary_payments
    FOR EACH ROW
    EXECUTE FUNCTION create_payment_history_entry();

-- Comments for documentation
COMMENT ON COLUMN salary_payments.status IS 'Payment status: pending, approved, rejected, disputed, auto_approved';
COMMENT ON COLUMN salary_payments.worker_approved_at IS 'Timestamp when worker approved the payment';
COMMENT ON COLUMN salary_payments.worker_rejected_at IS 'Timestamp when worker rejected the payment';
COMMENT ON COLUMN salary_payments.rejection_reason IS 'Reason provided by worker when rejecting payment';
COMMENT ON COLUMN salary_payments.last_status_change_at IS 'Timestamp of last status change';
COMMENT ON COLUMN salary_payments.last_status_changed_by IS 'User ID who last changed the status';

COMMENT ON TABLE payment_status_history IS 'Tracks all status changes for salary payments';
COMMENT ON COLUMN payment_status_history.metadata IS 'Additional metadata about the status change (JSON)';
