-- Migration: Fix trigger permissions for payment_status_history
-- Created: 2026-02-08
-- Description: Recreate triggers with SECURITY DEFINER to allow them to insert history

-- Step 1: Drop existing triggers
DROP TRIGGER IF EXISTS salary_payments_create_history ON salary_payments;

-- Step 2: Recreate the trigger function with SECURITY DEFINER
-- This makes the function execute with the privileges of the user who created it
CREATE OR REPLACE FUNCTION create_payment_history_entry()
RETURNS TRIGGER 
SECURITY DEFINER  -- This is the key change!
SET search_path = public
LANGUAGE plpgsql
AS $$
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
                WHEN NEW.status = 'disputed' THEN NEW.rejection_reason
                ELSE NULL
            END
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger
CREATE TRIGGER salary_payments_create_history
    AFTER UPDATE OF status ON salary_payments
    FOR EACH ROW
    EXECUTE FUNCTION create_payment_history_entry();

-- Step 4: Disable RLS on payment_status_history
ALTER TABLE payment_status_history DISABLE ROW LEVEL SECURITY;

-- Step 5: Grant basic permissions (belt and suspenders)
GRANT SELECT, INSERT ON payment_status_history TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE payment_status_history_id_seq TO authenticated;

-- Comments
COMMENT ON FUNCTION create_payment_history_entry() 
IS 'Trigger function with SECURITY DEFINER to allow inserting history regardless of user permissions';
