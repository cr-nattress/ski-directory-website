'use client';

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
 * const { data: pins = [], isLoading } = useMapPinsQuery();
 * return <ResortMapView pins={pins} />;
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
