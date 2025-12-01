'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { resortService } from '../api/resort-service';
import {
  Resort,
  UseResortsResult,
  ResortQueryOptions,
  PaginatedResponse,
} from '../api/types';

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

    try {
      const parsedOptions = JSON.parse(memoizedOptions) as ResortQueryOptions;
      const response = await resortService.getResorts(parsedOptions);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }

      setResorts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedOptions]);

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

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await resortService.getAllResorts();

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }

      setResorts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await resortService.getFeaturedResorts(limit);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch featured resorts');
      }

      setResorts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

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

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await resortService.getNearbyResorts(maxDistance);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch nearby resorts');
      }

      setResorts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
    } finally {
      setIsLoading(false);
    }
  }, [maxDistance]);

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

  const fetchResorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await resortService.getResortsByPass(passType);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resorts');
      }

      setResorts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResorts([]);
    } finally {
      setIsLoading(false);
    }
  }, [passType]);

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
