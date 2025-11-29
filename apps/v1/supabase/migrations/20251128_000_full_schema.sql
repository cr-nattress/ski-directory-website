-- ============================================================================
-- SKI RESORT DIRECTORY - FULL DATABASE SCHEMA
-- ============================================================================
-- Run this in the Supabase SQL Editor to set up the complete schema
-- URL: https://supabase.com/dashboard/project/pczgfwlaywxbvgvvtafo/sql
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 2. REFERENCE TABLES
-- ============================================================================

-- Countries
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY CHECK (code IN ('us', 'ca')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO countries (code, name) VALUES
  ('us', 'United States'),
  ('ca', 'Canada')
ON CONFLICT (code) DO NOTHING;

-- States/Provinces
CREATE TABLE IF NOT EXISTS states (
  slug TEXT PRIMARY KEY,
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  abbreviation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, slug)
);

CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_code);

-- Pass Programs
CREATE TABLE IF NOT EXISTS pass_programs (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pass_programs (slug, name, website_url, description) VALUES
  ('epic', 'Epic Pass', 'https://www.epicpass.com', 'Vail Resorts multi-resort season pass'),
  ('ikon', 'Ikon Pass', 'https://www.ikonpass.com', 'Alterra Mountain Company multi-resort pass'),
  ('indy', 'Indy Pass', 'https://www.indyskipass.com', 'Independent ski areas pass'),
  ('mountain-collective', 'Mountain Collective', 'https://www.mountaincollective.com', 'Coalition of independent destination resorts'),
  ('powder-alliance', 'Powder Alliance', 'https://www.powderalliance.com', 'Partnership of independent ski resorts')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  website_url = EXCLUDED.website_url,
  description = EXCLUDED.description;

-- ============================================================================
-- 3. MAIN RESORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS resorts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
  state_slug TEXT NOT NULL REFERENCES states(slug) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'defunct')) DEFAULT 'active',
  location GEOGRAPHY(POINT, 4326),
  nearest_city TEXT,
  website_url TEXT,
  description TEXT,
  stats JSONB DEFAULT '{}'::jsonb,
  terrain JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '{}'::jsonb,
  asset_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated columns
ALTER TABLE resorts ADD COLUMN IF NOT EXISTS is_active BOOLEAN
  GENERATED ALWAYS AS (status = 'active') STORED;
ALTER TABLE resorts ADD COLUMN IF NOT EXISTS is_lost BOOLEAN
  GENERATED ALWAYS AS (status = 'defunct') STORED;

-- Full-text search
ALTER TABLE resorts ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(nearest_city, '')), 'C')
  ) STORED;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resorts_slug ON resorts(slug);
CREATE INDEX IF NOT EXISTS idx_resorts_state ON resorts(state_slug);
CREATE INDEX IF NOT EXISTS idx_resorts_country ON resorts(country_code);
CREATE INDEX IF NOT EXISTS idx_resorts_status ON resorts(status);
CREATE INDEX IF NOT EXISTS idx_resorts_is_active ON resorts(is_active);
CREATE INDEX IF NOT EXISTS idx_resorts_location ON resorts USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_resorts_stats ON resorts USING GIN(stats);
CREATE INDEX IF NOT EXISTS idx_resorts_features ON resorts USING GIN(features);
CREATE INDEX IF NOT EXISTS idx_resorts_terrain ON resorts USING GIN(terrain);
CREATE INDEX IF NOT EXISTS idx_resorts_fts ON resorts USING GIN(fts);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resorts_updated_at ON resorts;
CREATE TRIGGER resorts_updated_at
  BEFORE UPDATE ON resorts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 4. JUNCTION TABLES
-- ============================================================================

-- Resort Passes
CREATE TABLE IF NOT EXISTS resort_passes (
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  pass_slug TEXT REFERENCES pass_programs(slug) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (resort_id, pass_slug)
);

CREATE INDEX IF NOT EXISTS idx_resort_passes_resort ON resort_passes(resort_id);
CREATE INDEX IF NOT EXISTS idx_resort_passes_pass ON resort_passes(pass_slug);

-- Resort Tags
CREATE TABLE IF NOT EXISTS resort_tags (
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (resort_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_resort_tags_resort ON resort_tags(resort_id);
CREATE INDEX IF NOT EXISTS idx_resort_tags_tag ON resort_tags(tag);

-- ============================================================================
-- 5. VIEWS
-- ============================================================================

-- Full resort view
CREATE OR REPLACE VIEW resorts_full AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.country_code AS country,
  c.name AS country_name,
  r.state_slug AS state,
  s.name AS state_name,
  r.status,
  r.is_active,
  r.is_lost,
  CASE WHEN r.location IS NOT NULL THEN ST_Y(r.location::geometry) END AS lat,
  CASE WHEN r.location IS NOT NULL THEN ST_X(r.location::geometry) END AS lng,
  r.nearest_city,
  r.stats,
  r.terrain,
  r.features,
  r.website_url,
  r.description,
  r.asset_path,
  r.created_at,
  r.updated_at,
  COALESCE(
    (SELECT array_agg(rp.pass_slug ORDER BY rp.pass_slug) FROM resort_passes rp WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations,
  COALESCE(
    (SELECT array_agg(rt.tag ORDER BY rt.tag) FROM resort_tags rt WHERE rt.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS tags
FROM resorts r
JOIN countries c ON r.country_code = c.code
JOIN states s ON r.state_slug = s.slug;

-- Resorts by state view
CREATE OR REPLACE VIEW resorts_by_state AS
SELECT
  s.slug AS state_slug,
  s.name AS state_name,
  s.country_code,
  c.name AS country_name,
  COUNT(r.id) AS resort_count,
  COUNT(r.id) FILTER (WHERE r.status = 'active') AS active_count,
  COUNT(r.id) FILTER (WHERE r.status = 'defunct') AS defunct_count
FROM states s
JOIN countries c ON s.country_code = c.code
LEFT JOIN resorts r ON s.slug = r.state_slug
GROUP BY s.slug, s.name, s.country_code, c.name
ORDER BY s.country_code, s.name;

-- Lightweight list view
CREATE OR REPLACE VIEW resorts_list AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.country_code AS country,
  r.state_slug AS state,
  s.name AS state_name,
  r.status,
  r.is_active,
  CASE WHEN r.location IS NOT NULL THEN ST_Y(r.location::geometry) END AS lat,
  CASE WHEN r.location IS NOT NULL THEN ST_X(r.location::geometry) END AS lng,
  r.nearest_city,
  r.stats->>'skiableAcres' AS skiable_acres,
  r.stats->>'verticalDrop' AS vertical_drop,
  r.stats->>'liftsCount' AS lifts_count,
  r.asset_path,
  COALESCE(
    (SELECT array_agg(rp.pass_slug) FROM resort_passes rp WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations
FROM resorts r
JOIN states s ON r.state_slug = s.slug;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_tags ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "Public read access" ON countries;
CREATE POLICY "Public read access" ON countries FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access" ON states;
CREATE POLICY "Public read access" ON states FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access" ON pass_programs;
CREATE POLICY "Public read access" ON pass_programs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access" ON resorts;
CREATE POLICY "Public read access" ON resorts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access" ON resort_passes;
CREATE POLICY "Public read access" ON resort_passes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access" ON resort_tags;
CREATE POLICY "Public read access" ON resort_tags FOR SELECT TO anon, authenticated USING (true);

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
SELECT 'Schema created successfully!' as status;
