-- Migration: 002_resorts_table
-- Description: Create main resorts table with PostGIS support
-- Created: 2025-11-28

-- ============================================================================
-- ENABLE POSTGIS EXTENSION
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- RESORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS resorts (
  -- Primary identifiers
  id TEXT PRIMARY KEY,                    -- Format: resort:{slug}
  slug TEXT UNIQUE NOT NULL,              -- URL-friendly identifier
  name TEXT NOT NULL,                     -- Official resort name

  -- Location references
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
  state_slug TEXT NOT NULL REFERENCES states(slug) ON DELETE RESTRICT,

  -- Status
  status TEXT NOT NULL CHECK (status IN ('active', 'defunct')) DEFAULT 'active',

  -- Geographic location (PostGIS geography for accurate distance calculations)
  location GEOGRAPHY(POINT, 4326),
  nearest_city TEXT,

  -- URLs and content
  website_url TEXT,
  description TEXT,

  -- Complex nested data as JSONB (flexible, queryable)
  stats JSONB DEFAULT '{}'::jsonb,        -- skiableAcres, liftsCount, runsCount, etc.
  terrain JSONB DEFAULT '{}'::jsonb,      -- beginner, intermediate, advanced, expert %
  features JSONB DEFAULT '{}'::jsonb,     -- hasPark, hasHalfpipe, hasNightSkiing, etc.

  -- Asset path for constructing GCS URLs
  -- Format: {country}/{state}/{slug} e.g., "us/colorado/vail"
  asset_path TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GENERATED COLUMNS
-- ============================================================================
-- These are computed from status and stored for efficient querying
ALTER TABLE resorts ADD COLUMN IF NOT EXISTS is_active BOOLEAN
  GENERATED ALWAYS AS (status = 'active') STORED;
ALTER TABLE resorts ADD COLUMN IF NOT EXISTS is_lost BOOLEAN
  GENERATED ALWAYS AS (status = 'defunct') STORED;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_resorts_slug ON resorts(slug);
CREATE INDEX IF NOT EXISTS idx_resorts_state ON resorts(state_slug);
CREATE INDEX IF NOT EXISTS idx_resorts_country ON resorts(country_code);
CREATE INDEX IF NOT EXISTS idx_resorts_status ON resorts(status);
CREATE INDEX IF NOT EXISTS idx_resorts_is_active ON resorts(is_active);

-- Spatial index for geographic queries (find nearby resorts)
CREATE INDEX IF NOT EXISTS idx_resorts_location ON resorts USING GIST(location);

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_resorts_stats ON resorts USING GIN(stats);
CREATE INDEX IF NOT EXISTS idx_resorts_features ON resorts USING GIN(features);
CREATE INDEX IF NOT EXISTS idx_resorts_terrain ON resorts USING GIN(terrain);

-- ============================================================================
-- FULL-TEXT SEARCH
-- ============================================================================
-- Add full-text search vector column
ALTER TABLE resorts ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(nearest_city, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_resorts_fts ON resorts USING GIN(fts);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
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
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE resorts IS 'Main table for ski resorts across US and Canada';
COMMENT ON COLUMN resorts.id IS 'Unique identifier in format resort:{slug}';
COMMENT ON COLUMN resorts.slug IS 'URL-friendly identifier (lowercase, hyphens)';
COMMENT ON COLUMN resorts.location IS 'PostGIS geography point (SRID 4326)';
COMMENT ON COLUMN resorts.stats IS 'JSONB: skiableAcres, liftsCount, runsCount, verticalDrop, baseElevation, summitElevation, avgAnnualSnowfall';
COMMENT ON COLUMN resorts.terrain IS 'JSONB: beginner, intermediate, advanced, expert (percentages)';
COMMENT ON COLUMN resorts.features IS 'JSONB: hasPark, hasHalfpipe, hasNightSkiing, hasBackcountryAccess, hasSpaVillage';
COMMENT ON COLUMN resorts.asset_path IS 'Path for GCS assets: {country}/{state}/{slug}';
COMMENT ON COLUMN resorts.fts IS 'Full-text search vector for name, description, nearest_city';
