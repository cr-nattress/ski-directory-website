-- Migration: 004_fix_map_pins_country_code
-- Description: Add country_code to resorts_map_pins view for proper URL routing
-- Created: 2025-11-30
-- Issue: Canadian resorts were generating /us/ontario/... URLs instead of /ca/ontario/...

-- ============================================================================
-- UPDATE MAP PINS VIEW
-- Add country_code column to support multi-country URL routing
-- Must DROP and recreate since we're adding a new column
-- ============================================================================
DROP VIEW IF EXISTS resorts_map_pins;

CREATE VIEW resorts_map_pins AS
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
  r.country_code AS country_code,  -- Added: for URL routing (us, ca)
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
  -- Optional condition data for quick stats in popup
  (r.stats->>'terrainOpenPercent')::numeric AS terrain_open_percent,
  (r.stats->>'snowfall24h')::numeric AS snowfall_24h
FROM resorts r
WHERE r.is_active = true OR r.is_lost = true;

COMMENT ON VIEW resorts_map_pins IS 'Lightweight resort data optimized for map pin display. Includes country_code for proper URL routing.';
