-- Migration: 20251130_004_migrate_colorado_distances
-- Description: Populate distance data for all resorts using PostGIS calculations
-- Epic: 19 - Distance from Major City Feature
-- Created: 2025-11-30

-- ============================================================================
-- ASSIGN MAJOR CITY TO ALL RESORTS
-- Each resort gets linked to its state's primary major city
-- ============================================================================
UPDATE resorts r
SET major_city_id = mc.id
FROM major_cities mc
WHERE mc.state_slug = r.state_slug
  AND mc.is_primary = true
  AND r.major_city_id IS NULL;

-- ============================================================================
-- CALCULATE DISTANCES USING POSTGIS
-- Calculate straight-line distance in miles from resort to major city
-- Drive time estimated at 1.3x straight-line distance / 50 mph average
-- ============================================================================
UPDATE resorts r
SET
  distance_from_major_city = ROUND(
    ST_DistanceSphere(
      r.location::geometry,
      ST_SetSRID(ST_MakePoint(mc.longitude, mc.latitude), 4326)
    ) / 1609.34 -- Convert meters to miles
  ),
  drive_time_to_major_city = ROUND(
    -- Estimate drive time: straight-line distance * 1.3 (road factor) / 50 mph * 60 min
    (ST_DistanceSphere(
      r.location::geometry,
      ST_SetSRID(ST_MakePoint(mc.longitude, mc.latitude), 4326)
    ) / 1609.34) * 1.3 / 50 * 60
  )
FROM major_cities mc
WHERE r.major_city_id = mc.id
  AND r.location IS NOT NULL
  AND r.distance_from_major_city IS NULL;

-- ============================================================================
-- FALLBACK: Set default for resorts without location data
-- Will need manual update or geocoding later
-- ============================================================================
UPDATE resorts r
SET
  distance_from_major_city = 0,
  drive_time_to_major_city = 0
WHERE r.major_city_id IS NOT NULL
  AND r.location IS NULL
  AND r.distance_from_major_city IS NULL;

-- ============================================================================
-- VERIFY MIGRATION
-- ============================================================================
-- This query can be run to verify the migration:
-- SELECT
--   r.name,
--   r.state_slug,
--   mc.city_name,
--   r.distance_from_major_city,
--   r.drive_time_to_major_city
-- FROM resorts r
-- LEFT JOIN major_cities mc ON r.major_city_id = mc.id
-- ORDER BY r.state_slug, r.name;
