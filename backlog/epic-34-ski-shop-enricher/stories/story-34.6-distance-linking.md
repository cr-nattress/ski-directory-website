# Story 34.6: Create Resort-Shop Linking with Distance

## Priority: High

## Phase: Core

## Context

Implement geographic distance calculation between resorts and ski shops, and create the linking logic that associates shops with nearby resorts.

## Requirements

1. Implement Haversine formula for distance calculation
2. Link shops to resorts with calculated distance
3. Flag on-mountain shops (< 0.5 miles)
4. Support re-linking when shop location updates
5. Query shops by distance from resort

## Implementation

### src/services/geocoding.ts

```typescript
/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate bearing between two coordinates
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearing = Math.atan2(y, x);
  return ((bearing * 180) / Math.PI + 360) % 360;
}

/**
 * Get compass direction from bearing
 */
export function getDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Estimate drive time based on distance
 * Rough estimate: mountain roads average ~30 mph
 */
export function estimateDriveTime(distanceMiles: number): number {
  const avgSpeedMph = 30;
  const minutes = (distanceMiles / avgSpeedMph) * 60;
  return Math.round(minutes);
}

/**
 * Check if coordinates are within bounds
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  // North America bounds (approximate)
  return lat >= 24 && lat <= 72 && lng >= -170 && lng <= -50;
}

/**
 * Check if a shop is considered "on mountain" (at the resort base)
 */
export function isOnMountain(distanceMiles: number): boolean {
  return distanceMiles < 0.5;
}
```

### Enhanced Linking in Enricher

```typescript
// In ski-shop-enricher.ts

async linkShopsToResort(
  resort: Resort,
  shops: SkiShop[]
): Promise<number> {
  let linked = 0;

  for (const shop of shops) {
    if (!shop.id) continue;

    // Calculate actual distance
    const distance = calculateDistance(
      resort.lat,
      resort.lng,
      shop.latitude,
      shop.longitude
    );

    // Estimate drive time
    const driveTime = estimateDriveTime(distance);

    // Link shop to resort
    await this.supabase.linkShopToResort(
      resort.id,
      shop.id,
      distance,
      isOnMountain(distance)
    );

    linked++;
  }

  return linked;
}
```

### Supabase Query for Nearby Shops

```typescript
// In supabase.ts

async getShopsNearResort(
  resortId: string,
  maxDistanceMiles: number = 30
): Promise<Array<SkiShop & { distance_miles: number }>> {
  const { data, error } = await this.client
    .from('resort_ski_shops')
    .select(`
      distance_miles,
      is_on_mountain,
      drive_time_minutes,
      ski_shops (
        id, name, slug, description,
        address_line1, city, state, postal_code,
        latitude, longitude,
        phone, website_url,
        shop_type, services,
        verified
      )
    `)
    .eq('resort_id', resortId)
    .lte('distance_miles', maxDistanceMiles)
    .eq('ski_shops.is_active', true)
    .order('distance_miles');

  if (error) throw error;

  return data.map((row: any) => ({
    ...row.ski_shops,
    distance_miles: row.distance_miles,
    is_on_mountain: row.is_on_mountain,
    drive_time_minutes: row.drive_time_minutes,
  }));
}

// Using PostGIS for distance query (alternative)
async getShopsWithinRadius(
  lat: number,
  lng: number,
  radiusMiles: number
): Promise<SkiShop[]> {
  const radiusMeters = radiusMiles * 1609.34;

  const { data, error } = await this.client
    .rpc('get_shops_within_radius', {
      center_lat: lat,
      center_lng: lng,
      radius_meters: radiusMeters,
    });

  if (error) throw error;
  return data as SkiShop[];
}
```

### PostGIS Function (Optional Enhancement)

```sql
-- Create function for radius search
CREATE OR REPLACE FUNCTION get_shops_within_radius(
  center_lat DECIMAL,
  center_lng DECIMAL,
  radius_meters DECIMAL
)
RETURNS SETOF ski_shops AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM ski_shops
  WHERE is_active = true
    AND ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
  );
END;
$$ LANGUAGE plpgsql;
```

## Acceptance Criteria

- [ ] Haversine formula calculates accurate distances
- [ ] Shops linked to resorts with distance
- [ ] On-mountain flag set for shops < 0.5 miles
- [ ] Drive time estimated from distance
- [ ] Query returns shops ordered by distance
- [ ] PostGIS function available for radius queries

## Testing

1. Test distance calculation with known coordinates
2. Verify on-mountain detection at boundary
3. Test drive time estimation
4. Query shops for a resort and verify ordering
5. Test PostGIS radius query

## Effort: Small (1-2 hours)
