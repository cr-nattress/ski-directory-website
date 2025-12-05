# Story 34.1: Create Supabase Database Schema

## Priority: High

## Phase: Setup

## Context

Before building the enricher application, we need to create the database tables to store ski shop data, resort associations, and enrichment logs.

## Requirements

1. Create `ski_shops` table for storing shop information
2. Create `resort_ski_shops` junction table for resort-shop relationships
3. Create `ski_shop_enrichment_logs` table for audit trail
4. Set up PostGIS geography column for distance queries
5. Create necessary indexes for performance

## Implementation

### Migration: `create_ski_shops_tables.sql`

```sql
-- ============================================================================
-- Table: ski_shops
-- ============================================================================

CREATE TABLE ski_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',

  -- Coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),

  -- Contact
  phone VARCHAR(50),
  website_url VARCHAR(500),
  email VARCHAR(255),

  -- Business details
  shop_type VARCHAR(50)[], -- ['rental', 'retail', 'repair', 'demo']
  services TEXT[],
  brands TEXT[],
  hours JSONB,

  -- Metadata
  source VARCHAR(50) DEFAULT 'openai',
  verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_enriched_at TIMESTAMPTZ
);

-- Trigger to update location from lat/lng
CREATE OR REPLACE FUNCTION update_ski_shop_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ski_shop_location_trigger
BEFORE INSERT OR UPDATE ON ski_shops
FOR EACH ROW EXECUTE FUNCTION update_ski_shop_location();

-- Indexes
CREATE INDEX idx_ski_shops_location ON ski_shops USING GIST(location);
CREATE INDEX idx_ski_shops_slug ON ski_shops(slug);
CREATE INDEX idx_ski_shops_state ON ski_shops(state);
CREATE INDEX idx_ski_shops_active ON ski_shops(is_active);
CREATE INDEX idx_ski_shops_city_state ON ski_shops(city, state);

-- ============================================================================
-- Table: resort_ski_shops
-- ============================================================================

CREATE TABLE resort_ski_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  ski_shop_id UUID NOT NULL REFERENCES ski_shops(id) ON DELETE CASCADE,

  -- Relationship metadata
  distance_miles DECIMAL(6, 2),
  drive_time_minutes INTEGER,
  is_on_mountain BOOLEAN DEFAULT FALSE,
  is_preferred BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(resort_id, ski_shop_id)
);

-- Indexes
CREATE INDEX idx_resort_ski_shops_resort ON resort_ski_shops(resort_id);
CREATE INDEX idx_resort_ski_shops_shop ON resort_ski_shops(ski_shop_id);
CREATE INDEX idx_resort_ski_shops_distance ON resort_ski_shops(distance_miles);

-- ============================================================================
-- Table: ski_shop_enrichment_logs
-- ============================================================================

CREATE TABLE ski_shop_enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID REFERENCES resorts(id),
  resort_name VARCHAR(255),

  -- Request details
  search_radius_miles INTEGER,
  search_lat DECIMAL(10, 8),
  search_lng DECIMAL(11, 8),

  -- Response details
  shops_found INTEGER DEFAULT 0,
  shops_created INTEGER DEFAULT 0,
  shops_updated INTEGER DEFAULT 0,
  shops_linked INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50),
  error_message TEXT,

  -- OpenAI details
  model_used VARCHAR(50),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_cost DECIMAL(10, 6),

  -- Raw data
  raw_response JSONB,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

CREATE INDEX idx_enrichment_logs_resort ON ski_shop_enrichment_logs(resort_id);
CREATE INDEX idx_enrichment_logs_status ON ski_shop_enrichment_logs(status);
CREATE INDEX idx_enrichment_logs_date ON ski_shop_enrichment_logs(started_at);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE ski_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_ski_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE ski_shop_enrichment_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for ski_shops
CREATE POLICY "Public can read active ski shops"
  ON ski_shops FOR SELECT
  USING (is_active = true);

-- Public read access for resort_ski_shops
CREATE POLICY "Public can read resort ski shop links"
  ON resort_ski_shops FOR SELECT
  USING (true);

-- Service role has full access (for enricher)
CREATE POLICY "Service role has full access to ski_shops"
  ON ski_shops FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to resort_ski_shops"
  ON resort_ski_shops FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to enrichment_logs"
  ON ski_shop_enrichment_logs FOR ALL
  USING (auth.role() = 'service_role');
```

## Acceptance Criteria

- [ ] `ski_shops` table created with all columns
- [ ] `resort_ski_shops` junction table created
- [ ] `ski_shop_enrichment_logs` table created
- [ ] PostGIS trigger updates `location` from lat/lng
- [ ] All indexes created for query performance
- [ ] RLS policies allow public read, service role write
- [ ] Foreign key constraints properly set

## Testing

1. Insert a test ski shop and verify location is populated
2. Link test shop to a resort
3. Query shops within distance using PostGIS
4. Verify RLS policies work correctly

## Effort: Medium (1-2 hours)
