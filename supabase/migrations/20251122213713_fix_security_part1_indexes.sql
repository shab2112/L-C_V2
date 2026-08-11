/*
  # Fix Database Security - Part 1: Add Missing Indexes

  1. Performance Improvements
    - Add indexes for unindexed foreign keys
    - Improves query performance for joins and lookups

  2. Indexes Added
    - cities.timezone_id
    - content_posts.approved_by, created_by
    - developers.city_id
    - master_prompts.created_by
    - projects.payment_plan_id, unit_type_id
*/

CREATE INDEX IF NOT EXISTS idx_cities_timezone_id ON cities(timezone_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_approved_by ON content_posts(approved_by);
CREATE INDEX IF NOT EXISTS idx_content_posts_created_by ON content_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_developers_city_id ON developers(city_id);
CREATE INDEX IF NOT EXISTS idx_master_prompts_created_by ON master_prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_payment_plan_id ON projects(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_projects_unit_type_id ON projects(unit_type_id);