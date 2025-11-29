-- Migration: 005_rls_policies
-- Description: Configure Row Level Security policies
-- Created: 2025-11-28

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PUBLIC READ ACCESS POLICIES
-- All tables are publicly readable (no auth required)
-- ============================================================================

-- Countries (reference table)
DROP POLICY IF EXISTS "Public read access" ON countries;
CREATE POLICY "Public read access" ON countries
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- States (reference table)
DROP POLICY IF EXISTS "Public read access" ON states;
CREATE POLICY "Public read access" ON states
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Pass Programs (reference table)
DROP POLICY IF EXISTS "Public read access" ON pass_programs;
CREATE POLICY "Public read access" ON pass_programs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Resorts (main table)
DROP POLICY IF EXISTS "Public read access" ON resorts;
CREATE POLICY "Public read access" ON resorts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Resort Passes (junction table)
DROP POLICY IF EXISTS "Public read access" ON resort_passes;
CREATE POLICY "Public read access" ON resort_passes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Resort Tags
DROP POLICY IF EXISTS "Public read access" ON resort_tags;
CREATE POLICY "Public read access" ON resort_tags
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- NOTES ON WRITE ACCESS
-- ============================================================================
-- Write operations (INSERT, UPDATE, DELETE) are handled via the service_role key,
-- which bypasses RLS. This is used by:
-- - Migration scripts
-- - Admin tools
-- - Server-side data updates
--
-- Future user features (favorites, reviews) would add user-specific policies here.
-- Example for a future users_favorites table:
--
-- CREATE POLICY "Users can manage own favorites" ON users_favorites
--   FOR ALL
--   TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);
