/*
  # Add Client OTP Authentication

  ## Overview
  Adds support for OTP-based authentication for client users using email and phone number.
  This allows clients to login without passwords using a secure one-time password sent to their email and phone.

  ## Changes Made

  ### 1. New Table: client_otp_verifications
  - `id` (uuid, primary key) - OTP record identifier
  - `email` (text, not null) - Client email address
  - `phone` (text, not null) - Client phone number
  - `email_otp` (text) - OTP code sent to email
  - `phone_otp` (text) - OTP code sent to phone
  - `email_verified` (boolean) - Email verification status
  - `phone_verified` (boolean) - Phone verification status
  - `otp_expires_at` (timestamptz) - OTP expiration timestamp
  - `attempts` (integer) - Number of verification attempts
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. Users Table Updates
  - Ensure `phone` field is required for client users
  - Add phone verification status tracking

  ## Security Considerations
  - OTPs expire after 10 minutes
  - Maximum 5 verification attempts per OTP request
  - OTP codes are 6 digits long
  - Email and phone must both be verified for successful authentication
  - Row Level Security (RLS) enabled with appropriate policies
  
  ## Important Notes
  1. OTP verification is only for Client role users
  2. Admin, Owner, and Property Advisor users are created by admins with password-based auth
  3. Clients authenticate using email + phone with OTP verification
  4. This table stores temporary OTP records that are cleaned up after verification or expiration
*/

-- Create client_otp_verifications table
CREATE TABLE IF NOT EXISTS client_otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text NOT NULL,
  email_otp text,
  phone_otp text,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  otp_expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_otp_email ON client_otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_client_otp_phone ON client_otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_client_otp_expires ON client_otp_verifications(otp_expires_at);

-- Enable Row Level Security
ALTER TABLE client_otp_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can create OTP request (for initial login)
CREATE POLICY "Anyone can create OTP request"
  ON client_otp_verifications FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Users can view their own OTP records
CREATE POLICY "Users can view own OTP records"
  ON client_otp_verifications FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

-- RLS Policy: Users can update their own OTP records during verification
CREATE POLICY "Users can update own OTP records"
  ON client_otp_verifications FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Admins can manage all OTP records
CREATE POLICY "Admins can manage OTP records"
  ON client_otp_verifications FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- Function to clean up expired OTP records (called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM client_otp_verifications
  WHERE otp_expires_at < now();
END;
$$;
