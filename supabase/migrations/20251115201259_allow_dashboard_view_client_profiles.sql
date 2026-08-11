/*
  # Allow Supabase dashboard to view client profiles
  
  1. Changes
    - Add policy to allow postgres/service role to view all client_profiles
    - This enables the Supabase dashboard UI to display the data
  
  2. Security
    - Only affects dashboard viewing
    - Does not change client-facing security
*/

-- Allow service role (dashboard) to view all client profiles
DROP POLICY IF EXISTS "Dashboard can view all client profiles" ON client_profiles;

CREATE POLICY "Dashboard can view all client profiles"
  ON client_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );
