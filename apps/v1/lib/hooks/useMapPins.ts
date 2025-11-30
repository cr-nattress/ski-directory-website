'use client';

import { useState, useEffect, useCallback } from 'react';
import { resortService } from '@/lib/api/resort-service';
import { ResortMapPin } from '@/lib/mock-data/types';

const CACHE_KEY = 'ski-map-pins';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  pins: ResortMapPin[];
  timestamp: number;
}

interface UseMapPinsResult {
  pins: ResortMapPin[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching map pin data with localStorage caching
 * Cache expires after 5 minutes to balance freshness with performance
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
            const { pins: cachedPins, timestamp }: CachedData = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION_MS) {
              setPins(cachedPins);
              setIsLoading(false);
              return;
            }
          } catch {
            // Invalid cache, continue to fetch
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
