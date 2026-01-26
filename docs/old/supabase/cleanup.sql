-- Auto-Cleanup for Demo Data
-- Deletes data older than 7 days

-- ============================================
-- Cleanup Function
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_demo_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete old workers
  DELETE FROM workers WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % workers older than 7 days', deleted_count;
  
  -- Delete old clients
  DELETE FROM clients WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % clients older than 7 days', deleted_count;
  
  -- Delete old services
  DELETE FROM services WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % services older than 7 days', deleted_count;
  
  -- Delete old bookings
  DELETE FROM bookings WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % bookings older than 7 days', deleted_count;
  
  -- Delete old incomes
  DELETE FROM incomes WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % incomes older than 7 days', deleted_count;
  
  -- Delete old expenses
  DELETE FROM expenses WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % expenses older than 7 days', deleted_count;
  
  -- Delete old expense categories (not referenced)
  DELETE FROM expense_categories 
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND id NOT IN (SELECT DISTINCT category_id FROM expenses WHERE category_id IS NOT NULL);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % expense categories older than 7 days', deleted_count;
  
  RAISE NOTICE 'Demo data cleanup completed successfully';
END;
$$;

-- ============================================
-- Manual Cleanup Test
-- ============================================
-- To test manually, run:
-- SELECT cleanup_demo_data();

-- ============================================
-- Schedule Cleanup (Cron Job)
-- ============================================
-- Note: pg_cron extension must be enabled first
-- Run in Supabase SQL Editor as superuser:
-- 
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- SELECT cron.schedule(
--   'cleanup-demo-data-daily',
--   '0 3 * * *',  -- Every day at 3 AM UTC
--   $$SELECT cleanup_demo_data()$$
-- );

-- ============================================
-- View Scheduled Jobs
-- ============================================
-- SELECT * FROM cron.job;

-- ============================================
-- Unschedule Job (if needed)
-- ============================================
-- SELECT cron.unschedule('cleanup-demo-data-daily');
