'use client';

import { useQuery } from '@tanstack/react-query';
import {
  themedResortsService,
  type ThemedSections,
  THEMED_SECTIONS,
} from '@/lib/api/themed-resorts-service';
import { featureFlags } from '@/lib/config/feature-flags';
import { queryKeys } from '../queryKeys';

/**
 * Query hook for fetching themed resort sections.
 *
 * Returns curated lists of resorts for each theme:
 * - Top Destinations (highest ranked)
 * - Hidden Gems (small mountains, high appeal)
 * - Night Skiing & Terrain Parks
 * - Powder & Steeps (expert terrain)
 * - Lost Ski Areas (historical)
 *
 * @example
 * const { data: sections, isLoading } = useThemedResortsQuery();
 * if (sections) {
 *   return <ResortRow resorts={sections.topDestinations} />;
 * }
 */
export function useThemedResortsQuery(enabled = true) {
  const isEnabled = enabled && featureFlags.intelligentListing;

  return useQuery({
    queryKey: queryKeys.resorts.themed('all'),
    queryFn: async () => {
      const data = await themedResortsService.getAllThemedSections();
      return data;
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Compatibility hook matching the legacy useThemedResorts interface.
 * Drop-in replacement for @/lib/hooks/useThemedResorts.
 *
 * @example
 * const { sections, isLoading, error, refetch } = useThemedResorts();
 */
export function useThemedResorts() {
  const query = useThemedResortsQuery();

  return {
    sections: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Re-export types and config for convenience
export { THEMED_SECTIONS };
export type { ThemedSections };
