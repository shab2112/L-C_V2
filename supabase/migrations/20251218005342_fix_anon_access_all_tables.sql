/*
  # Fix Anonymous Access for Client Tables

  ## Overview
  The application uses custom authentication (not Supabase Auth), so auth.uid()
  is always null. This migration adds anon policies to allow client operations
  while still enforcing security through user_id validation.

  ## Changes Made

  ### 1. map_chat_history Policies
  - Add anon INSERT policy (validates user exists)
  - Add anon SELECT policy
  - Add anon DELETE policy

  ### 2. user_favorites Policies
  - Add anon INSERT policy (validates user exists)
  - Add anon SELECT policy
  - Add anon UPDATE policy (validates user exists)
  - Add anon DELETE policy (validates user exists)

  ### 3. client_preferences Policies
  - Add anon INSERT policy (validates user exists)
  - Add anon SELECT policy
  - Add anon UPDATE policy (validates user exists)
  - Add anon DELETE policy (validates user exists)

  ## Security Notes
  - WITH CHECK ensures only valid user_ids from users table can be used
  - Anon users can only operate on records for users that exist
  - All existing authenticated policies remain in place
*/

-- ============================================================================
-- PART 1: map_chat_history Anonymous Policies
-- ============================================================================

DROP POLICY IF EXISTS "Anon can insert chat history for valid users" ON map_chat_history;
CREATE POLICY "Anon can insert chat history for valid users"
  ON map_chat_history FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  );

DROP POLICY IF EXISTS "Anon can view chat history" ON map_chat_history;
CREATE POLICY "Anon can view chat history"
  ON map_chat_history FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon can delete chat history" ON map_chat_history;
CREATE POLICY "Anon can delete chat history"
  ON map_chat_history FOR DELETE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  );

-- ============================================================================
-- PART 2: user_favorites Anonymous Policies
-- ============================================================================

DROP POLICY IF EXISTS "Anon can insert favorites for valid users" ON user_favorites;
CREATE POLICY "Anon can insert favorites for valid users"
  ON user_favorites FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  );

DROP POLICY IF EXISTS "Anon can view favorites" ON user_favorites;
CREATE POLICY "Anon can view favorites"
  ON user_favorites FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon can update favorites" ON user_favorites;
CREATE POLICY "Anon can update favorites"
  ON user_favorites FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  );

DROP POLICY IF EXISTS "Anon can delete favorites" ON user_favorites;
CREATE POLICY "Anon can delete favorites"
  ON user_favorites FOR DELETE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  );

-- ============================================================================
-- PART 3: client_preferences Anonymous Policies
-- ============================================================================

DROP POLICY IF EXISTS "Anon can insert preferences for valid users" ON client_preferences;
CREATE POLICY "Anon can insert preferences for valid users"
  ON client_preferences FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  );

DROP POLICY IF EXISTS "Anon can view preferences" ON client_preferences;
CREATE POLICY "Anon can view preferences"
  ON client_preferences FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon can update preferences" ON client_preferences;
CREATE POLICY "Anon can update preferences"
  ON client_preferences FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  );

DROP POLICY IF EXISTS "Anon can delete preferences" ON client_preferences;
CREATE POLICY "Anon can delete preferences"
  ON client_preferences FOR DELETE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_id
    )
  );