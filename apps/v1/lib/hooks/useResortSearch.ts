'use client';

import { useState, useCallback, useRef } from 'react';
import { resortService } from '../api/resort-service';
import { Resort, UseResortSearchResult } from '../api/types';

/**
 * Hook for searching resorts with debouncing support
 *
 * @example
 * ```tsx
 * const { results, isLoading, search, clearResults } = useResortSearch();
 *
 * // In a search input
 * <input
 *   type="text"
 *   onChange={(e) => search(e.target.value)}
 *   placeholder="Search resorts..."
 * />
 *
 * // Display results
 * {results.map(resort => <SearchResult key={resort.id} resort={resort} />)}
 * ```
 */
export function useResortSearch(debounceMs: number = 300): UseResortSearchResult {
  const [results, setResults] = useState<Resort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Ref to track the latest search request
  const latestRequestRef = useRef<number>(0);
  // Ref for debounce timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(
    async (query: string) => {
      // Clear any pending debounced search
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If query is empty, clear results immediately
      if (!query || query.trim().length === 0) {
        setResults([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Show loading state immediately
      setIsLoading(true);

      // Debounce the actual API call
      timeoutRef.current = setTimeout(async () => {
        const requestId = ++latestRequestRef.current;

        try {
          const response = await resortService.searchResorts(query);

          // Only update state if this is still the latest request
          if (requestId !== latestRequestRef.current) {
            return;
          }

          if (response.status === 'error') {
            throw new Error(response.message || 'Search failed');
          }

          setResults(response.data);
          setError(null);
        } catch (err) {
          // Only update state if this is still the latest request
          if (requestId !== latestRequestRef.current) {
            return;
          }

          setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
          setResults([]);
        } finally {
          // Only update loading state if this is still the latest request
          if (requestId === latestRequestRef.current) {
            setIsLoading(false);
          }
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  const clearResults = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setResults([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}

/**
 * Hook for instant search (no debouncing)
 * Use this when you want immediate search results (e.g., for server-side filtering)
 *
 * @example
 * ```tsx
 * const { results, isLoading, search } = useInstantResortSearch();
 * ```
 */
export function useInstantResortSearch(): UseResortSearchResult {
  return useResortSearch(0);
}
