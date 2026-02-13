-- Migration: Add specific_days support to goals table
-- Run this in the Supabase SQL Editor

-- Add the specific_days column
ALTER TABLE goals ADD COLUMN IF NOT EXISTS specific_days integer[];

-- Drop the old constraint and add new one with 'specific_days' type
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_goal_type_check;
ALTER TABLE goals ADD CONSTRAINT goals_goal_type_check
  CHECK (goal_type IN ('divisible', 'weekly', 'daily', 'one_time', 'specific_days'));
