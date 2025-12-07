/**
 * Centralized query key factory for TanStack Query.
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

import type { ResortFilters } from '@/lib/api/types';

export const queryKeys = {
  resorts: {
    all: ['resorts'] as const,
    lists: () => [...queryKeys.resorts.all, 'list'] as const,
    list: (filters?: ResortFilters) =>
      filters
        ? ([...queryKeys.resorts.lists(), filters] as const)
        : queryKeys.resorts.lists(),
    details: () => [...queryKeys.resorts.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.resorts.details(), slug] as const,
    mapPins: () => [...queryKeys.resorts.all, 'map-pins'] as const,
    search: (query: string) =>
      [...queryKeys.resorts.all, 'search', query] as const,
    themed: (theme: string) =>
      [...queryKeys.resorts.all, 'themed', theme] as const,
    ranked: (criteria: string) =>
      [...queryKeys.resorts.all, 'ranked', criteria] as const,
    conditions: (slug: string) =>
      [...queryKeys.resorts.all, 'conditions', slug] as const,
  },

  alerts: {
    all: ['alerts'] as const,
    active: (resortSlug?: string) =>
      resortSlug
        ? ([...queryKeys.alerts.all, 'active', resortSlug] as const)
        : ([...queryKeys.alerts.all, 'active'] as const),
  },
} as const;
