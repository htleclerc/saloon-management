-- Fix permissions for payment_status_history table
-- Ensure authenticated users can insert into this table via triggers or direct calls

-- 1. Grant all permissions to authenticated users on the history table
GRANT ALL ON TABLE payment_status_history TO authenticated;
GRANT ALL ON SEQUENCE payment_status_history_id_seq TO authenticated;

-- 2. Ensure RLS is disabled as it's an audit table managed by system/triggers mainly
ALTER TABLE payment_status_history DISABLE ROW LEVEL SECURITY;

-- 3. Double check the trigger function permissions (optional but good practice)
-- If the trigger function exists, ensure it runs as security definer
-- (The function name is inferred from previous context: log_payment_status_change)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_payment_status_change') THEN
        ALTER FUNCTION log_payment_status_change() SECURITY DEFINER;
    END IF;
END
$$;
