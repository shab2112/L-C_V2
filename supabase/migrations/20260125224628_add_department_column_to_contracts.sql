/*
  # Add Department Column to Contracts Table

  1. Changes
    - Creates a new `department` enum type with values: Sales, Marketing, Procurement, HR, Agents
    - Adds `department` column to the `contracts` table
  
  2. Notes
    - Column is NOT NULL with a default value of 'Sales'
    - Existing contracts will be assigned 'Sales' as the default department
*/

-- Create department enum type
DO $$ BEGIN
  CREATE TYPE department AS ENUM ('Sales', 'Marketing', 'Procurement', 'HR', 'Agents');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add department column to contracts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'department'
  ) THEN
    ALTER TABLE contracts ADD COLUMN department department NOT NULL DEFAULT 'Sales';
  END IF;
END $$;
