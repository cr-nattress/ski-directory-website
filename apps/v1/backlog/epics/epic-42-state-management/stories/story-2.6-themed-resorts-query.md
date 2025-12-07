# Story 2.6: Create useThemedResortsQuery Hook

## Description
Create a TanStack Query-based hook for fetching themed resort sections (e.g., "Best for Beginners", "Most Snow"), replacing the existing `useThemedResorts` and `useRankedResorts` hooks.

## Acceptance Criteria
- [ ] `useThemedResortsQuery` hook created
- [ ] `useRankedResortsQuery` hook created
- [ ] Supports caching per theme/criteria
- [ ] Old hooks continue to work

## Technical Details

### Files to Create

**`shared/api/queries/useThemedResortsQuery.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { resortService } from '@/lib/api/resort-service';
import { Resort, ThemedSection } from '@/lib/api/types';
import { queryKeys } from '../queryKeys';

interface UseThemedResortsQueryOptions {
  theme: string;
  limit?: number;
  enabled?: boolean;
}

/**
 * Query hook for fetching themed resort sections.
 *
 * @example
 * const { data: section } = useThemedResortsQuery({ theme: 'beginner-friendly' });
 * return <ResortRow title={section.title} resorts={section.resorts} />;
 */
export function useThemedResortsQuery(options: UseThemedResortsQueryOptions) {
  const { theme, limit = 6, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.resorts.themed(theme),
    queryFn: async () => {
      const response = await resortService.getThemedResorts(theme, limit);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch themed resorts');
      }
      return response.data;
    },
    enabled: enabled && !!theme,
    staleTime: 10 * 60 * 1000, // 10 minutes - themed content changes rarely
  });
}

interface UseRankedResortsQueryOptions {
  criteria: string;
  limit?: number;
  enabled?: boolean;
}

/**
 * Query hook for fetching ranked resort sections.
 *
 * @example
 * const { data: resorts } = useRankedResortsQuery({ criteria: 'snowfall' });
 */
export function useRankedResortsQuery(options: UseRankedResortsQueryOptions) {
  const { criteria, limit = 6, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.resorts.ranked(criteria),
    queryFn: async () => {
      const response = await resortService.getRankedResorts(criteria, limit);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch ranked resorts');
      }
      return response.data;
    },
    enabled: enabled && !!criteria,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Files to Update (deprecation notice only)

**`lib/hooks/useThemedResorts.ts`** - Add deprecation comment
**`lib/hooks/useRankedResorts.ts`** - Add deprecation comment

## Testing
- [ ] Themed sections load correctly
- [ ] Ranked sections load correctly
- [ ] Caching works per theme/criteria

## Estimate
Small (1-2 hours)
