/**
 * @module useResortConditions
 * @purpose Fetch real-time lift/weather conditions from Liftie data
 * @context Resort detail page conditions display
 *
 * @sideeffects
 * - Network request to /api/resorts/[slug]/conditions
 * - Uses effect cleanup to prevent state updates on unmount
 */
'use client';

import { useState, useEffect } from 'react';
import type { ResortConditionsRow } from '@/types/supabase';

interface UseResortConditionsResult {
  /** Real-time conditions data (lifts, weather, webcams) */
  conditions: ResortConditionsRow | null;
  /** True while fetching */
  loading: boolean;
  /** Error if fetch failed (404 is not an error - means no conditions) */
  error: Error | null;
}

/**
 * Hook to fetch real-time conditions for a resort
 *
 * @param slug - Resort URL slug
 * @returns Conditions data with loading/error states
 *
 * @decision
 * 404 responses are treated as "no conditions available" (not an error).
 * Not all resorts have Liftie data.
 *
 * @example
 * const { conditions, loading, error } = useResortConditions('vail');
 * if (conditions) {
 *   return <LiveConditions conditions={conditions} />;
 * }
 */
export function useResortConditions(slug: string): UseResortConditionsResult {
  const [conditions, setConditions] = useState<ResortConditionsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if no slug or not in browser
    if (!slug || typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchConditions() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/resorts/${slug}/conditions`);

        if (cancelled) return;

        if (!response.ok) {
          if (response.status === 404) {
            // No conditions available, not an error
            setConditions(null);
            return;
          }
          throw new Error(`Failed to fetch conditions: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setConditions(data.conditions);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setConditions(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchConditions();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { conditions, loading, error };
}
