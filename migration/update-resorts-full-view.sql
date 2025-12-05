-- Migration: Update resorts_full view to include region data
-- Run this in Supabase SQL Editor after add-regions.sql

-- First, get the current view definition and recreate it with region columns
-- You need to drop and recreate the view

-- Drop dependent views first, then recreate them
DROP VIEW IF EXISTS resorts_ranked;
DROP VIEW IF EXISTS resorts_full;

CREATE VIEW resorts_full AS
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
  ) AS tags,
  -- New region columns
  reg.slug AS region_slug,
  reg.name AS region_name
FROM resorts r
JOIN countries c ON r.country_code = c.code
JOIN states s ON r.state_slug = s.slug
LEFT JOIN major_cities mc ON r.major_city_id = mc.id
LEFT JOIN regions reg ON s.region_slug = reg.slug;

COMMENT ON VIEW resorts_full IS 'Complete resort data with joined country/state/major city/region names and aggregated passes/tags';

-- ============================================================================
-- RECREATE RESORTS_RANKED VIEW (depends on resorts_full)
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

-- Verify the view has region columns
SELECT region_slug, region_name, COUNT(*) as resort_count
FROM resorts_full
WHERE region_slug IS NOT NULL
GROUP BY region_slug, region_name
ORDER BY resort_count DESC;
