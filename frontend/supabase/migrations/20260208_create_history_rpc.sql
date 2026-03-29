-- Migration: Create RPC function to fetch payment history securely
-- Date: 2026-02-08
-- Description: Creates a SECURITY DEFINER function to bypass table permissions for history fetching

CREATE OR REPLACE FUNCTION get_payment_history_secure(p_payment_id INTEGER)
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
SECURITY DEFINER -- Executes with privileges of the creator (postgres/admin)
SET search_path = public -- Secure search path
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.id,
        ph.payment_id,
        ph.previous_status,
        ph.new_status,
        ph.changed_by,
        -- Combined name from first/last name or email fallback
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
        ph.payment_id = p_payment_id
    ORDER BY 
        ph.changed_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_payment_history_secure(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_history_secure(INTEGER) TO service_role;
