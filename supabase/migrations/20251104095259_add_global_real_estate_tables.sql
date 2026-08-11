/*
  # Add Global Real Estate Schema Tables

  ## Overview
  Extends the existing Lucra platform with comprehensive global real estate data structure
  including countries, cities, communities, developers, projects, unit types, amenities,
  payment plans, and location connectivity.

  ## New Tables

  ### 1. countries
  - `country_id` (serial, primary key) - Country identifier
  - `country_name` (varchar 100) - Full country name
  - `iso_code` (varchar 3) - ISO country code (e.g., 'UAE', 'ESP')
  - `currency_code` (varchar 10) - Default currency (e.g., 'AED', 'USD')
  - `primary_language` (varchar 50) - Primary language spoken
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. cities
  - `city_id` (serial, primary key) - City identifier
  - `city_name` (varchar 100) - City name
  - `country_id` (int, foreign key) - Reference to countries table
  - `population` (int) - City population
  - `timezone` (varchar 50) - City timezone
  - `latitude` (decimal 10,6) - Geographic latitude
  - `longitude` (decimal 10,6) - Geographic longitude
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. communities
  - `community_id` (serial, primary key) - Community identifier
  - `city_id` (int, foreign key) - Reference to cities table
  - `community_name_english` (varchar 255) - English name
  - `community_name_local` (varchar 255) - Local language name
  - `label_english` (varchar 255) - Display label in English
  - `label_local` (varchar 255) - Display label in local language
  - `polygon_coordinates` (geometry) - Geographic boundary polygon
  - `description` (text) - Community description
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. developers
  - `developer_id` (serial, primary key) - Developer identifier
  - `developer_name` (varchar 255, unique) - English name
  - `developer_name_arabic` (varchar 255) - Arabic name
  - `contact_info` (text) - Contact information
  - `website` (varchar 255) - Company website
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. projects
  - `project_id` (serial, primary key) - Project identifier
  - `project_name` (varchar 255) - Project name
  - `developer_id` (int, foreign key) - Reference to developers table
  - `community_id` (int, foreign key) - Reference to communities table
  - `city_id` (int, foreign key) - Reference to cities table
  - `country_id` (int, foreign key) - Reference to countries table
  - `location_description` (text) - Detailed location description
  - `launch_date` (date) - Project launch date
  - `handover_date` (varchar 50) - Original handover date string
  - `handover_date_normalized` (date) - Normalized handover date
  - `project_phase` (text) - Current project phase
  - `starting_price` (numeric 15,2) - Starting price
  - `currency_code` (varchar 10) - Price currency
  - `service_charge` (numeric 10,2) - Annual service charge
  - `foreigners_allowed` (boolean) - Foreign ownership allowed
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. unit_types
  - `unit_type_id` (serial, primary key) - Unit type identifier
  - `project_id` (int, foreign key) - Reference to projects table
  - `unit_category` (varchar 100) - Category (townhouse, villa, apartment, etc.)
  - `bedrooms` (int) - Number of bedrooms
  - `bathrooms` (int) - Number of bathrooms
  - `built_up_area_min` (decimal 10,2) - Minimum built-up area
  - `built_up_area_max` (decimal 10,2) - Maximum built-up area
  - `built_up_area_unit` (varchar 20) - Area measurement unit (default: sqft)
  - `price_aed` (decimal 15,2) - Price in AED
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. amenities
  - `amenity_id` (serial, primary key) - Amenity identifier
  - `amenity_name` (varchar 255, unique) - Amenity name
  - `amenity_category` (varchar 100) - Category grouping
  - `description` (text) - Amenity description
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 8. project_amenities (junction table)
  - `project_id` (int, foreign key) - Reference to projects table
  - `amenity_id` (int, foreign key) - Reference to amenities table
  - Composite primary key on (project_id, amenity_id)

  ### 9. payment_plans
  - `payment_plan_id` (serial, primary key) - Payment plan identifier
  - `project_id` (int, foreign key) - Reference to projects table
  - `plan_description` (text) - Description of payment plan
  - `during_construction_percent` (decimal 5,2) - % paid during construction
  - `on_handover_percent` (decimal 5,2) - % paid on handover
  - `post_handover_percent` (decimal 5,2) - % paid post-handover
  - `installment_details` (jsonb) - Detailed installment breakdown
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 10. location_connectivity
  - `connectivity_id` (serial, primary key) - Connectivity identifier
  - `project_id` (int, foreign key) - Reference to projects table
  - `landmark_name` (varchar 255) - Name of landmark
  - `landmark_type` (varchar 100) - Type of landmark
  - `distance_minutes` (int) - Travel time in minutes
  - `distance_km` (decimal 10,2) - Distance in kilometers
  - `transportation_mode` (varchar 50) - Mode of transport (default: car)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 11. project_images
  - `image_id` (serial, primary key) - Image identifier
  - `project_id` (int, foreign key) - Reference to projects table
  - `image_url` (varchar 500) - Image URL
  - `image_type` (varchar 50) - Type of image
  - `caption` (text) - Image caption
  - `display_order` (int) - Display order (default: 0)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 12. project_status_history
  - `history_id` (serial, primary key) - History record identifier
  - `project_id` (int, foreign key) - Reference to projects table
  - `status` (varchar 50) - Project status
  - `status_date` (date) - Date of status change
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Integration Notes
  - Extends existing `drive_projects` table functionality with comprehensive project data
  - Links to existing `listings` table via community and location data
  - Provides market intelligence data for AI-powered features
  - Supports multi-country real estate operations

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Staff (Owner, Admin, Property Advisor) can view all data
  - Clients can view public project data
  - Only staff can modify data

  ## Important Notes
  1. Uses PostGIS GEOMETRY type for polygon_coordinates
  2. Serial primary keys for compatibility with external data sources
  3. Comprehensive foreign key relationships ensure data integrity
  4. Timestamps automatically managed
  5. Indexes created on foreign keys and frequently queried columns
*/

