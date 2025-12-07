# Story 2.1: Create useResortsQuery Hook

## Description
Create a TanStack Query-based hook for fetching resort lists, replacing the existing `useResorts` hook pattern.

## Acceptance Criteria
- [ ] `useResortsQuery` hook created using TanStack Query
- [ ] Supports same filters as existing `useResorts`
- [ ] Returns compatible data shape for easy migration
- [ ] Old hook continues to work (no breaking changes)

## Technical Details

### Files to Create

**`shared/api/queries/useResortsQuery.ts`**
```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { resortService } from '@/lib/api/resort-service';
import { Resort, ResortQueryOptions, PaginatedResponse } from '@/lib/api/types';
import { queryKeys } from '../queryKeys';

interface UseResortsQueryOptions extends ResortQueryOptions {
  enabled?: boolean;
}

/**
 * Query hook for fetching resorts with filtering, sorting, and pagination.
 *
 * @example
 * // Basic usage
 * const { data: resorts, isLoading } = useResortsQuery();
 *
 * // With filters
 * const { data: resorts } = useResortsQuery({
 *   filters: { passAffiliation: ['epic'] },
 *   sortBy: 'rating',
 * });
 */
export function useResortsQuery(options: UseResortsQueryOptions = {}) {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.resorts.list(queryOptions.filters),
    queryFn: async () => {
      const response = await resortService.getResorts(queryOptions);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }
      return response;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Query hook for fetching all resorts without pagination.
 * Useful for dropdowns, maps, or when you need complete data.
 */
export function useAllResortsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.resorts.lists(),
    queryFn: async () => {
      const response = await resortService.getAllResorts();
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - all resorts changes less frequently
  });
}

/**
 * Query hook for fetching resorts by pass type.
 */
export function useResortsByPassQuery(passType: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.resorts.list({ pass: passType }),
    queryFn: async () => {
      const response = await resortService.getResortsByPass(passType);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }
      return response.data;
    },
    enabled: enabled && !!passType,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Files to Update (deprecation notice only)

**`lib/hooks/useResorts.ts`** - Add deprecation comment
```typescript
/**
 * @deprecated Use useResortsQuery from '@shared/api' instead.
 * This hook will be removed in a future version.
 */
export function useResorts(options: ResortQueryOptions = {}): UseResortsResult {
  // ... existing implementation unchanged
}
```

## Migration Path
Components can migrate one at a time:
```tsx
// Before
const { resorts, isLoading, error } = useResorts({ filters });

// After
const { data, isLoading, error } = useResortsQuery({ filters });
const resorts = data?.data ?? [];
```

## Testing
- [ ] Query returns same data as existing hook
- [ ] Caching works (second call doesn't fetch)
- [ ] Filters work correctly
- [ ] Error handling works

## Estimate
Medium (2-3 hours)
