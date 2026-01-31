-- Migration: 001_add_detailed_weather
-- Description: Add detailed weather fields to resort_conditions for Open-Meteo data
-- Created: 2026-01-31

-- ============================================================================
-- ADD DETAILED WEATHER COLUMNS
-- ============================================================================

-- Current conditions (enhanced)
ALTER TABLE resort_conditions 
  ADD COLUMN IF NOT EXISTS current_temp NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS current_feels_like NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS current_humidity INTEGER,
  ADD COLUMN IF NOT EXISTS current_wind_speed NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS current_wind_gust NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS current_wind_direction INTEGER,
  ADD COLUMN IF NOT EXISTS current_precipitation NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS current_snowfall NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS current_weather_code INTEGER,
  ADD COLUMN IF NOT EXISTS current_visibility NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS is_day BOOLEAN DEFAULT TRUE;

-- Today's forecast
ALTER TABLE resort_conditions 
  ADD COLUMN IF NOT EXISTS today_high NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS today_low NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS today_precip_chance INTEGER,
  ADD COLUMN IF NOT EXISTS today_snowfall NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS today_weather_code INTEGER,
  ADD COLUMN IF NOT EXISTS sunrise TIME,
  ADD COLUMN IF NOT EXISTS sunset TIME,
  ADD COLUMN IF NOT EXISTS uv_index NUMERIC(3,1);

-- Snowfall predictions (critical for ski resorts!)
ALTER TABLE resort_conditions 
  ADD COLUMN IF NOT EXISTS snow_next_24h NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS snow_next_48h NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS snow_next_72h NUMERIC(5,2);

-- Extended forecasts (JSONB for flexibility)
ALTER TABLE resort_conditions 
  ADD COLUMN IF NOT EXISTS daily_forecast JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hourly_forecast JSONB DEFAULT '[]'::jsonb;

-- Weather metadata
ALTER TABLE resort_conditions 
  ADD COLUMN IF NOT EXISTS elevation_used INTEGER,
  ADD COLUMN IF NOT EXISTS weather_fetched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS weather_source TEXT DEFAULT 'open-meteo';

-- ============================================================================
-- INDEXES FOR WEATHER QUERIES
-- ============================================================================

-- Index for "powder alert" queries
CREATE INDEX IF NOT EXISTS idx_resort_conditions_snow_24h 
  ON resort_conditions(snow_next_24h DESC NULLS LAST);

-- Index for temperature queries
CREATE INDEX IF NOT EXISTS idx_resort_conditions_current_temp 
  ON resort_conditions(current_temp);

-- ============================================================================
-- UPDATE VIEW: resorts_with_conditions
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
  -- Lift status
  rc.lifts_open,
  rc.lifts_total,
  rc.lifts_percentage,
  rc.has_lifts,
  -- Current weather
  rc.current_temp,
  rc.current_feels_like,
  rc.current_wind_speed,
  rc.current_weather_code,
  rc.is_day,
  -- Snowfall predictions
  rc.snow_next_24h,
  rc.snow_next_48h,
  rc.snow_next_72h,
  -- Today's forecast
  rc.today_high,
  rc.today_low,
  rc.today_precip_chance,
  rc.today_snowfall,
  -- Legacy weather fields
  rc.weather_high,
  rc.weather_condition,
  rc.weather_text,
  rc.weather_icon,
  -- Webcams
  rc.has_webcams,
  rc.has_weather,
  -- Timestamps
  rc.updated_at AS conditions_updated_at,
  rc.weather_fetched_at,
  rc.source_timestamp AS liftie_timestamp
FROM resorts r
LEFT JOIN resort_conditions rc ON r.id = rc.resort_id
WHERE r.is_active = true;

COMMENT ON VIEW resorts_with_conditions IS 'Active resorts with real-time conditions from Liftie and Open-Meteo weather';

-- ============================================================================
-- CREATE VIEW: powder_alerts
-- Resorts expecting significant snow in next 24-72 hours
-- ============================================================================
CREATE OR REPLACE VIEW powder_alerts AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.country_code,
  r.state_slug,
  r.asset_path,
  rc.snow_next_24h,
  rc.snow_next_48h,
  rc.snow_next_72h,
  rc.current_temp,
  rc.today_high,
  rc.today_low,
  rc.weather_fetched_at,
  -- Powder rating based on snowfall
  CASE
    WHEN rc.snow_next_24h >= 12 THEN 'EPIC'
    WHEN rc.snow_next_24h >= 6 THEN 'POWDER DAY'
    WHEN rc.snow_next_24h >= 3 THEN 'FRESH SNOW'
    WHEN rc.snow_next_24h >= 1 THEN 'LIGHT SNOW'
    ELSE 'DRY'
  END AS powder_rating
FROM resorts r
JOIN resort_conditions rc ON r.id = rc.resort_id
WHERE r.is_active = true
  AND rc.snow_next_24h IS NOT NULL
  AND rc.snow_next_24h > 0
ORDER BY rc.snow_next_24h DESC;

COMMENT ON VIEW powder_alerts IS 'Resorts with upcoming snowfall, ranked by expected amount';

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN resort_conditions.current_temp IS 'Current temperature in Fahrenheit';
COMMENT ON COLUMN resort_conditions.current_feels_like IS 'Feels-like temperature in Fahrenheit';
COMMENT ON COLUMN resort_conditions.current_wind_speed IS 'Current wind speed in mph';
COMMENT ON COLUMN resort_conditions.current_wind_gust IS 'Current wind gust in mph';
COMMENT ON COLUMN resort_conditions.current_wind_direction IS 'Wind direction in degrees (0-360)';
COMMENT ON COLUMN resort_conditions.snow_next_24h IS 'Predicted snowfall in next 24 hours (inches)';
COMMENT ON COLUMN resort_conditions.snow_next_48h IS 'Predicted snowfall in next 48 hours (inches)';
COMMENT ON COLUMN resort_conditions.snow_next_72h IS 'Predicted snowfall in next 72 hours (inches)';
COMMENT ON COLUMN resort_conditions.daily_forecast IS '7-day forecast: [{date, high, low, weather_code, precip_chance, snowfall}]';
COMMENT ON COLUMN resort_conditions.hourly_forecast IS '24-hour forecast: [{time, temp, weather_code, precip_chance, snowfall}]';
COMMENT ON COLUMN resort_conditions.weather_source IS 'Weather data provider (open-meteo, liftie, etc)';
