/*
  # Add Supplier Agreement to Contract Type

  1. Changes
    - Adds 'Supplier Agreement' value to the contract_type enum
  
  2. Notes
    - Uses ALTER TYPE to extend the existing enum without recreating it
    - Safe operation that doesn't affect existing data
*/

ALTER TYPE contract_type ADD VALUE IF NOT EXISTS 'Supplier Agreement';
