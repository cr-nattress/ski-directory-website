-- Migration: 001_reference_tables
-- Description: Create reference tables for countries, states, and pass programs
-- Created: 2025-11-28

-- ============================================================================
-- COUNTRIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY CHECK (code IN ('us', 'ca')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE countries IS 'Reference table for supported countries';
COMMENT ON COLUMN countries.code IS 'Two-letter country code (lowercase)';
COMMENT ON COLUMN countries.name IS 'Full country name';

-- Seed countries
INSERT INTO countries (code, name) VALUES
  ('us', 'United States'),
  ('ca', 'Canada')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- STATES/PROVINCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS states (
  slug TEXT PRIMARY KEY,
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  abbreviation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, slug)
);

CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_code);

COMMENT ON TABLE states IS 'US states and Canadian provinces';
COMMENT ON COLUMN states.slug IS 'URL-friendly identifier (lowercase, hyphens)';
COMMENT ON COLUMN states.country_code IS 'Reference to countries table';
COMMENT ON COLUMN states.name IS 'Full state/province name';
COMMENT ON COLUMN states.abbreviation IS 'Two-letter abbreviation (e.g., CO, BC)';

-- ============================================================================
-- PASS PROGRAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pass_programs (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pass_programs IS 'Ski pass programs (Epic, Ikon, etc.)';
COMMENT ON COLUMN pass_programs.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN pass_programs.name IS 'Official pass name';
COMMENT ON COLUMN pass_programs.website_url IS 'Official pass website';

-- Seed pass programs
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
