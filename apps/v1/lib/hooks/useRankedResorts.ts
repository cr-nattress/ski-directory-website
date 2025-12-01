'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { adaptResortFromSupabase } from '@/lib/api/supabase-resort-adapter';
import type { Resort } from '@/lib/types';
import { paginationConfig } from '@/lib/config/pagination';
import { featureFlags } from '@/lib/config/feature-flags';
import { useLogger } from '@/lib/hooks/useLogger';
import { getObservabilityConfig } from '@/lib/config/observability';

/**
 * Extended Resort type that includes ranking score
 */
export interface RankedResort extends Resort {
  rankingScore: number;
  sizeScore?: number;
  terrainDiversityScore?: number;
  contentScore?: number;
  passBoost?: number;
  statusScore?: number;
}

/**
 * Options for the useRankedResorts hook
 */
interface UseRankedResortsOptions {
  /** Number of items per page (defaults to config value) */
  pageSize?: number;
  /** Whether to start fetching immediately */
  enabled?: boolean;
  /** Include lost/defunct resorts (default: false for ranked view) */
  includeLost?: boolean;
}

/**
 * Result from the useRankedResorts hook
 */
interface UseRankedResortsResult {
  /** Accumulated resorts from all loaded pages, ordered by ranking score */
  resorts: RankedResort[];
  /** True only during initial load */
  isLoading: boolean;
  /** True when fetching additional pages */
  isLoadingMore: boolean;
  /** Whether more pages are available */
  hasMore: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Total count of resorts */
  totalCount: number;
  /** Current page number */
  currentPage: number;
  /** Load the next page of results */
  loadMore: () => Promise<void>;
  /** Reset and refetch from page 1 */
  reset: () => Promise<void>;
}

/**
 * Adapt a ranked resort row to the RankedResort type
 */
function adaptRankedResort(row: Record<string, unknown>): RankedResort {
  // The resorts_ranked view has all resorts_full columns plus score columns
  // Use the standard adapter for the base Resort fields
  const baseResort = adaptResortFromSupabase(row as Parameters<typeof adaptResortFromSupabase>[0]);

  return {
    ...baseResort,
    rankingScore: (row.ranking_score as number) || 0,
    sizeScore: (row.size_score as number) || 0,
    terrainDiversityScore: (row.terrain_diversity_score as number) || 0,
    contentScore: (row.content_score as number) || 0,
    passBoost: (row.pass_boost as number) || 0,
    statusScore: (row.status_score as number) || 0,
  };
}

/**
 * Hook for fetching resorts sorted by ranking score
 *
 * Queries the `resorts_ranked` view which pre-computes engagement scores.
 * Supports infinite scroll pagination with accumulated results.
 *
 * When the `intelligentListing` feature flag is disabled, this hook returns
 * an empty state and does nothing (use useInfiniteResorts instead).
 *
 * @example
 * ```tsx
 * function RankedResortList() {
 *   const {
 *     resorts,
 *     isLoading,
 *     isLoadingMore,
 *     hasMore,
 *     loadMore,
 *   } = useRankedResorts({ pageSize: 12 });
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <>
 *       {resorts.map(resort => (
 *         <ResortCard key={resort.id} resort={resort} />
 *       ))}
 *       {hasMore && <button onClick={loadMore}>Load More</button>}
 *     </>
 *   );
 * }
 * ```
 */
export function useRankedResorts(
  options: UseRankedResortsOptions = {}
): UseRankedResortsResult {
  const {
    pageSize = paginationConfig.landing.initialPageSize,
    enabled = true,
    includeLost = false,
  } = options;

  // Check feature flag - if disabled, return empty state
  const isFeatureEnabled = featureFlags.intelligentListing;

  // Logger for this hook
  const log = useLogger({ component: 'useRankedResorts' });
  const { thresholds } = getObservabilityConfig();

  // State
  const [resorts, setResorts] = useState<RankedResort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef<boolean>(false);

  /**
   * Fetch a specific page of ranked results
   */
  const fetchPage = useCallback(
    async (page: number, append: boolean = false) => {
      // Skip if feature is disabled
      if (!isFeatureEnabled) {
        setIsLoading(false);
        return;
      }

      // Prevent duplicate requests
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      const startTime = performance.now();

      // Set appropriate loading state
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      log.info('Fetching ranked resorts', { page, pageSize, append, includeLost });

      try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Query the resorts_ranked view
        // Note: The view is already ordered by ranking_score DESC
        let query = supabase
          .from('resorts_ranked' as 'resorts_full') // Type cast since view isn't in generated types
          .select('*', { count: 'exact' });

        // Filter out lost resorts unless explicitly included
        if (!includeLost) {
          query = query.eq('is_active', true);
        }

        // Apply pagination
        // View is pre-ordered by ranking_score DESC, but we need to specify for pagination
        query = query
          .order('ranking_score', { ascending: false })
          .order('name', { ascending: true }) // Secondary sort for ties
          .range(from, to);

        const { data, error: queryError, count } = await query;
        const durationMs = Math.round(performance.now() - startTime);

        if (queryError) {
          throw new Error(queryError.message || 'Failed to fetch ranked resorts');
        }

        const newResorts = (data || []).map(adaptRankedResort);
        const total = count || 0;
        const hasMorePages = from + newResorts.length < total;

        // Log successful fetch
        log.info('Ranked resorts fetch completed', {
          page,
          count: newResorts.length,
          totalCount: total,
          hasMore: hasMorePages,
          durationMs,
        });

        // Warn if response was slow
        if (durationMs > thresholds.slowApiThreshold) {
          log.warn('Slow response detected for ranked resorts', {
            page,
            durationMs,
            threshold: thresholds.slowApiThreshold,
          });
        }

        // Update state
        setResorts((prev) => (append ? [...prev, ...newResorts] : newResorts));
        setHasMore(hasMorePages);
        setTotalCount(total);
        setCurrentPage(page);
        setError(null);
      } catch (err) {
        const durationMs = Math.round(performance.now() - startTime);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

        log.error('Failed to fetch ranked resorts', {
          page,
          error: errorMessage,
          durationMs,
        });

        setError(
          err instanceof Error ? err : new Error('An unexpected error occurred')
        );
        // Don't clear existing resorts on error when loading more
        if (!append) {
          setResorts([]);
          setHasMore(false);
          setTotalCount(0);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [pageSize, includeLost, isFeatureEnabled, log, thresholds.slowApiThreshold]
  );

  /**
   * Load the next page
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingRef.current || !isFeatureEnabled) {
      return;
    }
    await fetchPage(currentPage + 1, true);
  }, [hasMore, currentPage, fetchPage, isFeatureEnabled]);

  /**
   * Reset and fetch from page 1
   */
  const reset = useCallback(async () => {
    if (!isFeatureEnabled) {
      return;
    }
    setResorts([]);
    setCurrentPage(1);
    setHasMore(true);
    await fetchPage(1, false);
  }, [fetchPage, isFeatureEnabled]);

  // Track if initial fetch has been done for this mount
  const hasFetchedRef = useRef<boolean>(false);

  // Initial fetch - runs on every mount
  useEffect(() => {
    // Reset fetch tracking on mount
    hasFetchedRef.current = false;

    if (!enabled || !isFeatureEnabled) {
      setIsLoading(false);
      return;
    }

    // Only fetch if we haven't already for this mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchPage(1, false);
    }

    // Cleanup on unmount to ensure refetch on next mount
    return () => {
      hasFetchedRef.current = false;
    };
  }, [enabled, isFeatureEnabled, fetchPage]);

  return {
    resorts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    totalCount,
    currentPage,
    loadMore,
    reset,
  };
}
