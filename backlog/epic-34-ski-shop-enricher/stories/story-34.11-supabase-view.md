# Story 34.11: Create Supabase View for Querying

## Priority: Medium

## Phase: Integration

## Context

Create a database view that simplifies querying ski shops for a resort, combining data from multiple tables.

## Requirements

1. Create view joining resorts, shops, and links
2. Include distance and on-mountain flag
3. Sort by distance
4. Filter to active shops only
5. Add computed fields for UI

## Implementation

### Migration: `create_ski_shop_views.sql`

```sql
-- ============================================================================
-- View: resort_ski_shops_full
-- Combines resort, shop, and link data for easy querying
-- ============================================================================

CREATE OR REPLACE VIEW resort_ski_shops_full AS
SELECT
  -- Resort info
  r.id as resort_id,
  r.name as resort_name,
  r.slug as resort_slug,

  -- Shop info
  s.id as shop_id,
  s.name as shop_name,
  s.slug as shop_slug,
  s.description as shop_description,
  s.address_line1,
  s.city,
  s.state,
  s.postal_code,
  s.latitude,
  s.longitude,
  s.phone,
  s.website_url,
  s.shop_type,
  s.services,
  s.verified,

  -- Link info
  rs.distance_miles,
  rs.drive_time_minutes,
  rs.is_on_mountain,
  rs.is_preferred,

  -- Computed fields
  CASE
    WHEN rs.distance_miles < 1 THEN 'At Resort'
    WHEN rs.distance_miles < 5 THEN 'Very Close'
    WHEN rs.distance_miles < 15 THEN 'Nearby'
    ELSE 'In Area'
  END as proximity_label,

  -- Full address for display
  CONCAT_WS(', ',
    s.address_line1,
    s.city,
    CONCAT(s.state, ' ', s.postal_code)
  ) as full_address

FROM resort_ski_shops rs
JOIN resorts r ON r.id = rs.resort_id
JOIN ski_shops s ON s.id = rs.ski_shop_id
WHERE s.is_active = true
ORDER BY rs.distance_miles;

-- ============================================================================
-- View: ski_shop_stats
-- Aggregate statistics for monitoring
-- ============================================================================

CREATE OR REPLACE VIEW ski_shop_stats AS
SELECT
  (SELECT COUNT(*) FROM ski_shops WHERE is_active = true) as total_shops,
  (SELECT COUNT(*) FROM ski_shops WHERE verified = true) as verified_shops,
  (SELECT COUNT(DISTINCT resort_id) FROM resort_ski_shops) as resorts_with_shops,
  (SELECT COUNT(*) FROM resorts WHERE is_active = true) as total_resorts,
  (SELECT AVG(shop_count)::numeric(10,2) FROM (
    SELECT COUNT(*) as shop_count
    FROM resort_ski_shops
    GROUP BY resort_id
  ) sub) as avg_shops_per_resort,
  (SELECT COUNT(*) FROM ski_shops WHERE source = 'openai') as openai_sourced,
  (SELECT COUNT(*) FROM ski_shops WHERE source = 'manual') as manually_added;

-- ============================================================================
-- Function: get_resort_ski_shops
-- Get ski shops for a resort with optional filters
-- ============================================================================

CREATE OR REPLACE FUNCTION get_resort_ski_shops(
  p_resort_slug TEXT,
  p_max_distance DECIMAL DEFAULT 30,
  p_shop_types TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  shop_id UUID,
  shop_name VARCHAR,
  shop_slug VARCHAR,
  description TEXT,
  full_address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  phone VARCHAR,
  website_url VARCHAR,
  shop_type VARCHAR[],
  services TEXT[],
  distance_miles DECIMAL,
  is_on_mountain BOOLEAN,
  proximity_label TEXT,
  verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.shop_id,
    v.shop_name,
    v.shop_slug,
    v.shop_description,
    v.full_address,
    v.latitude,
    v.longitude,
    v.phone,
    v.website_url,
    v.shop_type,
    v.services,
    v.distance_miles,
    v.is_on_mountain,
    v.proximity_label,
    v.verified
  FROM resort_ski_shops_full v
  WHERE v.resort_slug = p_resort_slug
    AND v.distance_miles <= p_max_distance
    AND (p_shop_types IS NULL OR v.shop_type && p_shop_types)
  ORDER BY v.distance_miles
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function: get_shops_by_type
-- Get all shops of a certain type
-- ============================================================================

CREATE OR REPLACE FUNCTION get_shops_by_type(
  p_shop_type TEXT,
  p_state TEXT DEFAULT NULL
)
RETURNS SETOF ski_shops AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM ski_shops
  WHERE is_active = true
    AND p_shop_type = ANY(shop_type)
    AND (p_state IS NULL OR state = UPPER(p_state))
  ORDER BY name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Indexes for view performance
-- ============================================================================

-- Ensure covering indexes exist
CREATE INDEX IF NOT EXISTS idx_ski_shops_active_source
  ON ski_shops(is_active, source);

CREATE INDEX IF NOT EXISTS idx_resort_ski_shops_distance_resort
  ON resort_ski_shops(resort_id, distance_miles);
```

### Example Queries

```sql
-- Get shops for a resort
SELECT * FROM get_resort_ski_shops('vail');

-- Get shops with filters
SELECT * FROM get_resort_ski_shops(
  'vail',
  15,  -- max 15 miles
  ARRAY['rental', 'retail']  -- only rental and retail
);

-- Use the view directly
SELECT
  shop_name,
  full_address,
  distance_miles,
  proximity_label,
  shop_type,
  website_url
FROM resort_ski_shops_full
WHERE resort_slug = 'park-city'
ORDER BY distance_miles
LIMIT 10;

-- Get stats
SELECT * FROM ski_shop_stats;
```

## Acceptance Criteria

- [ ] View `resort_ski_shops_full` created
- [ ] View `ski_shop_stats` created
- [ ] Function `get_resort_ski_shops` works
- [ ] Proximity labels calculated correctly
- [ ] Full address formatted properly
- [ ] Performance acceptable with indexes

## Testing

1. Query view for a resort with shops
2. Test function with various parameters
3. Verify stats view accuracy
4. Check query performance with EXPLAIN

## Effort: Small (1 hour)
