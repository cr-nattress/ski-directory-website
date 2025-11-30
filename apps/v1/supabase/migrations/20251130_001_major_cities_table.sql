-- Migration: 20251130_001_major_cities_table
-- Description: Create major_cities reference table for distance calculations
-- Epic: 19 - Distance from Major City Feature
-- Created: 2025-11-30

-- ============================================================================
-- MAJOR CITIES TABLE
-- Each state has a designated major city for distance calculations
-- ============================================================================
CREATE TABLE IF NOT EXISTS major_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  state_slug TEXT NOT NULL REFERENCES states(slug) ON DELETE RESTRICT,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(10,6) NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  region TEXT, -- For states with regional splits (e.g., 'norcal', 'socal')
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one primary city per state
CREATE UNIQUE INDEX IF NOT EXISTS idx_major_cities_primary
  ON major_cities(state_slug) WHERE is_primary = true;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_major_cities_state ON major_cities(state_slug);

COMMENT ON TABLE major_cities IS 'Major cities for distance calculations - each state has a designated city';
COMMENT ON COLUMN major_cities.city_name IS 'City name (e.g., Denver, Salt Lake City)';
COMMENT ON COLUMN major_cities.state_slug IS 'Reference to states table';
COMMENT ON COLUMN major_cities.latitude IS 'City latitude for distance calculation';
COMMENT ON COLUMN major_cities.longitude IS 'City longitude for distance calculation';
COMMENT ON COLUMN major_cities.is_primary IS 'True if this is the default city for the state';
COMMENT ON COLUMN major_cities.region IS 'Optional region identifier for states with multiple cities';

-- ============================================================================
-- SEED MAJOR CITIES DATA
-- Initial list of major cities for ski states
-- ============================================================================
INSERT INTO major_cities (city_name, state_slug, latitude, longitude, is_primary, region) VALUES
  -- United States
  ('Denver', 'colorado', 39.7392, -104.9903, true, NULL),
  ('Salt Lake City', 'utah', 40.7608, -111.8910, true, NULL),
  ('Los Angeles', 'california', 34.0522, -118.2437, true, 'socal'),
  ('San Francisco', 'california', 37.7749, -122.4194, false, 'norcal'),
  ('Burlington', 'vermont', 44.4759, -73.2121, true, NULL),
  ('Boston', 'new-hampshire', 42.3601, -71.0589, true, NULL), -- NH uses Boston as primary market
  ('Missoula', 'montana', 46.8721, -113.9940, true, 'western'),
  ('Bozeman', 'montana', 45.6770, -111.0429, false, 'southwestern'),
  ('Denver', 'wyoming', 39.7392, -104.9903, true, NULL), -- WY uses Denver (closest major airport)
  ('Boise', 'idaho', 43.6150, -116.2023, true, NULL),
  ('Seattle', 'washington', 47.6062, -122.3321, true, NULL),
  ('Portland', 'oregon', 45.5152, -122.6784, true, NULL),
  ('New York City', 'new-york', 40.7128, -74.0060, true, NULL),
  ('Detroit', 'michigan', 42.3314, -83.0458, true, NULL),
  ('Albuquerque', 'new-mexico', 35.0844, -106.6504, true, NULL),
  ('Reno', 'nevada', 39.5296, -119.8138, true, NULL),
  ('Phoenix', 'arizona', 33.4484, -112.0740, true, NULL),
  ('Minneapolis', 'minnesota', 44.9778, -93.2650, true, NULL),
  ('Milwaukee', 'wisconsin', 43.0389, -87.9065, true, NULL),
  ('Anchorage', 'alaska', 61.2181, -149.9003, true, NULL),
  ('Portland', 'maine', 43.6591, -70.2568, true, NULL),
  ('Hartford', 'connecticut', 41.7658, -72.6734, true, NULL),
  ('Albany', 'new-york', 42.6526, -73.7562, false, 'upstate'),

  -- Canada
  ('Vancouver', 'british-columbia', 49.2827, -123.1207, true, NULL),
  ('Calgary', 'alberta', 51.0447, -114.0719, true, NULL),
  ('Montreal', 'quebec', 45.5017, -73.5673, true, NULL),
  ('Toronto', 'ontario', 43.6532, -79.3832, true, NULL)
ON CONFLICT DO NOTHING;
