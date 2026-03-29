-- Migration: Add tips column to incomes and income_worker_shares tables
-- This allows explicit per-worker tips instead of deduced ones.

-- 1. Add tips to incomes table (Total tips for the transaction)
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS tips DECIMAL(10,2) DEFAULT 0;

-- 2. Add tips to income_worker_shares table (Individual tip assignment)
ALTER TABLE income_worker_shares ADD COLUMN IF NOT EXISTS tips DECIMAL(10,2) DEFAULT 0;

-- 3. Optional: Initialize existing data
-- If we want to populate from some previous logic, we could, but since it was deduced,
-- it's cleaner to just leave them at 0 or use the previous dedication logic.
-- Note: The previous deduction logic was often done in the UI/Service but not stored.
