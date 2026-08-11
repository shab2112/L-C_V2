/*
  # Fix RLS Policies - Core Tables

  Optimize RLS policies by using (select auth.uid()) pattern
  for better performance at scale.
*/

-- CLIENTS
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
CREATE POLICY "Clients can view own record" ON clients
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Staff can create clients" ON clients;
CREATE POLICY "Staff can create clients" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can update clients" ON clients;
CREATE POLICY "Staff can update clients" ON clients
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));

-- CHAT_SESSIONS
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own chat sessions" ON chat_sessions;
CREATE POLICY "Users can create own chat sessions" ON chat_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;
CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- CHAT_MESSAGES
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can create chat messages in own sessions" ON chat_messages;
CREATE POLICY "Users can create chat messages in own sessions" ON chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = (select auth.uid())));

-- LISTINGS
DROP POLICY IF EXISTS "Users can view listings" ON listings;
CREATE POLICY "Users can view listings" ON listings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can create listings" ON listings;
CREATE POLICY "Staff can create listings" ON listings
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can update listings" ON listings;
CREATE POLICY "Staff can update listings" ON listings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can delete listings" ON listings;
CREATE POLICY "Staff can delete listings" ON listings
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

-- CONTRACTS
DROP POLICY IF EXISTS "Staff can view contracts" ON contracts;
CREATE POLICY "Staff can view contracts" ON contracts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can create contracts" ON contracts;
CREATE POLICY "Staff can create contracts" ON contracts
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Staff can update contracts" ON contracts;
CREATE POLICY "Staff can update contracts" ON contracts
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner', 'Property Advisor')));

DROP POLICY IF EXISTS "Admins can delete contracts" ON contracts;
CREATE POLICY "Admins can delete contracts" ON contracts
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('Admin', 'Owner')));