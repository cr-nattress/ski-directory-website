/**
 * @module useResort
 * @purpose Fetch single resort data by slug or ID
 * @context Resort detail pages and components needing full resort data
 *
 * @sideeffects Network request to Supabase
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { resortService } from '../api/resort-service';
import { Resort, UseResortResult } from '../api/types';

/**
 * Hook to fetch a single resort by slug
 *
 * @param slug - Resort URL slug (e.g., 'vail', 'breckenridge')
 * @returns Resort data with loading/error states
 *
 * @example
 * const { resort, isLoading, error, refetch } = useResort('vail');
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!resort) return <NotFound />;
 *
 * return <ResortDetail resort={resort} />;
 */
export function useResort(slug: string | undefined): UseResortResult {
  const [resort, setResort] = useState<Resort | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResort = useCallback(async () => {
    if (!slug) {
      setResort(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await resortService.getResortBySlug(slug);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resort');
      }

      setResort(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResort(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchResort();
  }, [fetchResort]);

  return {
    resort,
    isLoading,
    error,
    refetch: fetchResort,
  };
}

/**
 * Hook to fetch a single resort by ID
 *
 * @param id - Resort UUID from database
 * @returns Resort data with loading/error states
 *
 * @example
 * const { resort, isLoading, error } = useResortById('123e4567-e89b-...');
 */
export function useResortById(id: string | undefined): UseResortResult {
  const [resort, setResort] = useState<Resort | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResort = useCallback(async () => {
    if (!id) {
      setResort(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await resortService.getResortById(id);

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resort');
      }

      setResort(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setResort(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResort();
  }, [fetchResort]);

  return {
    resort,
    isLoading,
    error,
    refetch: fetchResort,
  };
}
