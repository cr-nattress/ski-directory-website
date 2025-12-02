-- Migration: 003_add_is_open_to_views
-- Description: Add is_open column to all resort views for seasonal status
-- Created: 2025-12-02

-- ============================================================================
-- UPDATE RESORTS_FULL VIEW to include is_open
-- ============================================================================
CREATE OR REPLACE VIEW resorts_full AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.country_code AS country,
  c.name AS country_name,
  r.state_slug AS state,
  s.name AS state_name,
  r.status,
  r.is_active,
  r.is_lost,
  r.is_open,
  -- Extract lat/lng from geography point
  CASE WHEN r.location IS NOT NULL THEN
    ST_Y(r.location::geometry)
  END AS lat,
  CASE WHEN r.location IS NOT NULL THEN
    ST_X(r.location::geometry)
  END AS lng,
  r.nearest_city,
  r.stats,
  r.terrain,
  r.features,
  r.website_url,
  r.description,
  r.asset_path,
  r.created_at,
  r.updated_at,
  -- Major city information
  mc.city_name AS major_city_name,
  r.distance_from_major_city,
  r.drive_time_to_major_city,
  -- Aggregate pass affiliations as array
  COALESCE(
    (SELECT array_agg(rp.pass_slug ORDER BY rp.pass_slug)
     FROM resort_passes rp
     WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations,
  -- Aggregate tags as array
  COALESCE(
    (SELECT array_agg(rt.tag ORDER BY rt.tag)
     FROM resort_tags rt
     WHERE rt.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS tags
FROM resorts r
JOIN countries c ON r.country_code = c.code
JOIN states s ON r.state_slug = s.slug
LEFT JOIN major_cities mc ON r.major_city_id = mc.id;

COMMENT ON VIEW resorts_full IS 'Complete resort data with joined country/state/major city names and aggregated passes/tags';

-- ============================================================================
-- UPDATE RESORTS_LIST VIEW to include is_open
-- ============================================================================
CREATE OR REPLACE VIEW resorts_list AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.country_code AS country,
  r.state_slug AS state,
  s.name AS state_name,
  r.status,
  r.is_active,
  r.is_open,
  CASE WHEN r.location IS NOT NULL THEN
    ST_Y(r.location::geometry)
  END AS lat,
  CASE WHEN r.location IS NOT NULL THEN
    ST_X(r.location::geometry)
  END AS lng,
  r.nearest_city,
  r.stats->>'skiableAcres' AS skiable_acres,
  r.stats->>'verticalDrop' AS vertical_drop,
  r.stats->>'liftsCount' AS lifts_count,
  r.asset_path,
  -- Major city information
  mc.city_name AS major_city_name,
  r.distance_from_major_city,
  r.drive_time_to_major_city,
  COALESCE(
    (SELECT array_agg(rp.pass_slug)
     FROM resort_passes rp
     WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations
FROM resorts r
JOIN states s ON r.state_slug = s.slug
LEFT JOIN major_cities mc ON r.major_city_id = mc.id;

COMMENT ON VIEW resorts_list IS 'Lightweight resort data for listings and cards';

-- ============================================================================
-- UPDATE RESORTS_MAP_PINS VIEW to include is_open
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

-- ============================================================================
-- UPDATE RESORT_MAP_PINS VIEW (alternate name) to include is_open
-- ============================================================================
CREATE OR REPLACE VIEW resort_map_pins AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.state_slug AS state_code,
  CASE WHEN r.location IS NOT NULL THEN
    ST_Y(r.location::geometry)
  END AS latitude,
  CASE WHEN r.location IS NOT NULL THEN
    ST_X(r.location::geometry)
  END AS longitude,
  r.nearest_city,
  r.is_active,
  r.is_lost,
  r.is_open,
  -- Major city information
  mc.city_name AS major_city_name,
  r.distance_from_major_city,
  -- Pass affiliations
  COALESCE(
    (SELECT array_agg(rp.pass_slug)
     FROM resort_passes rp
     WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations
FROM resorts r
LEFT JOIN major_cities mc ON r.major_city_id = mc.id
WHERE r.location IS NOT NULL;

COMMENT ON VIEW resort_map_pins IS 'Lightweight resort data optimized for map pin display';
