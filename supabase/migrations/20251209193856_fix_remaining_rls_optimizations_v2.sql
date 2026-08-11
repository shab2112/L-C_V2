/*
  # Fix Remaining RLS Optimizations

  ## Overview
  This migration addresses the remaining RLS performance optimizations for client_otp_verifications.

  ## Changes Made

  ### 1. Optimize client_otp_verifications RLS Policies
  Wrap current_setting() and auth.uid() calls with SELECT to avoid per-row re-evaluation.
  This significantly improves query performance at scale.

  ## Notes on Other Warnings

  ### Unused Index Warnings
  The indexes created in the previous migration show as "unused" because:
  - They were just created and the database hasn't executed queries yet
  - PostgreSQL tracks index usage over time through pg_stat_user_indexes
  - These indexes are critical for foreign key JOIN performance and should NOT be removed
  - They will be automatically used when queries involve JOINs on these columns
  - After the application runs queries, these indexes will show as "used"

  ### PostGIS System Table (spatial_ref_sys)
  - This is a system table managed by the PostGIS extension
  - It contains spatial reference system definitions (read-only reference data)
  - We cannot enable RLS on it due to permission restrictions (must be owner)
  - This is standard behavior for PostGIS system tables
  - The table is managed by the extension and does not contain sensitive user data

  ### PostGIS Extension in Public Schema
  - PostGIS is installed in the public schema, which is the standard installation pattern
  - Moving extensions between schemas is complex and can break existing functionality
  - This is considered acceptable and is the recommended approach for PostGIS
  - The extension is widely used and trusted
*/

-- ==========================================
-- Optimize client_otp_verifications RLS
-- ==========================================

-- Drop existing policies to recreate with optimization
DROP POLICY IF EXISTS "Users can view own OTP records" ON client_otp_verifications;
DROP POLICY IF EXISTS "Users can update own OTP records" ON client_otp_verifications;

-- Optimized policy for viewing OTP records
-- Wraps current_setting() and auth.uid() with SELECT
CREATE POLICY "Users can view own OTP records"
  ON client_otp_verifications FOR SELECT
  TO authenticated
  USING (
    phone = (SELECT current_setting('request.jwt.claims', true)::json->>'phone')
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  );

-- Optimized policy for updating OTP records
-- Wraps current_setting() and auth.uid() with SELECT
CREATE POLICY "Users can update own OTP records"
  ON client_otp_verifications FOR UPDATE
  TO authenticated
  USING (
    phone = (SELECT current_setting('request.jwt.claims', true)::json->>'phone')
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  )
  WITH CHECK (
    phone = (SELECT current_setting('request.jwt.claims', true)::json->>'phone')
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  );
