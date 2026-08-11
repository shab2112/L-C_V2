/*
  # Add Client Profile Information

  ## Overview
  Adds fields to store client personal information including name and contact details.
  This allows the system to properly identify and serve clients based on their registration data.

  ## Changes Made

  ### 1. New Table: client_profiles
  - `id` (uuid, primary key) - Client profile identifier
  - `user_id` (uuid, references users.id) - Link to user account
  - `first_name` (text, not null) - Client's first name
  - `last_name` (text, not null) - Client's last name
  - `email` (text, unique, not null) - Client's email address
  - `phone` (text, unique, not null) - Client's phone number
  - `location` (text) - Client's home location (optional)
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. Update client_otp_verifications table
  - Add `first_name`, `last_name`, and `location` columns to store registration data temporarily

  ## Security Considerations
  - Row Level Security (RLS) enabled on client_profiles
  - Clients can only view and update their own profile
  - Admins and Property Advisors can view all client profiles
  - Email and phone are unique to prevent duplicate registrations

  ## Important Notes
  1. This table stores permanent client profile information
  2. Client profiles are created after successful OTP verification
  3. The client_otp_verifications table stores temporary registration data during the verification process
*/

-- Add columns to client_otp_verifications for registration data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_otp_verifications' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE client_otp_verifications ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_otp_verifications' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE client_otp_verifications ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_otp_verifications' AND column_name = 'location'
  ) THEN
    ALTER TABLE client_otp_verifications ADD COLUMN location text;
  END IF;
END $$;

-- Create client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_email ON client_profiles(email);
CREATE INDEX IF NOT EXISTS idx_client_profiles_phone ON client_profiles(phone);

-- Enable Row Level Security
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can view their own profile
CREATE POLICY "Clients can view own profile"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Clients can update their own profile
CREATE POLICY "Clients can update own profile"
  ON client_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: System can insert client profiles (via edge functions)
CREATE POLICY "System can insert client profiles"
  ON client_profiles FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Admins and Property Advisors can view all client profiles
CREATE POLICY "Staff can view all client profiles"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- RLS Policy: Admins can manage all client profiles
CREATE POLICY "Admins can manage all client profiles"
  ON client_profiles FOR ALL
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
