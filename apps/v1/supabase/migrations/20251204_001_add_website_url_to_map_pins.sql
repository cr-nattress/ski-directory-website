-- Migration: Add website_url to resorts_map_pins view
-- Description: Include website_url in map pins for popup website links
-- Date: 2024-12-04

-- ============================================================================
-- RECREATE RESORTS_MAP_PINS VIEW WITH WEBSITE_URL
-- ============================================================================
DROP VIEW IF EXISTS resorts_map_pins CASCADE;

CREATE VIEW resorts_map_pins AS
SELECT
  r.id,
  r.slug,
  r.name,
  CASE WHEN r.location IS NOT NULL THEN
    ST_Y(r.location::geometry)
  END AS latitude,
  CASE WHEN r.location IS NOT NULL THEN
    ST_X(r.location::geometry)
  END AS longitude,
  r.nearest_city,
  r.country_code,
  r.state_slug AS state_code,
  COALESCE(
    (SELECT array_agg(rp.pass_slug ORDER BY rp.pass_slug)
     FROM resort_passes rp
     WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations,
  COALESCE((r.stats->>'rating')::numeric, 0) AS rating,
  r.status,
  r.is_active,
  r.is_lost,
  r.is_open,
  (r.stats->>'terrainOpenPercent')::numeric AS terrain_open_percent,
  (r.stats->>'snowfall24h')::numeric AS snowfall_24h,
  r.website_url
FROM resorts r
WHERE r.is_active = true OR r.is_lost = true;

COMMENT ON VIEW resorts_map_pins IS 'Lightweight resort data optimized for map pin display with website URL for popup links';
