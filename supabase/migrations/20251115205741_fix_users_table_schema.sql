/*
  # Fix users table schema for registration
  
  1. Changes
    - Rename "first name" to "first_name" (remove space)
    - Rename "last name" to "last_name" (remove space)
    - Ensure all Client users can read and update their own data
  
  2. Security
    - Add RLS policies for clients to manage own profile
    - Allow anon users to read for dashboard display
*/

-- Rename columns to remove spaces
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'first name'
  ) THEN
    ALTER TABLE users RENAME COLUMN "first name" TO first_name;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last name'
  ) THEN
    ALTER TABLE users RENAME COLUMN "last name" TO last_name;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow anon read users" ON users;

-- Allow clients to read their own user data
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow clients to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow anon access for initial profile fetch
CREATE POLICY "Allow anon read users"
  ON users
  FOR SELECT
  TO anon
  USING (true);
