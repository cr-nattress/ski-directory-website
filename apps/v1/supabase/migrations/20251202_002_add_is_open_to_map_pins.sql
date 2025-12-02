-- Migration: 002_add_is_open_to_map_pins
-- Description: Add is_open column to map pins view for seasonal status
-- Created: 2025-12-02

-- ============================================================================
-- UPDATE MAP PINS VIEW to include is_open
-- ============================================================================
CREATE OR REPLACE VIEW resorts_map_pins AS
SELECT
  r.id,
  r.slug,
  r.name,
  -- Extract lat/lng from geography point
  CASE WHEN r.location IS NOT NULL THEN
    ST_Y(r.location::geometry)
  END AS latitude,
  CASE WHEN r.location IS NOT NULL THEN
    ST_X(r.location::geometry)
  END AS longitude,
  r.nearest_city,
  r.country_code,
  r.state_slug AS state_code,
  -- Aggregate pass affiliations as array
  COALESCE(
    (SELECT array_agg(rp.pass_slug ORDER BY rp.pass_slug)
     FROM resort_passes rp
     WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations,
  -- Extract rating from stats JSONB
  COALESCE((r.stats->>'rating')::numeric, 0) AS rating,
  r.status,
  r.is_active,
  r.is_lost,
  r.is_open,
  -- Optional condition data for quick stats in popup
  (r.stats->>'terrainOpenPercent')::numeric AS terrain_open_percent,
  (r.stats->>'snowfall24h')::numeric AS snowfall_24h
FROM resorts r
WHERE r.is_active = true OR r.is_lost = true;

COMMENT ON VIEW resorts_map_pins IS 'Lightweight resort data optimized for map pin display with seasonal open status';
