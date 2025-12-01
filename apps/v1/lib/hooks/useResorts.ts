'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { resortService } from '../api/resort-service';
import {
  Resort,
  UseResortsResult,
  ResortQueryOptions,
  PaginatedResponse,
} from '../api/types';
import { useLogger } from '@/lib/hooks/useLogger';
import { getObservabilityConfig } from '@/lib/config/observability';

/**
 * Hook to fetch all resorts with optional filtering, sorting, and pagination
 *
 * @example
 * ```tsx
 * // Basic usage - fetch all resorts
 * const { resorts, isLoading, error } = useResorts();
 *
 * // With filters
 * const { resorts } = useResorts({
 *   filters: { passAffiliation: ['epic'], maxDistance: 100 },
 *   sortBy: 'rating',
 *   sortOrder: 'desc'
 * });
 *
 * // With pagination
 * const { resorts, pagination } = useResorts({
 *   page: 1,
 *   pageSize: 6
 * });
 * ```
 */
export function useResorts(options: ResortQueryOptions = {}): UseResortsResult {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Resort>['pagination'] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Logger for this hook
  const log = useLogger({ component: 'useResorts' });
  const { thresholds } = getObservabilityConfig();

  // Extract filter values for dependency tracking
  const search = options.filters?.search;
  const passAffiliation = options.filters?.passAffiliation?.join(',');
  const maxDistance = options.filters?.maxDistance;
  const minRating = options.filters?.minRating;
  const status = options.filters?.status;
  const tags = options.filters?.tags?.join(',');
  const sortBy = options.sortBy;
  const sortOrder = options.sortOrder;
  const page = options.page;
  const pageSize = options.pageSize;

  // Memoize options to prevent unnecessary re-fetches
  const memoizedOptions = useMemo(
    () => JSON.stringify(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, passAffiliation, maxDistance, minRating, status, tags, sortBy, sortOrder, page, pageSize]
  );

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    const parsedOptions = JSON.parse(memoizedOptions) as ResortQueryOptions;
    log.info('Fetching resorts', {
      page: parsedOptions.page,
      pageSize: parsedOptions.pageSize,
      hasFilters: !!parsedOptions.filters,
    });

    try {
      const response = await resortService.getResorts(parsedOptions);
      const durationMs = Math.round(performance.now() - startTime);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }

      log.info('Resorts fetch completed', {
        count: response.data.length,
        totalCount: response.pagination?.totalItems,
        durationMs,
      });

      if (durationMs > thresholds.slowApiThreshold) {
        log.warn('Slow response detected for resorts fetch', {
          durationMs,
          threshold: thresholds.slowApiThreshold,
        });
      }

      setResorts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

      log.error('Failed to fetch resorts', {
        error: errorMessage,
        durationMs,
      });

      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedOptions, log, thresholds.slowApiThreshold]);

  // Track if initial fetch has been done for this mount
  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    hasFetchedRef.current = false;

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchResorts();
    }

    return () => {
      hasFetchedRef.current = false;
    };
  }, [fetchResorts]);

  return {
    resorts,
    isLoading,
    error,
    pagination,
    refetch: fetchResorts,
  };
}

/**
 * Hook to fetch all resorts without pagination
 * Useful for dropdowns, maps, or when you need all data at once
 *
 * @example
 * ```tsx
 * const { resorts, isLoading } = useAllResorts();
 * ```
 */
export function useAllResorts(): Omit<UseResortsResult, 'pagination'> {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const log = useLogger({ component: 'useAllResorts' });
  const { thresholds } = getObservabilityConfig();

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    log.info('Fetching all resorts');

    try {
      const response = await resortService.getAllResorts();
      const durationMs = Math.round(performance.now() - startTime);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }

      log.info('All resorts fetch completed', {
        count: response.data.length,
        durationMs,
      });

      if (durationMs > thresholds.slowApiThreshold) {
        log.warn('Slow response detected for all resorts fetch', { durationMs });
      }

      setResorts(response.data);
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      log.error('Failed to fetch all resorts', {
        error: err instanceof Error ? err.message : 'Unknown error',
        durationMs,
      });
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
    } finally {
      setIsLoading(false);
    }
  }, [log, thresholds.slowApiThreshold]);

  // Track if initial fetch has been done for this mount
  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    hasFetchedRef.current = false;

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchResorts();
    }

    return () => {
      hasFetchedRef.current = false;
    };
  }, [fetchResorts]);

  return {
    resorts,
    isLoading,
    error,
    refetch: fetchResorts,
  };
}

