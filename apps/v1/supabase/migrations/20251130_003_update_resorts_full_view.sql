-- Migration: 20251130_003_update_resorts_full_view
-- Description: Update resorts_full view to include major city information
-- Epic: 19 - Distance from Major City Feature
-- Created: 2025-11-30

-- ============================================================================
-- DROP AND RECREATE RESORTS_FULL VIEW
-- Include major city name, distance, and drive time
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
-- UPDATE RESORTS_LIST VIEW
-- Include major city name and distance
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
-- UPDATE MAP_PINS VIEW (if it exists)
-- Include major city name and distance
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
