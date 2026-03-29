-- Migration to add notes column to incomes table
ALTER TABLE incomes ADD COLUMN notes TEXT;
