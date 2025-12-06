-- Epic 37: Restaurants & Bars Directory
-- Story 37.1: Database Schema and Migrations
-- This migration creates the dining venues tables for storing restaurant and bar data

-- Create dining_venues table
CREATE TABLE IF NOT EXISTS dining_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,

  -- Location
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'USA',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  -- Contact
  phone VARCHAR(20),
  website_url VARCHAR(500),

  -- Classification (JSONB arrays for flexibility)
  venue_type JSONB DEFAULT '[]',  -- restaurant, bar, brewery, cafe, food_truck, lodge_dining
  cuisine_type JSONB DEFAULT '[]',  -- american, italian, mexican, asian, etc.

  -- Dining Features
  price_range VARCHAR(4),  -- $, $$, $$$, $$$$
  serves_breakfast BOOLEAN DEFAULT false,
  serves_lunch BOOLEAN DEFAULT false,
  serves_dinner BOOLEAN DEFAULT false,
  serves_drinks BOOLEAN DEFAULT false,
  has_full_bar BOOLEAN DEFAULT false,

  -- Atmosphere
  ambiance JSONB DEFAULT '[]',  -- casual, upscale, family_friendly, apres_ski, fine_dining
  features JSONB DEFAULT '[]',  -- outdoor_seating, fireplace, live_music, sports_tv, reservations_required, etc.

  -- Ski-specific
  is_on_mountain BOOLEAN DEFAULT false,
  mountain_location VARCHAR(50),  -- base, mid_mountain, summit, village
  is_ski_in_ski_out BOOLEAN DEFAULT false,

  -- Hours
  hours_notes TEXT,

  -- Meta
  source VARCHAR(50) DEFAULT 'openai',
  verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create resort_dining_venues junction table
CREATE TABLE IF NOT EXISTS resort_dining_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id TEXT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  dining_venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  distance_miles DECIMAL(5, 2),
  drive_time_minutes INTEGER,
  is_on_mountain BOOLEAN DEFAULT false,
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(resort_id, dining_venue_id)
);

-- Create dining_enrichment_logs table for audit trail
CREATE TABLE IF NOT EXISTS dining_enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id TEXT REFERENCES resorts(id),
  resort_name VARCHAR(255),
  search_radius_miles DECIMAL(5, 2),
  search_lat DECIMAL(10, 7),
  search_lng DECIMAL(10, 7),
  venues_found INTEGER DEFAULT 0,
  venues_created INTEGER DEFAULT 0,
  venues_updated INTEGER DEFAULT 0,
  venues_linked INTEGER DEFAULT 0,
  status VARCHAR(50),
  error_message TEXT,
  model_used VARCHAR(50),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_cost DECIMAL(10, 6),
  raw_response JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dining_venues_slug ON dining_venues(slug);
CREATE INDEX IF NOT EXISTS idx_dining_venues_city ON dining_venues(city);
CREATE INDEX IF NOT EXISTS idx_dining_venues_state ON dining_venues(state);
CREATE INDEX IF NOT EXISTS idx_dining_venues_coords ON dining_venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_dining_venues_active ON dining_venues(is_active);
CREATE INDEX IF NOT EXISTS idx_dining_venues_venue_type ON dining_venues USING gin(venue_type);
CREATE INDEX IF NOT EXISTS idx_dining_venues_cuisine_type ON dining_venues USING gin(cuisine_type);

CREATE INDEX IF NOT EXISTS idx_resort_dining_venues_resort ON resort_dining_venues(resort_id);
CREATE INDEX IF NOT EXISTS idx_resort_dining_venues_venue ON resort_dining_venues(dining_venue_id);
CREATE INDEX IF NOT EXISTS idx_resort_dining_venues_distance ON resort_dining_venues(distance_miles);

CREATE INDEX IF NOT EXISTS idx_dining_enrichment_logs_resort ON dining_enrichment_logs(resort_id);
CREATE INDEX IF NOT EXISTS idx_dining_enrichment_logs_status ON dining_enrichment_logs(status);
CREATE INDEX IF NOT EXISTS idx_dining_enrichment_logs_created ON dining_enrichment_logs(created_at);

-- Enable Row Level Security
ALTER TABLE dining_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_dining_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_enrichment_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access on dining_venues"
  ON dining_venues FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow public read access on resort_dining_venues"
  ON resort_dining_venues FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access on dining_venues"
  ON dining_venues FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on resort_dining_venues"
  ON resort_dining_venues FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on dining_enrichment_logs"
  ON dining_enrichment_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create a view for optimized API queries
CREATE OR REPLACE VIEW resort_dining_venues_full AS
SELECT
  rdv.id,
  rdv.resort_id,
  r.slug AS resort_slug,
  rdv.dining_venue_id,
  rdv.distance_miles,
  rdv.drive_time_minutes,
  rdv.is_on_mountain,
  rdv.is_preferred,
  dv.name,
  dv.slug,
  dv.description,
  dv.address_line1,
  dv.city,
  dv.state,
  dv.postal_code,
  dv.latitude,
  dv.longitude,
  dv.phone,
  dv.website_url,
  dv.venue_type,
  dv.cuisine_type,
  dv.price_range,
  dv.serves_breakfast,
  dv.serves_lunch,
  dv.serves_dinner,
  dv.serves_drinks,
  dv.has_full_bar,
  dv.ambiance,
  dv.features,
  dv.mountain_location,
  dv.is_ski_in_ski_out,
  dv.hours_notes,
  dv.verified
FROM resort_dining_venues rdv
JOIN dining_venues dv ON rdv.dining_venue_id = dv.id
JOIN resorts r ON rdv.resort_id = r.id
WHERE dv.is_active = true;

-- Grant access to the view
GRANT SELECT ON resort_dining_venues_full TO anon;
GRANT SELECT ON resort_dining_venues_full TO authenticated;
