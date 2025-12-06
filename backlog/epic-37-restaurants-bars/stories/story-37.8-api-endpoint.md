# Story 37.8: API Endpoint - GET Dining

## Description

Create the Next.js API route for fetching dining venues for a resort, with filtering and pagination support.

## Acceptance Criteria

- [ ] GET `/api/resorts/[slug]/dining` endpoint
- [ ] Filter by venue_type, cuisine_type, price_range
- [ ] Filter by is_on_mountain, is_ski_in_ski_out
- [ ] Sort by distance, name, price
- [ ] Pagination with limit/offset
- [ ] Response includes venue count and pagination info
- [ ] Proper error handling and HTTP status codes

## API Design

### Request

```
GET /api/resorts/[slug]/dining

Query Parameters:
- venue_type: string (comma-separated: restaurant,bar,brewery)
- cuisine_type: string (comma-separated: american,mexican,italian)
- price_range: string (comma-separated: $,$$,$$$)
- is_on_mountain: boolean
- is_ski_in_ski_out: boolean
- sort: string (distance|name|price_asc|price_desc)
- limit: number (default: 20, max: 50)
- offset: number (default: 0)
```

### Response

```typescript
interface DiningAPIResponse {
  venues: DiningVenueWithDistance[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    venueTypes: string[];
    cuisineTypes: string[];
    priceRanges: string[];
  };
}

interface DiningVenueWithDistance {
  id: string;
  name: string;
  slug: string;
  description: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  website_url: string;
  venue_type: string[];
  cuisine_type: string[];
  price_range: string;
  serves_breakfast: boolean;
  serves_lunch: boolean;
  serves_dinner: boolean;
  serves_drinks: boolean;
  has_full_bar: boolean;
  ambiance: string[];
  features: string[];
  is_on_mountain: boolean;
  mountain_location: string;
  is_ski_in_ski_out: boolean;
  hours_notes: string;
  distance_miles: number;
  drive_time_minutes: number | null;
}
```

## Implementation

```typescript
// app/api/resorts/[slug]/dining/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters
  const filters = {
    venueType: searchParams.get('venue_type')?.split(',').filter(Boolean),
    cuisineType: searchParams.get('cuisine_type')?.split(',').filter(Boolean),
    priceRange: searchParams.get('price_range')?.split(',').filter(Boolean),
    isOnMountain: searchParams.get('is_on_mountain') === 'true' ? true :
                  searchParams.get('is_on_mountain') === 'false' ? false : undefined,
    isSkiInSkiOut: searchParams.get('is_ski_in_ski_out') === 'true' ? true :
                   searchParams.get('is_ski_in_ski_out') === 'false' ? false : undefined,
  };

  const sort = searchParams.get('sort') || 'distance';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = createServerClient();

  // Get resort by slug
  const { data: resort, error: resortError } = await supabase
    .from('resorts')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (resortError || !resort) {
    return NextResponse.json(
      { error: 'Resort not found' },
      { status: 404 }
    );
  }

  // Build query
  let query = supabase
    .from('resort_dining_venues_full')
    .select('*', { count: 'exact' })
    .eq('resort_id', resort.id)
    .eq('is_active', true);

  // Apply filters
  if (filters.venueType?.length) {
    query = query.overlaps('venue_type', filters.venueType);
  }
  if (filters.cuisineType?.length) {
    query = query.overlaps('cuisine_type', filters.cuisineType);
  }
  if (filters.priceRange?.length) {
    query = query.in('price_range', filters.priceRange);
  }
  if (filters.isOnMountain !== undefined) {
    query = query.eq('is_on_mountain', filters.isOnMountain);
  }
  if (filters.isSkiInSkiOut !== undefined) {
    query = query.eq('is_ski_in_ski_out', filters.isSkiInSkiOut);
  }

  // Apply sorting
  switch (sort) {
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'price_asc':
      query = query.order('price_range', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price_range', { ascending: false });
      break;
    case 'distance':
    default:
      query = query.order('distance_miles', { ascending: true });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: venues, error, count } = await query;

  if (error) {
    console.error('Error fetching dining venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dining venues' },
      { status: 500 }
    );
  }

  // Get available filter options
  const { data: filterOptions } = await supabase
    .from('resort_dining_venues_full')
    .select('venue_type, cuisine_type, price_range')
    .eq('resort_id', resort.id)
    .eq('is_active', true);

  const availableFilters = {
    venueTypes: [...new Set(filterOptions?.flatMap(v => v.venue_type) || [])],
    cuisineTypes: [...new Set(filterOptions?.flatMap(v => v.cuisine_type) || [])],
    priceRanges: [...new Set(filterOptions?.map(v => v.price_range).filter(Boolean) || [])],
  };

  return NextResponse.json({
    venues: venues || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
    filters: availableFilters,
  });
}
```

## Database View

```sql
CREATE OR REPLACE VIEW resort_dining_venues_full AS
SELECT
  dv.*,
  rdv.resort_id,
  rdv.distance_miles,
  rdv.drive_time_minutes,
  rdv.is_preferred
FROM dining_venues dv
JOIN resort_dining_venues rdv ON dv.id = rdv.dining_venue_id
WHERE dv.is_active = true;
```

## Effort

Medium (2-3 hours)
