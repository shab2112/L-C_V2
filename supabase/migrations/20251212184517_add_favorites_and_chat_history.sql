/*
  # Add Favorites and Chat History Tables

  ## Overview
  Creates tables to store user favorites (saved projects) and chat history for the map assistant.

  ## Changes Made

  ### 1. New Table: user_favorites
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, references users.id) - Link to user account
  - `name` (text) - Project name
  - `community` (text) - Community name
  - `image_url` (text) - Project image URL
  - `features` (jsonb) - Array of features
  - `notes` (text) - User notes
  - `project_specs` (jsonb) - Project specifications
  - `starting_price` (numeric) - Starting price
  - `project_type` (text) - Type of project
  - `property_type` (text) - Type of property
  - `service_charge` (numeric) - Service charge
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. New Table: map_chat_history
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, references users.id) - Link to user account
  - `session_id` (text) - Session identifier
  - `role` (text) - Message role (user, agent, system)
  - `text` (text) - Message content
  - `is_final` (boolean) - Whether message is final
  - `metadata` (jsonb) - Additional metadata (tool calls, grounding, etc.)
  - `created_at` (timestamptz) - Message timestamp

  ## Security
  - RLS enabled on both tables
  - Users can only access their own favorites and chat history
  - Staff can view all data
*/

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  community text,
  image_url text,
  features jsonb DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  project_specs jsonb,
  starting_price numeric,
  project_type text,
  property_type text,
  service_charge numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_name ON user_favorites(user_id, name);

-- Enable Row Level Security
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own favorites"
  ON user_favorites FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Staff can view all favorites
CREATE POLICY "Staff can view all favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Create map_chat_history table
CREATE TABLE IF NOT EXISTS map_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  text text NOT NULL,
  is_final boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_map_chat_history_user_id ON map_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_map_chat_history_session_id ON map_chat_history(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_map_chat_history_created_at ON map_chat_history(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE map_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for map_chat_history
CREATE POLICY "Users can view own chat history"
  ON map_chat_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own chat history"
  ON map_chat_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own chat history"
  ON map_chat_history FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Staff can view all chat history
CREATE POLICY "Staff can view all chat history"
  ON map_chat_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user_favorites
DROP TRIGGER IF EXISTS user_favorites_updated_at ON user_favorites;
CREATE TRIGGER user_favorites_updated_at
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_user_favorites_updated_at();
