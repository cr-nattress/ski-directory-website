# Story 34.12: Add API Endpoint for Resort Ski Shops

## Priority: Low

## Phase: Integration

## Context

Create a Next.js API route to fetch ski shops for a resort, enabling frontend integration for displaying nearby shops on resort pages.

## Requirements

1. Create API route for fetching resort ski shops
2. Support query parameters for filtering
3. Return formatted response for UI
4. Cache responses for performance
5. Handle errors gracefully

## Implementation

### API Route: `apps/v1/app/api/resorts/[slug]/ski-shops/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

interface SkiShopResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: string[];
  services: string[];
  distance_miles: number;
  is_on_mountain: boolean;
  proximity_label: string;
  verified: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const maxDistance = parseFloat(searchParams.get('maxDistance') || '30');
  const types = searchParams.get('types')?.split(',');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const supabase = createServerClient();

    // Use the database function for efficient querying
    const { data, error } = await supabase.rpc('get_resort_ski_shops', {
      p_resort_slug: slug,
      p_max_distance: maxDistance,
      p_shop_types: types || null,
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching ski shops:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ski shops' },
        { status: 500 }
      );
    }

    // Transform to response format
    const shops: SkiShopResponse[] = (data || []).map((shop: any) => ({
      id: shop.shop_id,
      name: shop.shop_name,
      slug: shop.shop_slug,
      description: shop.description,
      address: shop.full_address,
      city: shop.city,
      state: shop.state,
      latitude: shop.latitude,
      longitude: shop.longitude,
      phone: shop.phone,
      website_url: shop.website_url,
      shop_type: shop.shop_type,
      services: shop.services,
      distance_miles: shop.distance_miles,
      is_on_mountain: shop.is_on_mountain,
      proximity_label: shop.proximity_label,
      verified: shop.verified,
    }));

    return NextResponse.json({
      resort_slug: slug,
      count: shops.length,
      shops,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Client Hook: `apps/v1/lib/hooks/useResortSkiShops.ts`

```typescript
import useSWR from 'swr';

interface SkiShop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: string[];
  services: string[];
  distance_miles: number;
  is_on_mountain: boolean;
  proximity_label: string;
  verified: boolean;
}

interface UseResortSkiShopsOptions {
  maxDistance?: number;
  types?: string[];
  limit?: number;
}

interface UseResortSkiShopsResult {
  shops: SkiShop[];
  isLoading: boolean;
  error: Error | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useResortSkiShops(
  resortSlug: string,
  options: UseResortSkiShopsOptions = {}
): UseResortSkiShopsResult {
  const { maxDistance = 30, types, limit = 20 } = options;

  const params = new URLSearchParams();
  params.set('maxDistance', maxDistance.toString());
  params.set('limit', limit.toString());
  if (types && types.length > 0) {
    params.set('types', types.join(','));
  }

  const { data, error, isLoading } = useSWR(
    resortSlug ? `/api/resorts/${resortSlug}/ski-shops?${params}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    shops: data?.shops || [],
    isLoading,
    error: error || null,
  };
}
```

### Example Usage in Component

```typescript
// In resort detail page
import { useResortSkiShops } from '@/lib/hooks/useResortSkiShops';

function NearbySkiShops({ resortSlug }: { resortSlug: string }) {
  const { shops, isLoading, error } = useResortSkiShops(resortSlug, {
    maxDistance: 20,
    limit: 5,
  });

  if (isLoading) return <SkiShopsSkeleton />;
  if (error) return null; // Silently fail
  if (shops.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Nearby Ski Shops</h2>
      <div className="space-y-4">
        {shops.map((shop) => (
          <SkiShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </section>
  );
}
```

### TypeScript Types: `apps/v1/types/ski-shop.ts`

```typescript
export interface SkiShop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: ShopType[];
  services: ShopService[];
  verified: boolean;
  is_active: boolean;
}

export type ShopType = 'rental' | 'retail' | 'repair' | 'demo';

export type ShopService =
  | 'ski_rental'
  | 'snowboard_rental'
  | 'boot_fitting'
  | 'tuning'
  | 'waxing'
  | 'repairs'
  | 'lessons';

export interface ResortSkiShop extends SkiShop {
  distance_miles: number;
  is_on_mountain: boolean;
  proximity_label: string;
}
```

## Acceptance Criteria

- [ ] API route returns ski shops for resort
- [ ] Query parameters filter results
- [ ] Response cached for 1 hour
- [ ] Client hook handles loading/error states
- [ ] TypeScript types defined
- [ ] Errors return appropriate status codes

## Testing

1. Test API with curl:
   ```bash
   curl http://localhost:3000/api/resorts/vail/ski-shops
   curl http://localhost:3000/api/resorts/vail/ski-shops?maxDistance=10&types=rental
   ```

2. Test hook in component
3. Verify caching behavior
4. Test error handling with invalid slug

## Effort: Small (1-2 hours)
