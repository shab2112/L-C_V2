/*
  # Add phone column to client_otp_verifications table
  
  1. Changes
    - Add phone column to client_otp_verifications table
    - Phone is required for OTP verification process
  
  2. Notes
    - This column stores the phone number during registration
*/

-- Add phone column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'client_otp_verifications' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE client_otp_verifications ADD COLUMN phone text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Remove the default after adding the column
ALTER TABLE client_otp_verifications ALTER COLUMN phone DROP DEFAULT;
