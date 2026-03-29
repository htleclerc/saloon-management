-- ============================================================
-- SALOON MANAGEMENT - AUTOMATIC CLEANUP SCRIPT (DEMO MODE)
-- ============================================================
-- Deletes demo data older than 7 days to keep the cloud DB clean.

CREATE OR REPLACE FUNCTION cleanup_demo_data()
RETURNS void AS $$
BEGIN
    -- Delete old interaction history
    DELETE FROM interaction_history WHERE timestamp < NOW() - INTERVAL '7 days';
    
    -- Delete old comments
    DELETE FROM salon_comments WHERE timestamp < NOW() - INTERVAL '7 days';
    
    -- Delete old reviews
    DELETE FROM reviews WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Delete old incomes (and their junctions)
    DELETE FROM incomes WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Delete old expenses
    DELETE FROM expenses WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Delete old bookings (and their junctions)
    DELETE FROM bookings WHERE created_at < NOW() - INTERVAL '7 days';

    -- Note: We don't delete Users, Salons, Workers, Clients, Services or Categories 
    -- as they are part of the core structure. We only cleanup operational data.
    
    RAISE NOTICE 'Demo cleanup completed successfully.';
END;
$$ LANGUAGE plpgsql;

-- To automate this in Supabase, you can use pg_cron (if enabled) or a scheduled Edge Function.
-- Example with pg_cron:
-- SELECT cron.schedule('0 0 * * *', 'SELECT cleanup_demo_data();');
