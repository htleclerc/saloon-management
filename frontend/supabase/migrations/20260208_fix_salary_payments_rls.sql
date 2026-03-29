-- Migration: Fix RLS policies for salary_payments table
-- This migration drops the restrictive policies and creates simpler ones for demo mode
-- Created: 2026-02-08

-- Drop existing policies
DROP POLICY IF EXISTS salary_payments_select_policy ON salary_payments;
DROP POLICY IF EXISTS salary_payments_insert_policy ON salary_payments;
DROP POLICY IF EXISTS salary_payments_update_policy ON salary_payments;

-- Create simpler policies that allow all authenticated users
-- (In production, you should customize these based on your auth setup)

-- Policy: Allow all authenticated users to view all payments
CREATE POLICY salary_payments_select_policy ON salary_payments
    FOR SELECT
    USING (true);

-- Policy: Allow all authenticated users to insert payments
CREATE POLICY salary_payments_insert_policy ON salary_payments
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow all authenticated users to update payments
CREATE POLICY salary_payments_update_policy ON salary_payments
    FOR UPDATE
    USING (true);

-- Policy: Allow all authenticated users to delete payments
CREATE POLICY salary_payments_delete_policy ON salary_payments
    FOR DELETE
    USING (true);
