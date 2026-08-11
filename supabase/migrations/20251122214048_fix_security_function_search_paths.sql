/*
  # Fix Function Search Paths

  Set secure search paths for functions to prevent
  security vulnerabilities from schema injection attacks.
*/

-- Fix function search paths to prevent security issues
ALTER FUNCTION cleanup_expired_temp_passwords() SET search_path = '';
ALTER FUNCTION cleanup_expired_otps() SET search_path = '';