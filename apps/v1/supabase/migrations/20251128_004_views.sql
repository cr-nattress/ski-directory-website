-- Migration: 004_views
-- Description: Create database views for convenient data access
-- Created: 2025-11-28

-- ============================================================================
-- FULL RESORT VIEW
-- Matches the original JSON schema structure for easy migration
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
JOIN states s ON r.state_slug = s.slug;

COMMENT ON VIEW resorts_full IS 'Complete resort data with joined country/state names and aggregated passes/tags';

-- ============================================================================
-- RESORTS BY STATE VIEW
-- Aggregated statistics per state
-- ============================================================================
CREATE OR REPLACE VIEW resorts_by_state AS
SELECT
  s.slug AS state_slug,
  s.name AS state_name,
  s.country_code,
  c.name AS country_name,
  COUNT(r.id) AS resort_count,
  COUNT(r.id) FILTER (WHERE r.status = 'active') AS active_count,
  COUNT(r.id) FILTER (WHERE r.status = 'defunct') AS defunct_count,
  -- Aggregate stats
  SUM((r.stats->>'skiableAcres')::numeric) FILTER (WHERE r.status = 'active') AS total_skiable_acres,
  SUM((r.stats->>'liftsCount')::integer) FILTER (WHERE r.status = 'active') AS total_lifts,
  AVG((r.stats->>'verticalDrop')::numeric) FILTER (WHERE r.status = 'active') AS avg_vertical_drop
FROM states s
JOIN countries c ON s.country_code = c.code
LEFT JOIN resorts r ON s.slug = r.state_slug
GROUP BY s.slug, s.name, s.country_code, c.name
ORDER BY s.country_code, s.name;

COMMENT ON VIEW resorts_by_state IS 'Resort counts and statistics aggregated by state/province';

-- ============================================================================
-- RESORTS LIST VIEW
-- Lightweight view for listings (no description or full details)
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
  COALESCE(
    (SELECT array_agg(rp.pass_slug)
     FROM resort_passes rp
     WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations
FROM resorts r
JOIN states s ON r.state_slug = s.slug;

COMMENT ON VIEW resorts_list IS 'Lightweight resort data for listings and cards';

-- ============================================================================
-- PASS PROGRAM STATS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW pass_program_stats AS
SELECT
  pp.slug,
  pp.name,
  pp.website_url,
  COUNT(DISTINCT rp.resort_id) AS resort_count,
  COUNT(DISTINCT rp.resort_id) FILTER (WHERE r.status = 'active') AS active_resort_count,
  array_agg(DISTINCT r.state_slug ORDER BY r.state_slug) AS states_covered
FROM pass_programs pp
LEFT JOIN resort_passes rp ON pp.slug = rp.pass_slug
LEFT JOIN resorts r ON rp.resort_id = r.id
GROUP BY pp.slug, pp.name, pp.website_url
ORDER BY resort_count DESC;

COMMENT ON VIEW pass_program_stats IS 'Pass program statistics including resort counts';
