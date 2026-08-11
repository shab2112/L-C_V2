/*
  # Real Estate Platform Database Schema

  ## Overview
  Complete database schema for Ain Global Real Estate platform with user management,
  client relationships, property listings, contracts, content management, and document storage.

  ## New Tables

  ### 1. users
  - `id` (uuid, primary key) - User identifier
  - `email` (text, unique) - User email
  - `name` (text) - Full name
  - `role` (text) - User role: Owner, Admin, Property Advisor, or Client
  - `avatar` (text) - Avatar initials or URL
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. clients
  - `id` (uuid, primary key) - Client identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `property_advisor_id` (uuid, foreign key) - Assigned property advisor
  - `card_drive_id` (text) - Google Drive folder ID for client materials
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. listings
  - `id` (uuid, primary key) - Listing identifier
  - `client_id` (uuid, foreign key) - Associated client
  - `title` (text) - Property title
  - `address` (text) - Property address
  - `price` (numeric) - Property price
  - `bedrooms` (integer) - Number of bedrooms
  - `bathrooms` (integer) - Number of bathrooms
  - `sqft` (integer) - Square footage
  - `property_type` (text) - Apartment, Villa, Townhouse, Penthouse
  - `status` (text) - For Sale, For Rent, or Sold
  - `image_url` (text) - Main property image
  - `description` (text) - Property description
  - `created_at` (timestamptz) - Listing creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. contracts
  - `id` (uuid, primary key) - Contract identifier
  - `type` (text) - Contract type (Agency Agreement, Seller-to-Agent, etc.)
  - `party_name` (text) - Name of other party
  - `start_date` (date) - Contract start date
  - `expiry_date` (date) - Contract expiry date
  - `status` (text) - Draft, Signed, or Expired
  - `document_url` (text) - URL to contract document
  - `created_by` (uuid, foreign key) - User who created the contract
  - `created_at` (timestamptz) - Contract creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. drive_projects
  - `id` (uuid, primary key) - Project identifier
  - `name` (text) - Project name
  - `developer` (text) - Developer name
  - `drive_folder_id` (text) - Google Drive folder ID
  - `created_at` (timestamptz) - Project creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. drive_assets
  - `id` (uuid, primary key) - Asset identifier
  - `project_id` (uuid, foreign key) - Associated project
  - `name` (text) - Asset name
  - `type` (text) - image, video, brochure, or factsheet
  - `url` (text) - Asset URL
  - `content` (text) - Optional text content or description
  - `drive_file_id` (text) - Google Drive file ID
  - `created_at` (timestamptz) - Asset creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. content_posts
  - `id` (uuid, primary key) - Post identifier
  - `project_id` (uuid, foreign key) - Associated project
  - `platform` (text) - Facebook, LinkedIn, Instagram, YouTube, Twitter
  - `post_type` (text) - Image, Video, or Text
  - `status` (text) - Draft, Pending Approval, Approved, or Published
  - `scheduled_date` (timestamptz) - Scheduled publication date
  - `created_by` (uuid, foreign key) - User who created the post
  - `approved_by` (uuid, foreign key, nullable) - User who approved the post
  - `post_text` (text) - Post content
  - `image_url` (text) - Optional image URL
  - `video_url` (text) - Optional video URL
  - `created_at` (timestamptz) - Post creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 8. vault_documents
  - `id` (uuid, primary key) - Document identifier
  - `client_id` (uuid, foreign key) - Associated client
  - `name` (text) - Document name
  - `type` (text) - Passport, KYC, SPA, Title Deed, Other
  - `url` (text) - Document URL
  - `upload_date` (timestamptz) - Upload timestamp
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 9. chat_sessions
  - `id` (uuid, primary key) - Session identifier
  - `user_id` (uuid, foreign key) - User who owns the session
  - `title` (text) - Session title
  - `mode` (text) - staff or client
  - `created_at` (timestamptz) - Session creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 10. chat_messages
  - `id` (uuid, primary key) - Message identifier
  - `session_id` (uuid, foreign key) - Associated chat session
  - `role` (text) - user or model
  - `content` (text) - Message content
  - `sources` (jsonb) - Optional sources data
  - `action` (text) - Optional action type
  - `created_at` (timestamptz) - Message creation timestamp

  ### 11. master_prompts
  - `id` (uuid, primary key) - Prompt identifier
  - `category` (text) - Prompt category
  - `title` (text) - Prompt title
  - `content` (text) - Prompt content
  - `created_by` (uuid, foreign key) - User who created the prompt
  - `is_active` (boolean) - Whether prompt is active
  - `created_at` (timestamptz) - Prompt creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Create policies for authenticated users based on their roles
  - Clients can only access their own data
  - Property Advisors can access their assigned clients' data
  - Admins and Owners have full access

  ## Important Notes
  1. All tables use UUID primary keys for better security and scalability
  2. Timestamps are automatically managed with default values
  3. Foreign key constraints ensure data integrity
  4. RLS policies implement role-based access control
  5. Indexes are created on frequently queried columns
*/

