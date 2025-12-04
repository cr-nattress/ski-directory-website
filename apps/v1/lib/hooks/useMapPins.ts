/**
 * @module useMapPins
 * @purpose Fetch optimized map pin data with localStorage caching
 * @context Interactive map view on landing page
 *
 * @sideeffects
 * - Network request to Supabase for map pins
 * - localStorage read/write for caching (5-minute TTL)
 *
 * @decision
 * Use localStorage caching to reduce API calls when users toggle
 * between cards and map views frequently. 5-minute TTL balances
 * freshness with performance.
 *
 * Cache data is validated with Zod schemas to ensure data integrity
 * and handle schema migrations gracefully.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { resortService } from '@/lib/api/resort-service';
import { ResortMapPin } from '@/lib/types';
import { cachedMapPinsSchema, type CachedMapPins } from '@/lib/validation/api-schemas';

const CACHE_KEY = 'ski-map-pins';
/** Cache TTL: 5 minutes */
const CACHE_DURATION_MS = 5 * 60 * 1000;

interface UseMapPinsResult {
  /** Array of resort map pins */
  pins: ResortMapPin[];
  /** True while fetching data */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Bypass cache and refetch from API */
  refetch: () => void;
}

/**
 * Hook for fetching map pin data with localStorage caching
 *
 * @returns Map pins with loading/error states
 *
 * @example
 * const { pins, isLoading, error, refetch } = useMapPins();
 * if (isLoading) return <MapSkeleton />;
 * return <ResortMapView pins={pins} />;
 */
export function useMapPins(): UseMapPinsResult {
  const [pins, setPins] = useState<ResortMapPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPins = useCallback(async (bypassCache = false) => {
    try {
      // Check cache first (only in browser)
      if (!bypassCache && typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Validate cached data structure with Zod
            const result = cachedMapPinsSchema.safeParse(parsed);
            if (result.success) {
              const { pins: cachedPins, timestamp } = result.data;
              if (Date.now() - timestamp < CACHE_DURATION_MS) {
                setPins(cachedPins as ResortMapPin[]);
                setIsLoading(false);
                return;
              }
            } else {
              // Schema validation failed - cache is outdated or corrupted
              localStorage.removeItem(CACHE_KEY);
            }
          } catch {
            // Invalid JSON, remove cache and continue to fetch
            localStorage.removeItem(CACHE_KEY);
          }
        }
      }

      setIsLoading(true);
      setError(null);

      const response = await resortService.getMapPins();

      if (response.status === 'success') {
        setPins(response.data);
        // Cache the result (only in browser)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              pins: response.data,
              timestamp: Date.now(),
            }));
          } catch {
            // localStorage might be full or disabled, ignore
          }
        }
      } else {
        setError(new Error(response.message || 'Failed to fetch map pins'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch map pins'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  const refetch = useCallback(() => {
    fetchPins(true);
  }, [fetchPins]);

  return { pins, isLoading, error, refetch };
}
