/*
  # Fix RLS Policies - Drive, Content, and Vault Tables

  Optimize RLS policies by using (select auth.uid()) pattern
  for better performance at scale.
*/

-- DRIVE_PROJECTS
DROP POLICY IF EXISTS "Staff can view drive projects" ON drive_projects;
DROP POLICY IF EXISTS "Staff can manage drive projects" ON drive_projects;

CREATE POLICY "Staff can manage drive projects" ON drive_projects
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

-- DRIVE_ASSETS
DROP POLICY IF EXISTS "Staff can view drive assets" ON drive_assets;
DROP POLICY IF EXISTS "Staff can manage drive assets" ON drive_assets;

CREATE POLICY "Staff can manage drive assets" ON drive_assets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

-- CONTENT_POSTS
DROP POLICY IF EXISTS "Staff can view content posts" ON content_posts;
CREATE POLICY "Staff can view content posts" ON content_posts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can create content posts" ON content_posts;
CREATE POLICY "Staff can create content posts" ON content_posts
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can update content posts" ON content_posts;
CREATE POLICY "Staff can update content posts" ON content_posts
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Admins can delete content posts" ON content_posts;
CREATE POLICY "Admins can delete content posts" ON content_posts
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- VAULT_DOCUMENTS
DROP POLICY IF EXISTS "Users can view own vault documents" ON vault_documents;
CREATE POLICY "Users can view own vault documents" ON vault_documents
  FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Staff can create vault documents" ON vault_documents;
CREATE POLICY "Staff can create vault documents" ON vault_documents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can update vault documents" ON vault_documents;
CREATE POLICY "Staff can update vault documents" ON vault_documents
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can delete vault documents" ON vault_documents;
CREATE POLICY "Staff can delete vault documents" ON vault_documents
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));