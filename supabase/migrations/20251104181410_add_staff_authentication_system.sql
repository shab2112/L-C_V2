/*
  # Add Staff Authentication System

  ## Overview
  Adds password-based authentication for staff members (Admin, Owner, Property Advisor).
  Implements temporary password system with 24-hour expiry and forced password change on first login.

  ## Changes Made

  ### 1. Update users table
  - Add `password_hash` column for storing hashed passwords
  - Add `temp_password` column for temporary password (plain text, only for 24h)
  - Add `temp_password_expires_at` column for temporary password expiry
  - Add `force_password_change` column to track if user needs to change password
  - Add `last_password_change` column to track password change history

  ### 2. Security Considerations
  - Temporary passwords expire after 24 hours
  - Users are forced to change password on first login
  - Password hashes use secure bcrypt algorithm
  - Temporary passwords are cleared after successful password change

  ## Important Notes
  1. Staff users (Admin, Owner, Property Advisor) use password authentication
  2. Client users continue to use OTP authentication
  3. Admins can create staff users with temporary passwords
  4. Temporary passwords are only valid for 24 hours
  5. Staff must change their password on first login
*/

-- Add password-related columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'temp_password'
  ) THEN
    ALTER TABLE users ADD COLUMN temp_password text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'temp_password_expires_at'
  ) THEN
    ALTER TABLE users ADD COLUMN temp_password_expires_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'force_password_change'
  ) THEN
    ALTER TABLE users ADD COLUMN force_password_change boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_password_change'
  ) THEN
    ALTER TABLE users ADD COLUMN last_password_change timestamptz;
  END IF;
END $$;

-- Function to clean up expired temporary passwords (called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_temp_passwords()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET 
    temp_password = NULL,
    temp_password_expires_at = NULL
  WHERE temp_password_expires_at < now();
END;
$$;

-- Create index for faster password lookups
CREATE INDEX IF NOT EXISTS idx_users_email_staff ON users(email) WHERE role IN ('Owner', 'Admin', 'Property Advisor');
