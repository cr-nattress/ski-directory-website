# Story 2.3: Create useMapPinsQuery Hook

## Description
Create a TanStack Query-based hook for fetching map pins, replacing the existing `useMapPins` hook that uses manual localStorage caching.

## Acceptance Criteria
- [ ] `useMapPinsQuery` hook created using TanStack Query
- [ ] Query caching replaces manual localStorage cache
- [ ] Returns compatible data shape
- [ ] Old hook continues to work

## Technical Details

### Files to Create

**`shared/api/queries/useMapPinsQuery.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { resortService } from '@/lib/api/resort-service';
import { ResortMapPin } from '@/lib/types';
import { queryKeys } from '../queryKeys';

/**
 * Query hook for fetching map pin data.
 *
 * Replaces useMapPins with TanStack Query caching instead of localStorage.
 * Query cache provides better invalidation and background refetch.
 *
 * @example
 * const { data: pins, isLoading } = useMapPinsQuery();
 * return <ResortMapView pins={pins ?? []} />;
 */
export function useMapPinsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.resorts.mapPins(),
    queryFn: async () => {
      const response = await resortService.getMapPins();
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch map pins');
      }
      return response.data;
    },
    enabled,
    // Longer stale time since map pins don't change often
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep in cache longer for quick view toggles
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### Files to Update (deprecation notice only)

**`lib/hooks/useMapPins.ts`** - Add deprecation comment
```typescript
/**
 * @deprecated Use useMapPinsQuery from '@shared/api' instead.
 * The new hook uses TanStack Query caching instead of localStorage.
 */
```

## Migration Path
```tsx
// Before
const { pins, isLoading, error, refetch } = useMapPins();

// After
const { data: pins = [], isLoading, error, refetch } = useMapPinsQuery();
```

## Benefits Over Current Implementation
- No manual localStorage management
- Automatic background refetch
- Shared cache across components
- Better devtools visibility

## Testing
- [ ] Query returns map pins correctly
- [ ] Caching works (toggle view mode doesn't refetch)
- [ ] Data structure matches existing hook

## Estimate
Small (1 hour)
