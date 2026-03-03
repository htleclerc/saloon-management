-- Migration: Add tips column to incomes table
ALTER TABLE incomes ADD COLUMN tips DECIMAL(10,2) DEFAULT 0;
