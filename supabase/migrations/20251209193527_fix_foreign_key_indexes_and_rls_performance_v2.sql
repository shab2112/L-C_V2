/*
  # Fix Foreign Key Indexes and RLS Performance

  ## Overview
  This migration addresses performance and security issues:
  - Adds missing indexes on foreign key columns
  - Optimizes RLS policies to avoid re-evaluation of auth.uid()
  - Fixes multiple permissive policies using restrictive policies
  - Handles PostGIS security concerns

  ## Changes Made

  ### 1. Add Foreign Key Indexes
  Adds indexes for 20 unindexed foreign keys across multiple tables to dramatically improve JOIN performance.

  ### 2. Optimize RLS Policies
  Replace auth.uid() calls with (SELECT auth.uid()) to avoid per-row re-evaluation.
  This significantly improves query performance at scale.

  ### 3. Fix Multiple Permissive Policies
  Use RESTRICTIVE policies where appropriate to ensure proper access control.

  ## Performance Impact
  - Foreign key indexes: Dramatically improve JOIN performance
  - RLS optimization: Reduce CPU usage on large queries
  - Restrictive policies: Maintain security while improving clarity
*/

-- ==========================================
-- PART 1: Add Foreign Key Indexes
-- ==========================================

-- Cities table
CREATE INDEX IF NOT EXISTS idx_cities_country_id ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_timezone_id ON cities(timezone_id);

-- Client profiles table
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);