/**
 * Hook to fetch featured resorts
 *
 * @example
 * ```tsx
 * const { resorts, isLoading } = useFeaturedResorts(3);
 * ```
 */
export function useFeaturedResorts(limit: number = 3): Omit<UseResortsResult, 'pagination'> {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const log = useLogger({ component: 'useFeaturedResorts' });
  const { thresholds } = getObservabilityConfig();

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    log.info('Fetching featured resorts', { limit });

    try {
      const response = await resortService.getFeaturedResorts(limit);
      const durationMs = Math.round(performance.now() - startTime);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch featured resorts');
      }

      log.info('Featured resorts fetch completed', {
        count: response.data.length,
        durationMs,
      });

      if (durationMs > thresholds.slowApiThreshold) {
        log.warn('Slow response detected for featured resorts', { durationMs });
      }

      setResorts(response.data);
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      log.error('Failed to fetch featured resorts', {
        error: err instanceof Error ? err.message : 'Unknown error',
        durationMs,
      });
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit, log, thresholds.slowApiThreshold]);

  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    hasFetchedRef.current = false;

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchResorts();
    }

    return () => {
      hasFetchedRef.current = false;
    };
  }, [fetchResorts]);

  return {
    resorts,
    isLoading,
    error,
    refetch: fetchResorts,
  };
}

/**
 * Hook to fetch nearby resorts within a distance
 *
 * @example
 * ```tsx
 * const { resorts, isLoading } = useNearbyResorts(100); // within 100 miles
 * ```
 */
export function useNearbyResorts(maxDistance: number): Omit<UseResortsResult, 'pagination'> {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const log = useLogger({ component: 'useNearbyResorts' });
  const { thresholds } = getObservabilityConfig();

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    log.info('Fetching nearby resorts', { maxDistance });

    try {
      const response = await resortService.getNearbyResorts(maxDistance);
      const durationMs = Math.round(performance.now() - startTime);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch nearby resorts');
      }

      log.info('Nearby resorts fetch completed', {
        count: response.data.length,
        maxDistance,
        durationMs,
      });

      if (durationMs > thresholds.slowApiThreshold) {
        log.warn('Slow response detected for nearby resorts', { durationMs });
      }

      setResorts(response.data);
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      log.error('Failed to fetch nearby resorts', {
        error: err instanceof Error ? err.message : 'Unknown error',
        durationMs,
      });
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
    } finally {
      setIsLoading(false);
    }
  }, [maxDistance, log, thresholds.slowApiThreshold]);

  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    hasFetchedRef.current = false;

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchResorts();
    }

    return () => {
      hasFetchedRef.current = false;
    };
  }, [fetchResorts]);

  return {
    resorts,
    isLoading,
    error,
    refetch: fetchResorts,
  };
}

/**
 * Hook to fetch resorts by pass type
 *
 * @example
 * ```tsx
 * const { resorts, isLoading } = useResortsByPass('epic');
 * const { resorts: ikonResorts } = useResortsByPass('ikon');
 * ```
 */
export function useResortsByPass(passType: string): Omit<UseResortsResult, 'pagination'> {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const log = useLogger({ component: 'useResortsByPass' });
  const { thresholds } = getObservabilityConfig();

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    log.info('Fetching resorts by pass', { passType });

    try {
      const response = await resortService.getResortsByPass(passType);
      const durationMs = Math.round(performance.now() - startTime);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }

      log.info('Resorts by pass fetch completed', {
        passType,
        count: response.data.length,
        durationMs,
      });

      if (durationMs > thresholds.slowApiThreshold) {
        log.warn('Slow response detected for resorts by pass', { passType, durationMs });
      }

      setResorts(response.data);
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      log.error('Failed to fetch resorts by pass', {
        passType,
        error: err instanceof Error ? err.message : 'Unknown error',
        durationMs,
      });
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
    } finally {
      setIsLoading(false);
    }
  }, [passType, log, thresholds.slowApiThreshold]);

  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    hasFetchedRef.current = false;

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchResorts();
    }

    return () => {
      hasFetchedRef.current = false;
    };
  }, [fetchResorts]);

  return {
    resorts,
    isLoading,
    error,
    refetch: fetchResorts,
  };
}