-- Enable PostGIS extension for geometry support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  country_id SERIAL PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  iso_code VARCHAR(3),
  currency_code VARCHAR(10),
  primary_language VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  city_id SERIAL PRIMARY KEY,
  city_name VARCHAR(100) NOT NULL,
  country_id INT REFERENCES countries(country_id) ON DELETE CASCADE,
  population INT,
  timezone VARCHAR(50),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  community_id SERIAL PRIMARY KEY,
  city_id INT REFERENCES cities(city_id) ON DELETE CASCADE,
  community_name_english VARCHAR(255) NOT NULL,
  community_name_local VARCHAR(255),
  label_english VARCHAR(255),
  label_local VARCHAR(255),
  polygon_coordinates GEOMETRY,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create developers table
CREATE TABLE IF NOT EXISTS developers (
  developer_id SERIAL PRIMARY KEY,
  developer_name VARCHAR(255) NOT NULL UNIQUE,
  developer_name_arabic VARCHAR(255),
  contact_info TEXT,
  website VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  project_id SERIAL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  developer_id INT REFERENCES developers(developer_id) ON DELETE SET NULL,
  community_id INT REFERENCES communities(community_id) ON DELETE SET NULL,
  city_id INT REFERENCES cities(city_id) ON DELETE SET NULL,
  country_id INT REFERENCES countries(country_id) ON DELETE SET NULL,
  location_description TEXT,
  launch_date DATE,
  handover_date VARCHAR(50),
  handover_date_normalized DATE,
  project_phase TEXT,
  starting_price NUMERIC(15, 2),
  currency_code VARCHAR(10) DEFAULT 'AED',
  service_charge NUMERIC(10, 2),
  foreigners_allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unit_types table
CREATE TABLE IF NOT EXISTS unit_types (
  unit_type_id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  unit_category VARCHAR(100),
  bedrooms INT,
  bathrooms INT,
  built_up_area_min DECIMAL(10, 2),
  built_up_area_max DECIMAL(10, 2),
  built_up_area_unit VARCHAR(20) DEFAULT 'sqft',
  price_aed DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
  amenity_id SERIAL PRIMARY KEY,
  amenity_name VARCHAR(255) NOT NULL UNIQUE,
  amenity_category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_amenities junction table
CREATE TABLE IF NOT EXISTS project_amenities (
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  amenity_id INT REFERENCES amenities(amenity_id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, amenity_id)
);

-- Create payment_plans table
CREATE TABLE IF NOT EXISTS payment_plans (
  payment_plan_id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  plan_description TEXT,
  during_construction_percent DECIMAL(5, 2),
  on_handover_percent DECIMAL(5, 2),
  post_handover_percent DECIMAL(5, 2),
  installment_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create location_connectivity table
CREATE TABLE IF NOT EXISTS location_connectivity (
  connectivity_id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  landmark_name VARCHAR(255),
  landmark_type VARCHAR(100),
  distance_minutes INT,
  distance_km DECIMAL(10, 2),
  transportation_mode VARCHAR(50) DEFAULT 'car',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_images table
CREATE TABLE IF NOT EXISTS project_images (
  image_id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  image_type VARCHAR(50),
  caption TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_status_history table
CREATE TABLE IF NOT EXISTS project_status_history (
  history_id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  status VARCHAR(50),
  status_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_communities_city ON communities(city_id);
CREATE INDEX IF NOT EXISTS idx_projects_developer ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_community ON projects(community_id);
CREATE INDEX IF NOT EXISTS idx_projects_city ON projects(city_id);
CREATE INDEX IF NOT EXISTS idx_projects_country ON projects(country_id);
CREATE INDEX IF NOT EXISTS idx_unit_types_project ON unit_types(project_id);
CREATE INDEX IF NOT EXISTS idx_project_amenities_project ON project_amenities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_amenities_amenity ON project_amenities(amenity_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_project ON payment_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_location_connectivity_project ON location_connectivity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_status_history_project ON project_status_history(project_id);

-- Enable Row Level Security
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_connectivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for countries table (public read, staff write)
CREATE POLICY "Anyone can view countries"
  ON countries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage countries"
  ON countries FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- RLS Policies for cities table (public read, staff write)
CREATE POLICY "Anyone can view cities"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage cities"
  ON cities FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- RLS Policies for communities table (public read, staff write)
CREATE POLICY "Anyone can view communities"
  ON communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage communities"
  ON communities FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin'))
  );

-- RLS Policies for developers table (public read, staff write)
CREATE POLICY "Anyone can view developers"
  ON developers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage developers"
  ON developers FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for projects table (public read, staff write)
CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for unit_types table (public read, staff write)
CREATE POLICY "Anyone can view unit types"
  ON unit_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage unit types"
  ON unit_types FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for amenities table (public read, staff write)
CREATE POLICY "Anyone can view amenities"
  ON amenities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage amenities"
  ON amenities FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for project_amenities junction table
CREATE POLICY "Anyone can view project amenities"
  ON project_amenities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage project amenities"
  ON project_amenities FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for payment_plans table (public read, staff write)
CREATE POLICY "Anyone can view payment plans"
  ON payment_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage payment plans"
  ON payment_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for location_connectivity table (public read, staff write)
CREATE POLICY "Anyone can view location connectivity"
  ON location_connectivity FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage location connectivity"
  ON location_connectivity FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for project_images table (public read, staff write)
CREATE POLICY "Anyone can view project images"
  ON project_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage project images"
  ON project_images FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );

-- RLS Policies for project_status_history table (public read, staff write)
CREATE POLICY "Anyone can view project status history"
  ON project_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage project status history"
  ON project_status_history FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Owner', 'Admin', 'Property Advisor'))
  );