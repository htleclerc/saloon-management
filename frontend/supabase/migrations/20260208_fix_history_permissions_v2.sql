-- Migration: Fix permission denied for table payment_status_history
-- Date: 2026-02-08
-- Description: Explicitly grant SELECT permission to authenticated users

GRANT SELECT ON TABLE payment_status_history TO authenticated;
GRANT SELECT ON TABLE payment_status_history TO service_role;
GRANT ALL ON TABLE payment_status_history TO service_role;
GRANT ALL ON SEQUENCE payment_status_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE payment_status_history_id_seq TO service_role;

-- Ensure RLS is disabled if it was re-enabled somehow
ALTER TABLE payment_status_history DISABLE ROW LEVEL SECURITY;
