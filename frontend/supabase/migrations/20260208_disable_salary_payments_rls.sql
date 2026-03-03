-- Migration: Disable RLS for salary_payments table
-- This allows unrestricted access in demo mode
-- Created: 2026-02-08
-- IMPORTANT: In production, you should re-enable RLS with proper policies

-- Disable RLS on salary_payments table
ALTER TABLE salary_payments DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON salary_payments TO authenticated;
GRANT ALL ON salary_payments TO anon;

-- Grant access to the sequence as well
GRANT USAGE, SELECT ON SEQUENCE salary_payments_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE salary_payments_id_seq TO anon;
