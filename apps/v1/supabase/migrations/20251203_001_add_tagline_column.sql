-- Migration: 001_add_tagline_column
-- Description: Add tagline column to resorts table for marketing phrases
-- Created: 2025-12-03

-- ============================================================================
-- DROP DEPENDENT VIEWS FIRST (CASCADE to handle all dependencies)
-- ============================================================================
DROP VIEW IF EXISTS resorts_ranked CASCADE;
DROP VIEW IF EXISTS resorts_full CASCADE;
DROP VIEW IF EXISTS resorts_list CASCADE;
DROP VIEW IF EXISTS resorts_map_pins CASCADE;
DROP VIEW IF EXISTS resort_map_pins CASCADE;

-- ============================================================================
-- ADD TAGLINE COLUMN
-- ============================================================================
ALTER TABLE resorts ADD COLUMN IF NOT EXISTS tagline TEXT;

-- ============================================================================
-- UPDATE FULL-TEXT SEARCH
-- ============================================================================
DROP INDEX IF EXISTS idx_resorts_fts;
ALTER TABLE resorts DROP COLUMN IF EXISTS fts;
ALTER TABLE resorts ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(nearest_city, '')), 'C')
  ) STORED;
CREATE INDEX idx_resorts_fts ON resorts USING GIN(fts);

