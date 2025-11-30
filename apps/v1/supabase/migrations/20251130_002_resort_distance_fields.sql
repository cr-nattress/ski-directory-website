-- Migration: 20251130_002_resort_distance_fields
-- Description: Add distance fields to resorts table
-- Epic: 19 - Distance from Major City Feature
-- Created: 2025-11-30

-- ============================================================================
-- ADD DISTANCE FIELDS TO RESORTS TABLE
-- ============================================================================

-- Add major_city_id foreign key (nullable to support gradual migration)
ALTER TABLE resorts
ADD COLUMN IF NOT EXISTS major_city_id UUID REFERENCES major_cities(id) ON DELETE SET NULL;

-- Add distance and drive time fields
ALTER TABLE resorts
ADD COLUMN IF NOT EXISTS distance_from_major_city INTEGER; -- miles

ALTER TABLE resorts
ADD COLUMN IF NOT EXISTS drive_time_to_major_city INTEGER; -- minutes

-- Create index on major_city_id for join performance
CREATE INDEX IF NOT EXISTS idx_resorts_major_city ON resorts(major_city_id);

-- Create index on distance for sorting
CREATE INDEX IF NOT EXISTS idx_resorts_distance ON resorts(distance_from_major_city);

COMMENT ON COLUMN resorts.major_city_id IS 'Reference to the major city for distance calculations';
COMMENT ON COLUMN resorts.distance_from_major_city IS 'Distance from major city in miles';
COMMENT ON COLUMN resorts.drive_time_to_major_city IS 'Drive time to major city in minutes';
