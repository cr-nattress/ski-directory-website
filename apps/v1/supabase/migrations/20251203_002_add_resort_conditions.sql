-- Migration: 002_add_resort_conditions
-- Description: Create resort_conditions table for real-time Liftie data
-- Created: 2025-12-03

-- ============================================================================
-- CREATE RESORT_CONDITIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS resort_conditions (
  -- Primary key and foreign key
  resort_id TEXT PRIMARY KEY REFERENCES resorts(id) ON DELETE CASCADE,

  -- Lift status
  lifts_open INTEGER DEFAULT 0,
  lifts_total INTEGER DEFAULT 0,
  lifts_percentage NUMERIC(5,2) DEFAULT 0,

  -- Individual lift statuses (JSONB for flexibility)
  lifts_status JSONB DEFAULT '{}'::jsonb,

  -- Weather data
  weather_high INTEGER,  -- Fahrenheit
  weather_condition TEXT,  -- e.g., "Snow Showers"
  weather_text TEXT,  -- Full NOAA forecast
  weather_icon TEXT[] DEFAULT ARRAY[]::TEXT[],  -- Icon classes
  weather_date DATE,

  -- Webcams
  webcams JSONB DEFAULT '[]'::jsonb,  -- Array of {name, source, image}
  has_webcams BOOLEAN DEFAULT FALSE,

  -- Feature flags from Liftie
  has_lifts BOOLEAN DEFAULT FALSE,
  has_weather BOOLEAN DEFAULT FALSE,

  -- Source tracking
  liftie_id TEXT,  -- Original Liftie resort ID
  source_timestamp TIMESTAMPTZ,  -- When Liftie last updated

  -- Record timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_resort_conditions_updated_at ON resort_conditions(updated_at);
CREATE INDEX IF NOT EXISTS idx_resort_conditions_lifts_percentage ON resort_conditions(lifts_percentage);
CREATE INDEX IF NOT EXISTS idx_resort_conditions_has_webcams ON resort_conditions(has_webcams) WHERE has_webcams = TRUE;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE resort_conditions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access on resort_conditions"
  ON resort_conditions
  FOR SELECT
  TO public
  USING (true);

-- Service role full access (for updater)
CREATE POLICY "Allow service role full access on resort_conditions"
  ON resort_conditions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- UPDATE TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_resort_conditions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resort_conditions_timestamp
  BEFORE UPDATE ON resort_conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_resort_conditions_timestamp();

-- ============================================================================
-- CREATE VIEW: resorts_with_conditions
-- ============================================================================
CREATE OR REPLACE VIEW resorts_with_conditions AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.country_code,
  r.state_slug,
  r.is_active,
  r.is_lost,
  r.is_open,
  CASE WHEN r.location IS NOT NULL THEN
    ST_Y(r.location::geometry)
  END AS lat,
  CASE WHEN r.location IS NOT NULL THEN
    ST_X(r.location::geometry)
  END AS lng,
  r.asset_path,
  -- Conditions data
  rc.lifts_open,
  rc.lifts_total,
  rc.lifts_percentage,
  rc.weather_high,
  rc.weather_condition,
  rc.weather_text,
  rc.weather_icon,
  rc.has_webcams,
  rc.has_lifts,
  rc.has_weather,
  rc.updated_at AS conditions_updated_at,
  rc.source_timestamp AS liftie_timestamp
FROM resorts r
LEFT JOIN resort_conditions rc ON r.id = rc.resort_id
WHERE r.is_active = true;

COMMENT ON VIEW resorts_with_conditions IS 'Active resorts with real-time conditions from Liftie';

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE resort_conditions IS 'Real-time conditions data from Liftie.info';
COMMENT ON COLUMN resort_conditions.lifts_open IS 'Number of lifts currently open';
COMMENT ON COLUMN resort_conditions.lifts_total IS 'Total number of lifts at resort';
COMMENT ON COLUMN resort_conditions.lifts_percentage IS 'Percentage of lifts open (0-100)';
COMMENT ON COLUMN resort_conditions.lifts_status IS 'Individual lift status map: {liftName: status}';
COMMENT ON COLUMN resort_conditions.weather_high IS 'Forecasted high temperature in Fahrenheit';
COMMENT ON COLUMN resort_conditions.weather_condition IS 'Weather condition summary (e.g., Snow Showers)';
COMMENT ON COLUMN resort_conditions.weather_text IS 'Full NOAA forecast text';
COMMENT ON COLUMN resort_conditions.weather_icon IS 'Array of icon class names for weather display';
COMMENT ON COLUMN resort_conditions.webcams IS 'Array of webcam objects: [{name, source, image}]';
COMMENT ON COLUMN resort_conditions.source_timestamp IS 'Timestamp from Liftie data collection';
