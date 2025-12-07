# Story 1.2: Create Query Key Factory

## Description
Create a centralized query key factory to ensure consistent cache keys across all queries and enable targeted cache invalidation.

## Acceptance Criteria
- [ ] Query key factory created with typed keys
- [ ] Keys organized by domain (resorts, alerts, etc.)
- [ ] Factory exported from shared/api

## Technical Details

### Files to Create

**`shared/api/queryKeys.ts`**
```typescript
/**
 * Centralized query key factory for TanStack Query
 *
 * Pattern: [domain, scope?, filters?]
 * - All resorts: ['resorts', 'list']
 * - Filtered: ['resorts', 'list', { pass: 'epic' }]
 * - Single: ['resorts', 'detail', 'vail']
 *
 * This enables targeted invalidation:
 * - queryClient.invalidateQueries({ queryKey: ['resorts'] }) - all resort queries
 * - queryClient.invalidateQueries({ queryKey: ['resorts', 'list'] }) - just lists
 */
export const queryKeys = {
  resorts: {
    all: ['resorts'] as const,
    lists: () => [...queryKeys.resorts.all, 'list'] as const,
    list: (filters?: ResortFilters) =>
      [...queryKeys.resorts.lists(), filters] as const,
    details: () => [...queryKeys.resorts.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.resorts.details(), slug] as const,
    mapPins: () => [...queryKeys.resorts.all, 'map-pins'] as const,
    search: (query: string) => [...queryKeys.resorts.all, 'search', query] as const,
    themed: (theme: string) => [...queryKeys.resorts.all, 'themed', theme] as const,
    ranked: (criteria: string) => [...queryKeys.resorts.all, 'ranked', criteria] as const,
  },

  alerts: {
    all: ['alerts'] as const,
    active: (resortSlug?: string) =>
      [...queryKeys.alerts.all, 'active', resortSlug] as const,
  },

  conditions: {
    all: ['conditions'] as const,
    resort: (slug: string) => [...queryKeys.conditions.all, slug] as const,
  },
} as const;

// Type helpers for filters
interface ResortFilters {
  pass?: string;
  state?: string;
  status?: string;
  search?: string;
}
```

### Update shared/api/index.ts
```typescript
export { queryKeys } from './queryKeys';
export { queryClient } from './queryClient';
export { QueryProvider } from './QueryProvider';
```

## Testing
- [ ] TypeScript compiles without errors
- [ ] Keys are properly typed

## Estimate
Small (30 minutes)
