/**
 * @module useInfiniteResorts
 * @purpose Infinite scroll pagination for resort listings
 * @context Landing page resort cards with scroll-to-load-more
 *
 * @sideeffects
 * - Network requests to Supabase (paginated)
 * - Accumulates results in memory across pages
 *
 * @pattern
 * Uses intersection observer sentinel element pattern.
 * Filter changes automatically reset pagination.
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { resortService } from '../api/resort-service';
import { Resort, ResortFilters, ResortSortBy, SortOrder } from '../api/types';
import { paginationConfig } from '../config/pagination';

/**
 * Options for useInfiniteResorts hook
 */
interface UseInfiniteResortsOptions {
  /** Number of items per page (defaults to config value) */
  pageSize?: number;
  /** Filters to apply to the query */
  filters?: ResortFilters;
  /** Field to sort by */
  sortBy?: ResortSortBy;
  /** Sort direction */
  sortOrder?: SortOrder;
  /** Whether to start fetching immediately */
  enabled?: boolean;
}

/**
 * Result from the useInfiniteResorts hook
 */
interface UseInfiniteResortsResult {
  /** Accumulated resorts from all loaded pages */
  resorts: Resort[];
  /** True only during initial load */
  isLoading: boolean;
  /** True when fetching additional pages */
  isLoadingMore: boolean;
  /** Whether more pages are available */
  hasMore: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Total count of resorts matching the query */
  totalCount: number;
  /** Current page number */
  currentPage: number;
  /** Load the next page of results */
  loadMore: () => Promise<void>;
  /** Reset and refetch from page 1 */
  reset: () => Promise<void>;
}

/**
 * Hook for infinite scroll pagination of resorts
 *
 * Accumulates results across pages for seamless infinite scroll.
 * Supports filters that reset pagination when changed.
 *
 * @example
 * ```tsx
 * function ResortList() {
 *   const {
 *     resorts,
 *     isLoading,
 *     isLoadingMore,
 *     hasMore,
 *     loadMore,
 *   } = useInfiniteResorts({ pageSize: 12 });
 *
 *   const sentinelRef = useIntersectionCallback(
 *     () => { if (hasMore && !isLoadingMore) loadMore(); },
 *     { enabled: hasMore && !isLoadingMore }
 *   );
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <>
 *       {resorts.map(resort => <ResortCard key={resort.id} resort={resort} />)}
 *       <div ref={sentinelRef} />
 *       {isLoadingMore && <Spinner />}
 *       {!hasMore && <p>All resorts loaded</p>}
 *     </>
 *   );
 * }
 * ```
 */
export function useInfiniteResorts(
  options: UseInfiniteResortsOptions = {}
): UseInfiniteResortsResult {
  const {
    pageSize = paginationConfig.landing.initialPageSize,
    filters,
    sortBy = 'name',
    sortOrder = 'asc',
    enabled = true,
  } = options;

  // State
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef<boolean>(false);

  // Track filters/sort to detect changes that require reset
  const filtersKey = JSON.stringify({ filters, sortBy, sortOrder });
  const prevFiltersKeyRef = useRef<string>(filtersKey);

  /**
   * Fetch a specific page of results
   */
  const fetchPage = useCallback(
    async (page: number, append: boolean = false) => {
      // Prevent duplicate requests
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      // Set appropriate loading state
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await resortService.getResorts({
          filters,
          sortBy,
          sortOrder,
          page,
          pageSize,
        });

        if (response.status === 'error') {
          throw new Error(response.message || 'Failed to fetch resorts');
        }

        const newResorts = response.data;
        const pagination = response.pagination;

        // Update state
        setResorts((prev) => (append ? [...prev, ...newResorts] : newResorts));
        setHasMore(pagination.hasNextPage);
        setTotalCount(pagination.totalItems);
        setCurrentPage(page);
        setError(null);
      } catch (err) {
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
    [filters, sortBy, sortOrder, pageSize]
  );

  /**
   * Load the next page
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingRef.current) {
      return;
    }
    await fetchPage(currentPage + 1, true);
  }, [hasMore, currentPage, fetchPage]);

  /**
   * Reset and fetch from page 1
   */
  const reset = useCallback(async () => {
    setResorts([]);
    setCurrentPage(1);
    setHasMore(true);
    await fetchPage(1, false);
  }, [fetchPage]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Reset when filters/sort change
  useEffect(() => {
    if (prevFiltersKeyRef.current !== filtersKey && enabled) {
      prevFiltersKeyRef.current = filtersKey;
      // Reset to page 1 with new filters
      setResorts([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchPage(1, false);
    }
  }, [filtersKey, enabled, fetchPage]);

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
