'use client';

import { useState, useEffect } from 'react';
import type { ResortConditionsRow } from '@/types/supabase';

interface UseResortConditionsResult {
  conditions: ResortConditionsRow | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch real-time conditions for a resort
 */
export function useResortConditions(slug: string): UseResortConditionsResult {
  const [conditions, setConditions] = useState<ResortConditionsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchConditions() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/resorts/${slug}/conditions`);

        if (!response.ok) {
          if (response.status === 404) {
            // No conditions available, not an error
            setConditions(null);
            return;
          }
          throw new Error(`Failed to fetch conditions: ${response.status}`);
        }

        const data = await response.json();
        setConditions(data.conditions);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setConditions(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchConditions();
    }
  }, [slug]);

  return { conditions, loading, error };
}