-- Clients table
CREATE INDEX IF NOT EXISTS idx_clients_property_advisor_id ON clients(property_advisor_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Content posts table
CREATE INDEX IF NOT EXISTS idx_content_posts_approved_by ON content_posts(approved_by);
CREATE INDEX IF NOT EXISTS idx_content_posts_created_by ON content_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_content_posts_project_id ON content_posts(project_id);

-- Contracts table
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON contracts(created_by);

-- Developers table
CREATE INDEX IF NOT EXISTS idx_developers_city_id ON developers(city_id);

-- Drive assets table
CREATE INDEX IF NOT EXISTS idx_drive_assets_project_id ON drive_assets(project_id);

-- Listings table
CREATE INDEX IF NOT EXISTS idx_listings_client_id ON listings(client_id);

-- Master prompts table
CREATE INDEX IF NOT EXISTS idx_master_prompts_created_by ON master_prompts(created_by);

-- Project amenities table
CREATE INDEX IF NOT EXISTS idx_project_amenities_amenity_id ON project_amenities(amenity_id);

-- Projects table
CREATE INDEX IF NOT EXISTS idx_projects_city_id ON projects(city_id);
CREATE INDEX IF NOT EXISTS idx_projects_country_id ON projects(country_id);
CREATE INDEX IF NOT EXISTS idx_projects_developer_id ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_payment_plan_id ON projects(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_projects_unit_type_id ON projects(unit_type_id);

-- Vault documents table
CREATE INDEX IF NOT EXISTS idx_vault_documents_client_id ON vault_documents(client_id);

-- ==========================================
-- PART 2: Optimize RLS Policies with SELECT
-- ==========================================

-- Users table
DROP POLICY IF EXISTS "Users can view profiles" ON users;
CREATE POLICY "Users can view profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (SELECT auth.uid())
      AND u.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Master prompts table
DROP POLICY IF EXISTS "Admins can manage master prompts" ON master_prompts;
DROP POLICY IF EXISTS "Staff can view master prompts" ON master_prompts;

CREATE POLICY "Staff can view master prompts"
  ON master_prompts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

CREATE POLICY "Admins can manage master prompts"
  ON master_prompts
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  );

-- Countries table
DROP POLICY IF EXISTS "Authenticated users can view countries" ON countries;
DROP POLICY IF EXISTS "Staff can manage countries" ON countries;

CREATE POLICY "Authenticated users can view countries"
  ON countries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage countries"
  ON countries
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Cities table
DROP POLICY IF EXISTS "Authenticated users can view cities" ON cities;
DROP POLICY IF EXISTS "Staff can manage cities" ON cities;

CREATE POLICY "Authenticated users can view cities"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage cities"
  ON cities
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Communities table
DROP POLICY IF EXISTS "Authenticated users can view communities" ON communities;
DROP POLICY IF EXISTS "Staff can manage communities" ON communities;

CREATE POLICY "Authenticated users can view communities"
  ON communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage communities"
  ON communities
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Developers table
DROP POLICY IF EXISTS "Authenticated users can view developers" ON developers;
DROP POLICY IF EXISTS "Staff can manage developers" ON developers;

CREATE POLICY "Authenticated users can view developers"
  ON developers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage developers"
  ON developers
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Projects table
DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;
DROP POLICY IF EXISTS "Staff can manage projects" ON projects;

CREATE POLICY "Authenticated users can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage projects"
  ON projects
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Unit types table
DROP POLICY IF EXISTS "Authenticated users can view unit types" ON unit_types;
DROP POLICY IF EXISTS "Staff can manage unit types" ON unit_types;

CREATE POLICY "Authenticated users can view unit types"
  ON unit_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage unit types"
  ON unit_types
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Amenities table
DROP POLICY IF EXISTS "Authenticated users can view amenities" ON amenities;
DROP POLICY IF EXISTS "Staff can manage amenities" ON amenities;

CREATE POLICY "Authenticated users can view amenities"
  ON amenities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage amenities"
  ON amenities
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Project amenities table
DROP POLICY IF EXISTS "Authenticated users can view project amenities" ON project_amenities;
DROP POLICY IF EXISTS "Staff can manage project amenities" ON project_amenities;

CREATE POLICY "Authenticated users can view project amenities"
  ON project_amenities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage project amenities"
  ON project_amenities
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Payment plans table
DROP POLICY IF EXISTS "Authenticated users can view payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Staff can manage payment plans" ON payment_plans;

CREATE POLICY "Authenticated users can view payment plans"
  ON payment_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage payment plans"
  ON payment_plans
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Location connectivity table
DROP POLICY IF EXISTS "Authenticated users can view location connectivity" ON location_connectivity;
DROP POLICY IF EXISTS "Staff can manage location connectivity" ON location_connectivity;

CREATE POLICY "Authenticated users can view location connectivity"
  ON location_connectivity FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage location connectivity"
  ON location_connectivity
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Project images table
DROP POLICY IF EXISTS "Authenticated users can view project images" ON project_images;
DROP POLICY IF EXISTS "Staff can manage project images" ON project_images;

CREATE POLICY "Authenticated users can view project images"
  ON project_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage project images"
  ON project_images
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Project status history table
DROP POLICY IF EXISTS "Authenticated users can view project status history" ON project_status_history;
DROP POLICY IF EXISTS "Staff can manage project status history" ON project_status_history;

CREATE POLICY "Authenticated users can view project status history"
  ON project_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage project status history"
  ON project_status_history
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

-- Client OTP verifications table
DROP POLICY IF EXISTS "Users can view own OTP records" ON client_otp_verifications;
DROP POLICY IF EXISTS "Users can create OTP requests" ON client_otp_verifications;
DROP POLICY IF EXISTS "Users can update own OTP records" ON client_otp_verifications;

CREATE POLICY "Users can view own OTP records"
  ON client_otp_verifications FOR SELECT
  TO authenticated
  USING (
    phone = current_setting('request.jwt.claims', true)::json->>'phone'
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  );

CREATE POLICY "Users can create OTP requests"
  ON client_otp_verifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own OTP records"
  ON client_otp_verifications FOR UPDATE
  TO authenticated
  USING (
    phone = current_setting('request.jwt.claims', true)::json->>'phone'
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  )
  WITH CHECK (
    phone = current_setting('request.jwt.claims', true)::json->>'phone'
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  );

-- Client profiles table
DROP POLICY IF EXISTS "Users can view client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Users can insert client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON client_profiles;

CREATE POLICY "Users can view client profiles"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin', 'Property Advisor')
    )
  );

CREATE POLICY "Users can insert client profiles"
  ON client_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  );

CREATE POLICY "Users can update own profiles"
  ON client_profiles FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('Owner', 'Admin')
    )
  );

-- ==========================================
-- PART 3: Handle PostGIS Security
-- ==========================================

-- Drop the security definer views if they exist
DROP VIEW IF EXISTS public.spatial_ref_sys_safe;
DROP VIEW IF EXISTS public.app_spatial_ref_sys;

-- Note: spatial_ref_sys is a system table from PostGIS extension
-- We don't enable RLS on system tables as they are read-only reference data
-- The PostGIS extension in public schema is standard and managed by the extension system
