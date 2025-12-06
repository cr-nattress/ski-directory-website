# Story 37.1: Database Schema and Migrations

## Description

Create Supabase database tables for dining venues, including the main venues table, resort-venue junction table, and enrichment logs.

## Acceptance Criteria

- [ ] `dining_venues` table created with all required columns
- [ ] `resort_dining_venues` junction table for M:M relationships
- [ ] `dining_enrichment_logs` table for audit trail
- [ ] `resort_dining_venues_full` view for optimized API queries
- [ ] Proper indexes on slug, resort_id, coordinates
- [ ] RLS policies configured for public read access

## Technical Details

### dining_venues table
```sql
CREATE TABLE dining_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,

  -- Location
  address_line1 VARCHAR(255),
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
  venue_type JSONB DEFAULT '[]',  -- restaurant, bar, brewery, cafe, etc.
  cuisine_type JSONB DEFAULT '[]',  -- american, italian, mexican, etc.

  -- Dining Features
  price_range VARCHAR(4),  -- $, $$, $$$, $$$$
  serves_breakfast BOOLEAN DEFAULT false,
  serves_lunch BOOLEAN DEFAULT false,
  serves_dinner BOOLEAN DEFAULT false,
  serves_drinks BOOLEAN DEFAULT false,
  has_full_bar BOOLEAN DEFAULT false,

  -- Atmosphere
  ambiance JSONB DEFAULT '[]',  -- casual, upscale, apres_ski, etc.
  features JSONB DEFAULT '[]',  -- outdoor_seating, live_music, etc.

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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### resort_dining_venues junction table
```sql
CREATE TABLE resort_dining_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID REFERENCES resorts(id) ON DELETE CASCADE,
  dining_venue_id UUID REFERENCES dining_venues(id) ON DELETE CASCADE,
  distance_miles DECIMAL(5, 2),
  drive_time_minutes INTEGER,
  is_on_mountain BOOLEAN DEFAULT false,
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(resort_id, dining_venue_id)
);
```

### dining_enrichment_logs table
```sql
CREATE TABLE dining_enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID REFERENCES resorts(id),
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
```

## Migration File Location

`apps/updaters/dining-enricher/supabase/migrations/001_create_dining_tables.sql`

## Effort

Medium (2-3 hours)
