# Story 35.2: GCS Data Fetching Service

## Priority: High

## Phase: Data

## Context

Create a service to fetch ski shop data from GCS `ski-shops.json` files for use in server components. This is the preferred data source as it avoids additional Supabase queries and the data is already structured for display.

## Requirements

1. Fetch ski-shops.json from GCS by resort asset_path
2. Handle missing/error cases gracefully
3. Cache responses for performance
4. Provide fallback to empty state

## Implementation

### File: `apps/v1/lib/services/ski-shops-service.ts`

```typescript
import { SkiShopsData, SkiShop, sortShopsByProximity } from '@/lib/types/ski-shop';

const GCS_BUCKET = 'sda-assets-prod';
const GCS_BASE_URL = `https://storage.googleapis.com/${GCS_BUCKET}`;

// In-memory cache for server-side rendering
const cache = new Map<string, { data: SkiShopsData | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch ski shops data from GCS for a resort
 *
 * @param assetPath - Resort's asset path (e.g., "us/colorado/vail")
 * @returns SkiShopsData or null if not found/error
 */
export async function getSkiShopsFromGCS(
  assetPath: string | null | undefined
): Promise<SkiShopsData | null> {
  if (!assetPath) {
    return null;
  }

  // Check cache
  const cacheKey = assetPath;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = `${GCS_BASE_URL}/resorts/${assetPath}/ski-shops.json`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Next.js cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No ski shops data for this resort - cache the null result
        cache.set(cacheKey, { data: null, timestamp: Date.now() });
        return null;
      }
      throw new Error(`GCS fetch failed: ${response.status}`);
    }

    const data: SkiShopsData = await response.json();

    // Sort shops by proximity before caching
    data.shops = sortShopsByProximity(data.shops);

    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error) {
    console.error(`Failed to fetch ski shops for ${assetPath}:`, error);
    // Cache the failure to avoid repeated requests
    cache.set(cacheKey, { data: null, timestamp: Date.now() });
    return null;
  }
}

/**
 * Get just the shops array for a resort (convenience function)
 */
export async function getSkiShops(
  assetPath: string | null | undefined
): Promise<SkiShop[]> {
  const data = await getSkiShopsFromGCS(assetPath);
  return data?.shops || [];
}

/**
 * Get ski shops count for a resort (for stat cards)
 */
export async function getSkiShopsCount(
  assetPath: string | null | undefined
): Promise<number> {
  const data = await getSkiShopsFromGCS(assetPath);
  return data?.statistics?.shops_valid || 0;
}

/**
 * Check if resort has ski shops data
 */
export async function hasSkiShops(
  assetPath: string | null | undefined
): Promise<boolean> {
  const data = await getSkiShopsFromGCS(assetPath);
  return (data?.shops?.length || 0) > 0;
}

/**
 * Get on-mountain shops only
 */
export async function getOnMountainShops(
  assetPath: string | null | undefined
): Promise<SkiShop[]> {
  const shops = await getSkiShops(assetPath);
  return shops.filter(shop => shop.is_on_mountain);
}

/**
 * Get shops by type
 */
export async function getShopsByType(
  assetPath: string | null | undefined,
  type: 'rental' | 'retail' | 'repair' | 'demo'
): Promise<SkiShop[]> {
  const shops = await getSkiShops(assetPath);
  return shops.filter(shop => shop.shop_type.includes(type));
}
```

### Alternative: API Route (for client-side fetching)

If client-side fetching is needed, use the existing API endpoint from Story 34.12:

```typescript
// Client hook (already defined in 34.12)
import { useResortSkiShops } from '@/lib/hooks/useResortSkiShops';

// Usage
const { shops, isLoading, error } = useResortSkiShops(resortSlug);
```

### Integration with Resort Type

Update `apps/v1/lib/types/resort.ts` to include assetPath:

```typescript
interface Resort {
  // ... existing fields ...
  assetPath?: string | null; // GCS path for assets
}
```

Ensure `assetPath` is populated in `supabase-resort-adapter.ts`:

```typescript
// In adaptResortFromSupabase()
assetPath: data.asset_path || null,
```

## Acceptance Criteria

- [ ] `getSkiShopsFromGCS()` fetches and parses JSON
- [ ] Returns null for missing/invalid data (no errors thrown)
- [ ] Results cached for 5 minutes server-side
- [ ] Next.js revalidate set for 1 hour
- [ ] Shops sorted by proximity (on-mountain first)
- [ ] Helper functions for filtering by type

## Testing

1. Test with known resort:
   ```typescript
   const data = await getSkiShopsFromGCS('us/colorado/vail');
   console.log(data?.shops.length); // Should be 10
   ```

2. Test with missing resort:
   ```typescript
   const data = await getSkiShopsFromGCS('us/invalid/resort');
   console.log(data); // Should be null
   ```

3. Test null handling:
   ```typescript
   const data = await getSkiShopsFromGCS(null);
   console.log(data); // Should be null
   ```

## Effort: Small (1-2 hours)
