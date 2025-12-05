-- Migration: Add regions category for resorts
-- Story 36.12

-- 1. Create regions table
CREATE TABLE IF NOT EXISTS regions (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES countries(code),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add region_slug column to states table
ALTER TABLE states ADD COLUMN IF NOT EXISTS region_slug TEXT REFERENCES regions(slug);

-- 3. Insert US regions
INSERT INTO regions (slug, name, country_code, display_order) VALUES
  ('rocky-mountains', 'Rocky Mountains', 'us', 1),
  ('pacific-northwest', 'Pacific Northwest', 'us', 2),
  ('california', 'California', 'us', 3),
  ('new-england', 'New England', 'us', 4),
  ('mid-atlantic', 'Mid-Atlantic', 'us', 5),
  ('midwest', 'Midwest', 'us', 6),
  ('southwest', 'Southwest', 'us', 7),
  ('southeast', 'Southeast', 'us', 8)
ON CONFLICT (slug) DO NOTHING;

-- 4. Insert Canada regions
INSERT INTO regions (slug, name, country_code, display_order) VALUES
  ('western-canada', 'Western Canada', 'ca', 9),
  ('central-canada', 'Central Canada', 'ca', 10),
  ('prairies', 'Prairies', 'ca', 11),
  ('atlantic-canada', 'Atlantic Canada', 'ca', 12)
ON CONFLICT (slug) DO NOTHING;

-- 5. Update US states with their regions
-- Rocky Mountains: Colorado, Utah, Wyoming, Montana, Idaho
UPDATE states SET region_slug = 'rocky-mountains' WHERE slug IN ('colorado', 'utah', 'wyoming', 'montana', 'idaho') AND country_code = 'us';

-- Pacific Northwest: Washington, Oregon, Alaska
UPDATE states SET region_slug = 'pacific-northwest' WHERE slug IN ('washington', 'oregon', 'alaska') AND country_code = 'us';

-- California
UPDATE states SET region_slug = 'california' WHERE slug = 'california' AND country_code = 'us';

-- New England: Vermont, New Hampshire, Maine, Massachusetts, Connecticut, Rhode Island
UPDATE states SET region_slug = 'new-england' WHERE slug IN ('vermont', 'new-hampshire', 'maine', 'massachusetts', 'connecticut', 'rhode-island') AND country_code = 'us';

-- Mid-Atlantic: New York, Pennsylvania, New Jersey, Maryland, Virginia, West Virginia
UPDATE states SET region_slug = 'mid-atlantic' WHERE slug IN ('new-york', 'pennsylvania', 'new-jersey', 'maryland', 'virginia', 'west-virginia') AND country_code = 'us';

-- Midwest: Michigan, Wisconsin, Minnesota, Ohio, Indiana, North Dakota, Missouri, Illinois
UPDATE states SET region_slug = 'midwest' WHERE slug IN ('michigan', 'wisconsin', 'minnesota', 'ohio', 'indiana', 'north-dakota', 'missouri', 'illinois') AND country_code = 'us';

-- Southwest: New Mexico, Arizona, Nevada
UPDATE states SET region_slug = 'southwest' WHERE slug IN ('new-mexico', 'arizona', 'nevada') AND country_code = 'us';

-- Southeast: North Carolina, Tennessee, Georgia
UPDATE states SET region_slug = 'southeast' WHERE slug IN ('north-carolina', 'tennessee', 'georgia') AND country_code = 'us';

-- 6. Update Canada provinces with their regions
-- Western Canada: British Columbia, Alberta
UPDATE states SET region_slug = 'western-canada' WHERE slug IN ('british-columbia', 'alberta') AND country_code = 'ca';

-- Central Canada: Ontario, Quebec
UPDATE states SET region_slug = 'central-canada' WHERE slug IN ('ontario', 'quebec') AND country_code = 'ca';

-- Prairies: Saskatchewan, Manitoba
UPDATE states SET region_slug = 'prairies' WHERE slug IN ('saskatchewan', 'manitoba') AND country_code = 'ca';

-- Atlantic Canada: Nova Scotia, New Brunswick, Newfoundland and Labrador
UPDATE states SET region_slug = 'atlantic-canada' WHERE slug IN ('nova-scotia', 'new-brunswick', 'newfoundland-and-labrador') AND country_code = 'ca';

-- 7. Create or replace resorts_full view to include region data
-- Note: You'll need to update the existing resorts_full view definition
-- This is the additional JOIN and columns to add:
-- LEFT JOIN regions r ON s.region_slug = r.slug
-- Add: r.slug as region_slug, r.name as region_name

-- 8. Enable RLS on regions table
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- 9. Create read policy for regions
CREATE POLICY "Allow public read access to regions" ON regions
  FOR SELECT USING (true);

-- Verify the migration
SELECT r.name as region, r.country_code, COUNT(s.slug) as state_count
FROM regions r
LEFT JOIN states s ON s.region_slug = r.slug
GROUP BY r.slug, r.name, r.country_code, r.display_order
ORDER BY r.display_order;
