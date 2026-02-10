-- Migration: Grant all permissions to anon for payment_status_history and add bulk RPC
-- This is required for Demo Mode to function correctly without authentication
-- Created: 2026-02-09

-- 1. Grant all permissions to anon users on the history table
GRANT ALL ON TABLE payment_status_history TO anon;
GRANT ALL ON TABLE payment_status_history TO authenticated;

-- 2. Grant all permissions to the sequence
GRANT ALL ON SEQUENCE payment_status_history_id_seq TO anon;
GRANT ALL ON SEQUENCE payment_status_history_id_seq TO authenticated;

-- 3. Ensure RLS is disabled
ALTER TABLE payment_status_history DISABLE ROW LEVEL SECURITY;

-- 4. Grant access to and fix existing RPC functions
GRANT EXECUTE ON FUNCTION get_payment_history_secure(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_payment_history_secure(INTEGER) TO authenticated;

-- 5. Create/Update the bulk RPC for consolidated worker history
CREATE OR REPLACE FUNCTION get_payment_history_secure_bulk(p_payment_ids INTEGER[])
RETURNS TABLE (
    id INTEGER,
    payment_id INTEGER,
    previous_status VARCHAR,
    new_status VARCHAR,
    changed_by INTEGER,
    changed_by_name TEXT,
    changed_by_role TEXT,
    changed_at TIMESTAMP,
    reason TEXT,
    metadata JSONB
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.id,
        ph.payment_id,
        ph.previous_status,
        ph.new_status,
        ph.changed_by,
        COALESCE(u.first_name || ' ' || u.last_name, u.email)::TEXT as changed_by_name,
        u.role::TEXT as changed_by_role,
        ph.changed_at::TIMESTAMP,
        ph.reason,
        ph.metadata
    FROM 
        payment_status_history ph
    LEFT JOIN 
        users u ON ph.changed_by = u.id
    WHERE 
        ph.payment_id = ANY(p_payment_ids)
    ORDER BY 
        ph.changed_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_payment_history_secure_bulk(INTEGER[]) TO anon;
GRANT EXECUTE ON FUNCTION get_payment_history_secure_bulk(INTEGER[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_history_secure_bulk(INTEGER[]) TO service_role;
