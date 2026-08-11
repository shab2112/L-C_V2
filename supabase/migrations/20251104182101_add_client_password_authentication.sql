/*
  # Add Client Password Authentication

  ## Overview
  Adds password authentication for client users.
  Clients will now set a password during registration and use it for login.

  ## Changes Made

  ### 1. Update client_profiles table
  - Add `password_hash` column for storing hashed passwords

  ### 2. Update client_otp_verifications table
  - Add `password` column to temporarily store password during OTP verification

  ## Security Considerations
  - Passwords are hashed using bcrypt before storage
  - Temporary password in OTP table is cleared after verification
  - Password must be at least 8 characters

  ## Important Notes
  1. Clients now use email/phone + OTP + password for registration
  2. After registration, clients login with email + password
  3. Forgot password flow will use OTP for verification
*/

-- Add password_hash to client_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_profiles' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE client_profiles ADD COLUMN password_hash text;
  END IF;
END $$;

-- Add password to client_otp_verifications for temporary storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_otp_verifications' AND column_name = 'password'
  ) THEN
    ALTER TABLE client_otp_verifications ADD COLUMN password text;
  END IF;
END $$;