-- ============================================================================
-- RECREATE RESORTS_FULL VIEW (with tagline)
-- ============================================================================
CREATE OR REPLACE VIEW resorts_full AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.tagline,
  r.country_code AS country,
  c.name AS country_name,
  r.state_slug AS state,
  s.name AS state_name,
  r.status,
  r.is_active,
  r.is_lost,
  r.is_open,
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
  mc.city_name AS major_city_name,
  r.distance_from_major_city,
  r.drive_time_to_major_city,
  COALESCE(
    (SELECT array_agg(rp.pass_slug ORDER BY rp.pass_slug)
     FROM resort_passes rp
     WHERE rp.resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations,
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
-- RECREATE RESORTS_LIST VIEW
-- ============================================================================
CREATE OR REPLACE VIEW resorts_list AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.tagline,
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
-- RECREATE RESORTS_MAP_PINS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW resorts_map_pins AS
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
  (r.stats->>'snowfall24h')::numeric AS snowfall_24h
FROM resorts r
WHERE r.is_active = true OR r.is_lost = true;

COMMENT ON VIEW resorts_map_pins IS 'Lightweight resort data optimized for map pin display with seasonal open status';

-- ============================================================================
-- RECREATE RESORT_MAP_PINS VIEW (alternate name)
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
  mc.city_name AS major_city_name,
  r.distance_from_major_city,
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

-- ============================================================================
-- RECREATE RESORTS_RANKED VIEW
-- ============================================================================
CREATE VIEW resorts_ranked AS
WITH score_components AS (
  SELECT
    rf.*,
    (
      LEAST(1.0, COALESCE((rf.stats->>'skiableAcres')::numeric, 0) / 5000.0) * 0.15 +
      LEAST(1.0, COALESCE((rf.stats->>'verticalDrop')::numeric, 0) / 4000.0) * 0.12 +
      LEAST(1.0, COALESCE((rf.stats->>'liftsCount')::numeric, 0) / 30.0) * 0.08 +
      LEAST(1.0, COALESCE((rf.stats->>'runsCount')::numeric, 0) / 200.0) * 0.05
    ) / 0.40 AS size_score,
    CASE
      WHEN COALESCE((rf.terrain->>'beginner')::numeric, 0) +
           COALESCE((rf.terrain->>'intermediate')::numeric, 0) +
           COALESCE((rf.terrain->>'advanced')::numeric, 0) +
           COALESCE((rf.terrain->>'expert')::numeric, 0) = 0 THEN 0
      ELSE
        GREATEST(0, 1.0 - (
          ABS(COALESCE((rf.terrain->>'beginner')::numeric, 0) / 100.0 - 0.20) +
          ABS(COALESCE((rf.terrain->>'intermediate')::numeric, 0) / 100.0 - 0.40) +
          ABS(COALESCE((rf.terrain->>'advanced')::numeric, 0) / 100.0 - 0.25) +
          ABS(COALESCE((rf.terrain->>'expert')::numeric, 0) / 100.0 - 0.15)
        ) / 2.0) +
        CASE WHEN COALESCE((rf.terrain->>'expert')::numeric, 0) > 5 THEN 0.1 ELSE 0 END
    END AS terrain_diversity_score,
    (
      CASE
        WHEN rf.description IS NOT NULL AND LENGTH(rf.description) >= 100 THEN 1.0
        WHEN rf.description IS NOT NULL AND LENGTH(rf.description) > 0 THEN LENGTH(rf.description) / 100.0
        ELSE 0
      END * 0.20 +
      (
        CASE WHEN COALESCE((rf.stats->>'skiableAcres')::numeric, 0) > 0 THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.stats->>'verticalDrop')::numeric, 0) > 0 THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.stats->>'liftsCount')::numeric, 0) > 0 THEN 1 ELSE 0 END
      ) / 3.0 * 0.25 +
      CASE
        WHEN COALESCE((rf.terrain->>'beginner')::numeric, 0) +
             COALESCE((rf.terrain->>'intermediate')::numeric, 0) +
             COALESCE((rf.terrain->>'advanced')::numeric, 0) +
             COALESCE((rf.terrain->>'expert')::numeric, 0) BETWEEN 90 AND 110 THEN 1.0
        WHEN COALESCE((rf.terrain->>'beginner')::numeric, 0) +
             COALESCE((rf.terrain->>'intermediate')::numeric, 0) +
             COALESCE((rf.terrain->>'advanced')::numeric, 0) +
             COALESCE((rf.terrain->>'expert')::numeric, 0) > 0 THEN 0.5
        ELSE 0
      END * 0.15 +
      LEAST(1.0, (
        CASE WHEN COALESCE((rf.features->>'hasPark')::boolean, false) THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.features->>'hasHalfpipe')::boolean, false) THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.features->>'hasNightSkiing')::boolean, false) THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.features->>'hasBackcountryAccess')::boolean, false) THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.features->>'hasSpaVillage')::boolean, false) THEN 1 ELSE 0 END
      ) / 3.0) * 0.15 +
      CASE
        WHEN rf.tags IS NOT NULL AND array_length(rf.tags, 1) >= 3 THEN 1.0
        WHEN rf.tags IS NOT NULL AND array_length(rf.tags, 1) > 0 THEN array_length(rf.tags, 1) / 3.0
        ELSE 0
      END * 0.10 +
      CASE WHEN rf.website_url IS NOT NULL AND rf.website_url != '' THEN 1.0 ELSE 0 END * 0.10 +
      CASE WHEN rf.lat IS NOT NULL AND rf.lng IS NOT NULL AND rf.lat != 0 AND rf.lng != 0 THEN 1.0 ELSE 0 END * 0.05
    ) AS content_score,
    CASE
      WHEN rf.pass_affiliations IS NOT NULL AND 'epic' = ANY(rf.pass_affiliations) THEN 0.08
      WHEN rf.pass_affiliations IS NOT NULL AND 'ikon' = ANY(rf.pass_affiliations) THEN 0.08
      WHEN rf.pass_affiliations IS NOT NULL AND 'indy' = ANY(rf.pass_affiliations) THEN 0.04
      WHEN rf.pass_affiliations IS NOT NULL AND 'local' = ANY(rf.pass_affiliations) THEN 0.02
      ELSE 0
    END AS pass_boost,
    CASE
      WHEN rf.is_lost THEN 0.3
      WHEN rf.is_active THEN 1.0
      ELSE 0.5
    END AS status_score
  FROM resorts_full rf
)
SELECT
  sc.*,
  ROUND(
    (
      sc.size_score * 0.40 +
      sc.terrain_diversity_score * 0.15 +
      sc.content_score * 0.20 +
      sc.pass_boost * 0.10 +
      sc.status_score * 0.15
    ) * 100
  , 2) AS ranking_score
FROM score_components sc
ORDER BY ranking_score DESC, sc.name ASC;

COMMENT ON VIEW resorts_ranked IS 'Resort data with pre-computed engagement scores for intelligent ordering';

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN resorts.tagline IS 'Short marketing phrase (5-10 words) capturing resort identity';
