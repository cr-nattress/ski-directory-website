'use client';

import { useQuery } from '@tanstack/react-query';
import { resortService } from '@/lib/api/resort-service';
import { Resort, ResortQueryOptions } from '@/lib/api/types';
import { queryKeys } from '../queryKeys';

interface UseResortsQueryOptions extends ResortQueryOptions {
  enabled?: boolean;
}

/**
 * Query hook for fetching resorts with filtering, sorting, and pagination.
 *
 * @example
 * // Basic usage
 * const { data, isLoading } = useResortsQuery();
 * const resorts = data?.data ?? [];
 *
 * // With filters
 * const { data } = useResortsQuery({
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
 *
 * @example
 * const { data: resorts = [], isLoading } = useAllResortsQuery();
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
 *
 * @example
 * const { data: epicResorts = [] } = useResortsByPassQuery('epic');
 */
export function useResortsByPassQuery(passType: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.resorts.list({ passAffiliation: [passType] }),
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

/**
 * Query hook for fetching featured resorts.
 *
 * @example
 * const { data: featured = [] } = useFeaturedResortsQuery(3);
 */
export function useFeaturedResortsQuery(limit = 3, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.resorts.lists(), 'featured', limit] as const,
    queryFn: async () => {
      const response = await resortService.getFeaturedResorts(limit);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch featured resorts');
      }
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Query hook for fetching nearby resorts.
 *
 * @example
 * const { data: nearby = [] } = useNearbyResortsQuery(100);
 */
export function useNearbyResortsQuery(maxDistance: number, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.resorts.lists(), 'nearby', maxDistance] as const,
    queryFn: async () => {
      const response = await resortService.getNearbyResorts(maxDistance);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch nearby resorts');
      }
      return response.data;
    },
    enabled: enabled && maxDistance > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Compatibility hook matching the legacy useAllResorts interface.
 * Drop-in replacement for @/lib/hooks useAllResorts.
 *
 * @example
 * const { resorts, isLoading, error, refetch } = useAllResorts();
 */
export function useAllResorts() {
  const query = useAllResortsQuery();

  return {
    resorts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
