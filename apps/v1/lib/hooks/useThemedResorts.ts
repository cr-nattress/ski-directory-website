'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  themedResortsService,
  type ThemedSections,
  THEMED_SECTIONS,
} from '@/lib/api/themed-resorts-service';
import { featureFlags } from '@/lib/config/feature-flags';

/**
 * Result from the useThemedResorts hook
 */
interface UseThemedResortsResult {
  /** Themed section data */
  sections: ThemedSections | null;
  /** True during initial load */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Refetch the themed sections */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching themed resort sections for the discovery UI.
 *
 * Returns curated lists of resorts for each theme:
 * - Top Destinations (highest ranked)
 * - Hidden Gems (small mountains, high appeal)
 * - Night Skiing & Terrain Parks
 * - Powder & Steeps (expert terrain)
 * - Lost Ski Areas (historical)
 *
 * When the `intelligentListing` feature flag is disabled, returns null.
 *
 * @example
 * ```tsx
 * function DiscoverySections() {
 *   const { sections, isLoading, error } = useThemedResorts();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!sections) return null;
 *
 *   return (
 *     <>
 *       <ResortRow title="Top Destinations" resorts={sections.topDestinations} />
 *       <ResortRow title="Hidden Gems" resorts={sections.hiddenGems} />
 *     </>
 *   );
 * }
 * ```
 */
export function useThemedResorts(): UseThemedResortsResult {
  const [sections, setSections] = useState<ThemedSections | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Check feature flag
  const isEnabled = featureFlags.intelligentListing;

  const fetchSections = useCallback(async () => {
    if (!isEnabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await themedResortsService.getAllThemedSections();
      setSections(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch themed sections')
      );
      setSections(null);
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  // Track if initial fetch has been done for this mount
  const hasFetchedRef = useRef<boolean>(false);

  // Initial fetch - runs on every mount
  useEffect(() => {
    hasFetchedRef.current = false;

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchSections();
    }

    return () => {
      hasFetchedRef.current = false;
    };
  }, [fetchSections]);

  return {
    sections,
    isLoading,
    error,
    refetch: fetchSections,
  };
}

// Re-export the section config for use in components
export { THEMED_SECTIONS };
export type { ThemedSections };
