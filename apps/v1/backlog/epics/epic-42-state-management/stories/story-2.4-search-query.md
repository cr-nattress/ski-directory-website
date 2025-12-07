# Story 2.4: Create useSearchQuery Hook

## Description
Create a TanStack Query-based hook for resort search with debouncing, replacing the existing `useResortSearch` hook.

## Acceptance Criteria
- [ ] `useSearchQuery` hook created using TanStack Query
- [ ] Debouncing built into the hook
- [ ] Returns compatible data shape
- [ ] Old hook continues to work

## Technical Details

### Files to Create

**`shared/api/queries/useSearchQuery.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { resortService } from '@/lib/api/resort-service';
import { Resort } from '@/lib/api/types';
import { queryKeys } from '../queryKeys';

/**
 * Hook that debounces a value.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

interface UseSearchQueryOptions {
  debounceMs?: number;
  minLength?: number;
  enabled?: boolean;
}

/**
 * Query hook for searching resorts with built-in debouncing.
 *
 * @example
 * const [query, setQuery] = useState('');
 * const { data: results, isLoading } = useSearchQuery(query);
 *
 * return (
 *   <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *   {results?.map(resort => <SearchResult key={resort.id} resort={resort} />)}
 * );
 */
export function useSearchQuery(
  query: string,
  options: UseSearchQueryOptions = {}
) {
  const {
    debounceMs = 300,
    minLength = 2,
    enabled = true,
  } = options;

  const debouncedQuery = useDebounce(query, debounceMs);
  const shouldSearch = enabled && debouncedQuery.length >= minLength;

  return useQuery({
    queryKey: queryKeys.resorts.search(debouncedQuery),
    queryFn: async () => {
      const response = await resortService.searchResorts(debouncedQuery);
      if (response.status === 'error') {
        throw new Error(response.message || 'Search failed');
      }
      return response.data;
    },
    enabled: shouldSearch,
    // Short stale time for search - users expect fresh results
    staleTime: 30 * 1000, // 30 seconds
    // Keep recent searches cached for back navigation
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Instant search without debouncing - use for controlled scenarios.
 */
export function useInstantSearchQuery(
  query: string,
  options: Omit<UseSearchQueryOptions, 'debounceMs'> = {}
) {
  const { minLength = 2, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.resorts.search(query),
    queryFn: async () => {
      const response = await resortService.searchResorts(query);
      if (response.status === 'error') {
        throw new Error(response.message || 'Search failed');
      }
      return response.data;
    },
    enabled: enabled && query.length >= minLength,
    staleTime: 30 * 1000,
  });
}
```

### Files to Update (deprecation notice only)

**`lib/hooks/useResortSearch.ts`** - Add deprecation comment

## Migration Path
```tsx
// Before
const { results, isSearching } = useResortSearch(query);

// After
const { data: results = [], isLoading: isSearching } = useSearchQuery(query);
```

## Testing
- [ ] Search returns results correctly
- [ ] Debouncing works (no rapid API calls)
- [ ] Min length check works
- [ ] Results cached for same query

## Estimate
Small (1-2 hours)
