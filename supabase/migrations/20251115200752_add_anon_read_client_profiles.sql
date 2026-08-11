/*
  # Allow anonymous read access to client profiles
  
  1. Changes
    - Add policy to allow reading client_profiles with anon key
    - This enables profile viewing without full authentication
  
  2. Security
    - Limited to SELECT only
    - Profiles can be read but not modified without auth
*/

-- Drop existing restrictive policies if needed and add anon read access
DROP POLICY IF EXISTS "Allow anon read for client profiles" ON client_profiles;

CREATE POLICY "Allow anon read for client profiles"
  ON client_profiles
  FOR SELECT
  TO anon
  USING (true);
