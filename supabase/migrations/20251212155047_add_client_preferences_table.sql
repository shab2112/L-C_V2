/*
  # Add Client Preferences Table

  ## Overview
  Stores client preferences and interests extracted from conversations with the AI assistant.
  This data is dynamically built as the user chats and mentions their preferences.

  ## Changes Made

  ### 1. New Table: client_preferences
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, references users.id) - Link to user account
  - `project_interested_in` (text) - Projects the client is interested in
  - `budget` (text) - Client's budget range
  - `communities_interested_in` (text) - Communities of interest
  - `work_location` (text) - Client's work location
  - `max_bedrooms` (text) - Maximum bedrooms desired
  - `max_bathrooms` (text) - Maximum bathrooms desired
  - `property_type` (text) - Type of property (villa, apartment, etc.)
  - `project_type` (text) - Project type preference
  - `age` (text) - Client age
  - `salary` (text) - Client salary range
  - `is_first_property` (text) - Whether this is first property purchase
  - `purpose` (text) - Purpose of purchase (investment, living, etc.)
  - `downpayment_ready` (text) - Downpayment readiness
  - `is_married` (text) - Marital status
  - `children_count` (text) - Number of children
  - `specific_requirements` (text) - Specific requirements mentioned
  - `handover_consideration` (text) - Handover time preferences
  - `needs_mortgage_agent` (text) - Whether client needs mortgage agent
  - `needs_golden_visa` (text) - Whether client needs golden visa assistance
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled
  - Users can only view/update their own preferences
  - Staff can view all client preferences
*/

-- Create client_preferences table
CREATE TABLE IF NOT EXISTS client_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  project_interested_in text,
  budget text,
  communities_interested_in text,
  work_location text,
  max_bedrooms text,
  max_bathrooms text,
  property_type text,
  project_type text,
  age text,
  salary text,
  is_first_property text,
  purpose text,
  downpayment_ready text,
  is_married text,
  children_count text,
  specific_requirements text,
  handover_consideration text,
  needs_mortgage_agent text,
  needs_golden_visa text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_client_preferences_user_id ON client_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON client_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON client_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON client_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Staff can view all client preferences
CREATE POLICY "Staff can view all client preferences"
  ON client_preferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- RLS Policy: Admins can manage all client preferences
CREATE POLICY "Admins can manage all client preferences"
  ON client_preferences FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('Owner', 'Admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('Owner', 'Admin')
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS client_preferences_updated_at ON client_preferences;
CREATE TRIGGER client_preferences_updated_at
  BEFORE UPDATE ON client_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_client_preferences_updated_at();
