# Story 2.2: Create useResortQuery Hook

## Description
Create a TanStack Query-based hook for fetching a single resort by slug, replacing the existing `useResort` hook.

## Acceptance Criteria
- [ ] `useResortQuery` hook created using TanStack Query
- [ ] Supports fetching by slug or ID
- [ ] Returns compatible data shape
- [ ] Old hook continues to work

## Technical Details

### Files to Create

**`shared/api/queries/useResortQuery.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { resortService } from '@/lib/api/resort-service';
import { Resort } from '@/lib/api/types';
import { queryKeys } from '../queryKeys';

interface UseResortQueryOptions {
  enabled?: boolean;
}

/**
 * Query hook for fetching a single resort by slug.
 *
 * @example
 * const { data: resort, isLoading } = useResortQuery('vail');
 *
 * if (isLoading) return <Skeleton />;
 * if (!resort) return <NotFound />;
 * return <ResortDetail resort={resort} />;
 */
export function useResortQuery(
  slug: string | undefined,
  options: UseResortQueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.resorts.detail(slug ?? ''),
    queryFn: async () => {
      if (!slug) return null;

      const response = await resortService.getResortBySlug(slug);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resort');
      }
      return response.data;
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Query hook for fetching a single resort by ID.
 */
export function useResortByIdQuery(
  id: string | undefined,
  options: UseResortQueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['resorts', 'detail', 'id', id] as const,
    queryFn: async () => {
      if (!id) return null;

      const response = await resortService.getResortById(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resort');
      }
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Files to Update (deprecation notice only)

**`lib/hooks/useResort.ts`** - Add deprecation comment
```typescript
/**
 * @deprecated Use useResortQuery from '@shared/api' instead.
 */
```

## Migration Path
```tsx
// Before
const { resort, isLoading, error, refetch } = useResort(slug);

// After
const { data: resort, isLoading, error, refetch } = useResortQuery(slug);
```

## Testing
- [ ] Query returns resort data correctly
- [ ] Caching works for same slug
- [ ] Returns null/undefined for missing slug
- [ ] Error thrown for invalid slug

## Estimate
Small (1-2 hours)
