/*
  # Fix RLS Policies - Global Real Estate Tables

  Optimize RLS policies by using (select auth.uid()) pattern
  and consolidate duplicate permissive policies.
*/

-- COUNTRIES
DROP POLICY IF EXISTS "Staff can manage countries" ON countries;
CREATE POLICY "Staff can manage countries" ON countries
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- CITIES
DROP POLICY IF EXISTS "Staff can manage cities" ON cities;
CREATE POLICY "Staff can manage cities" ON cities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- COMMUNITIES
DROP POLICY IF EXISTS "Staff can manage communities" ON communities;
CREATE POLICY "Staff can manage communities" ON communities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- DEVELOPERS
DROP POLICY IF EXISTS "Staff can manage developers" ON developers;
CREATE POLICY "Staff can manage developers" ON developers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- PROJECTS
DROP POLICY IF EXISTS "Staff can manage projects" ON projects;
CREATE POLICY "Staff can manage projects" ON projects
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

-- UNIT_TYPES
DROP POLICY IF EXISTS "Staff can manage unit types" ON unit_types;
CREATE POLICY "Staff can manage unit types" ON unit_types
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- AMENITIES
DROP POLICY IF EXISTS "Staff can manage amenities" ON amenities;
CREATE POLICY "Staff can manage amenities" ON amenities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- PROJECT_AMENITIES
DROP POLICY IF EXISTS "Staff can manage project amenities" ON project_amenities;
CREATE POLICY "Staff can manage project amenities" ON project_amenities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- PAYMENT_PLANS
DROP POLICY IF EXISTS "Staff can manage payment plans" ON payment_plans;
CREATE POLICY "Staff can manage payment plans" ON payment_plans
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- LOCATION_CONNECTIVITY
DROP POLICY IF EXISTS "Staff can manage location connectivity" ON location_connectivity;
CREATE POLICY "Staff can manage location connectivity" ON location_connectivity
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- PROJECT_IMAGES
DROP POLICY IF EXISTS "Staff can manage project images" ON project_images;
CREATE POLICY "Staff can manage project images" ON project_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- PROJECT_STATUS_HISTORY
DROP POLICY IF EXISTS "Staff can manage project status history" ON project_status_history;
CREATE POLICY "Staff can manage project status history" ON project_status_history
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));