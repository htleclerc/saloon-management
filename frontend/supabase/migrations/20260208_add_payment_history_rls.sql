-- Migration: Fix permissions on payment_status_history table
-- Created: 2026-02-08
-- Description: Grant required permissions and disable RLS to allow triggers to insert history

-- Step 1: Disable RLS (if not already done)
ALTER TABLE payment_status_history DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant permissions to authenticated role
GRANT SELECT, INSERT ON payment_status_history TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE payment_status_history_id_seq TO authenticated;

-- Step 3: Grant permissions to service_role (for triggers)
GRANT ALL ON payment_status_history TO service_role;
GRANT USAGE, SELECT ON SEQUENCE payment_status_history_id_seq TO service_role;

-- Step 4: Drop any existing RLS policies (cleanup)
DROP POLICY IF EXISTS "Authenticated users can view payment history" ON payment_status_history;
DROP POLICY IF EXISTS "Authenticated users can insert payment history" ON payment_status_history;
DROP POLICY IF EXISTS "Users can view payment status history" ON payment_status_history;
DROP POLICY IF EXISTS "Users can insert payment status history" ON payment_status_history;
DROP POLICY IF EXISTS "Only admins can update payment history" ON payment_status_history;
DROP POLICY IF EXISTS "Only admins can delete payment history" ON payment_status_history;

-- Comments
COMMENT ON TABLE payment_status_history 
IS 'Audit trail for salary payment status changes. RLS disabled and GRANT permissions given to allow trigger-based inserts.';
