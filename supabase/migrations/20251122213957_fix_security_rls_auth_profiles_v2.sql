/*
  # Fix RLS Policies - Authentication and Profile Tables

  Optimize RLS policies by using (select auth.uid()) pattern
  for better performance at scale.
*/

-- MASTER_PROMPTS
DROP POLICY IF EXISTS "Staff can view master prompts" ON master_prompts;
CREATE POLICY "Staff can view master prompts" ON master_prompts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Admins can manage master prompts" ON master_prompts;
CREATE POLICY "Admins can manage master prompts" ON master_prompts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- CLIENT_OTP_VERIFICATIONS (uses email, not user_id)
DROP POLICY IF EXISTS "Users can view own OTP records" ON client_otp_verifications;
CREATE POLICY "Users can view own OTP records" ON client_otp_verifications
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can update own OTP records" ON client_otp_verifications;
CREATE POLICY "Users can update own OTP records" ON client_otp_verifications
  FOR UPDATE TO authenticated
  USING (email = (SELECT email FROM users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Admins can manage OTP records" ON client_otp_verifications;
CREATE POLICY "Admins can manage OTP records" ON client_otp_verifications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- CLIENT_PROFILES
DROP POLICY IF EXISTS "Clients can view own profile" ON client_profiles;
CREATE POLICY "Clients can view own profile" ON client_profiles
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Clients can update own profile" ON client_profiles;
CREATE POLICY "Clients can update own profile" ON client_profiles
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Staff can view all client profiles" ON client_profiles;
CREATE POLICY "Staff can view all client profiles" ON client_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Admins can manage all client profiles" ON client_profiles;
CREATE POLICY "Admins can manage all client profiles" ON client_profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- USERS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()));