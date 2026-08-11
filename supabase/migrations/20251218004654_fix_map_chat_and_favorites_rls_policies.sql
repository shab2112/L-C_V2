/*
  # Fix map_chat_history and user_favorites RLS Policies

  ## Overview
  Updates RLS policies on map_chat_history and user_favorites tables to use
  the security definer function instead of directly querying the users table,
  preventing potential RLS recursion issues.

  ## Changes Made

  ### 1. Update map_chat_history Policies
  - Replace "Staff can view all chat history" policy to use is_staff_user() function
  - Prevents RLS recursion when checking user roles

  ### 2. Update user_favorites Policies  
  - Replace "Staff can view all favorites" policy to use is_staff_user() function
  - Prevents RLS recursion when checking user roles

  ## Security Notes
  - All existing access controls maintained
  - Uses SECURITY DEFINER function to avoid RLS recursion
  - Users can still only manage their own data
  - Staff can still view all data
*/

-- Fix map_chat_history "Staff can view all chat history" policy
DROP POLICY IF EXISTS "Staff can view all chat history" ON map_chat_history;
CREATE POLICY "Staff can view all chat history"
  ON map_chat_history FOR SELECT
  TO authenticated
  USING (is_staff_user((SELECT auth.uid())));

-- Fix user_favorites "Staff can view all favorites" policy
DROP POLICY IF EXISTS "Staff can view all favorites" ON user_favorites;
CREATE POLICY "Staff can view all favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (is_staff_user((SELECT auth.uid())));