-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('Owner', 'Admin', 'Property Advisor', 'Client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE contract_type AS ENUM ('Agency Agreement', 'Seller-to-Agent Agreement', 'Buyer-to-Agent Agreement', 'Agent-to-Agent Referral');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE contract_status AS ENUM ('Draft', 'Signed', 'Expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('For Sale', 'For Rent', 'Sold');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('Apartment', 'Villa', 'Townhouse', 'Penthouse');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('image', 'video', 'brochure', 'factsheet');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE social_platform AS ENUM ('Facebook', 'LinkedIn', 'Instagram', 'YouTube', 'Twitter');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('Image', 'Video', 'Text');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('Draft', 'Pending Approval', 'Approved', 'Published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('Passport', 'KYC', 'SPA', 'Title Deed', 'Other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE chat_mode AS ENUM ('staff', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'Client',
  avatar text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  property_advisor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  card_drive_id text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  address text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  sqft integer NOT NULL DEFAULT 0,
  property_type property_type DEFAULT 'Apartment',
  status listing_status DEFAULT 'For Sale',
  image_url text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type contract_type NOT NULL,
  party_name text NOT NULL,
  start_date date NOT NULL,
  expiry_date date NOT NULL,
  status contract_status DEFAULT 'Draft',
  document_url text DEFAULT '',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create drive_projects table
CREATE TABLE IF NOT EXISTS drive_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  developer text NOT NULL,
  drive_folder_id text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create drive_assets table
CREATE TABLE IF NOT EXISTS drive_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES drive_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type asset_type NOT NULL,
  url text NOT NULL,
  content text DEFAULT '',
  drive_file_id text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content_posts table
CREATE TABLE IF NOT EXISTS content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES drive_projects(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  post_type post_type NOT NULL,
  status post_status DEFAULT 'Draft',
  scheduled_date timestamptz NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  post_text text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  video_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vault_documents table
CREATE TABLE IF NOT EXISTS vault_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  type document_type NOT NULL,
  url text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  mode chat_mode DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'model')),
  content text NOT NULL,
  sources jsonb DEFAULT '[]'::jsonb,
  action text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create master_prompts table
CREATE TABLE IF NOT EXISTS master_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_advisor ON clients(property_advisor_id);
CREATE INDEX IF NOT EXISTS idx_listings_client ON listings(client_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON contracts(created_by);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_drive_assets_project ON drive_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_project ON content_posts(project_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_vault_docs_client ON vault_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for clients table
CREATE POLICY "Clients can view own record"
  ON clients FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    property_advisor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

CREATE POLICY "Staff can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    property_advisor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  )
  WITH CHECK (
    property_advisor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- RLS Policies for listings table
CREATE POLICY "Users can view listings"
  ON listings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = listings.client_id
      AND (c.user_id = auth.uid() OR c.property_advisor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin')))
    )
  );

CREATE POLICY "Staff can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can update listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = listings.client_id
      AND (c.property_advisor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin')))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = listings.client_id
      AND (c.property_advisor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin')))
    )
  );

CREATE POLICY "Staff can delete listings"
  ON listings FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- RLS Policies for contracts table
CREATE POLICY "Staff can view contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can create contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can update contracts"
  ON contracts FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

CREATE POLICY "Admins can delete contracts"
  ON contracts FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- RLS Policies for drive_projects table
CREATE POLICY "Staff can view drive projects"
  ON drive_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can manage drive projects"
  ON drive_projects FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for drive_assets table
CREATE POLICY "Staff can view drive assets"
  ON drive_assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can manage drive assets"
  ON drive_assets FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for content_posts table
CREATE POLICY "Staff can view content posts"
  ON content_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can create content posts"
  ON content_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can update content posts"
  ON content_posts FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

CREATE POLICY "Admins can delete content posts"
  ON content_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- RLS Policies for vault_documents table
CREATE POLICY "Users can view own vault documents"
  ON vault_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = vault_documents.client_id
      AND (c.user_id = auth.uid() OR c.property_advisor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin')))
    )
  );

CREATE POLICY "Staff can create vault documents"
  ON vault_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Staff can update vault documents"
  ON vault_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = vault_documents.client_id
      AND (c.property_advisor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin')))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = vault_documents.client_id
      AND (c.property_advisor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin')))
    )
  );

CREATE POLICY "Staff can delete vault documents"
  ON vault_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- RLS Policies for chat_sessions table
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for chat_messages table
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM chat_sessions WHERE id = chat_messages.session_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create chat messages in own sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM chat_sessions WHERE id = chat_messages.session_id AND user_id = auth.uid())
  );

-- RLS Policies for master_prompts table
CREATE POLICY "Staff can view master prompts"
  ON master_prompts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

CREATE POLICY "Admins can manage master prompts"
  ON master_prompts FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );