'use client';

import { useState, useEffect, useCallback } from 'react';
import { resortService } from '../api/resort-service';
import { RegionalStats, UseRegionalStatsResult } from '../api/types';

/**
 * Hook to fetch regional statistics for all resorts
 *
 * @example
 * ```tsx
 * const { stats, isLoading, error } = useRegionalStats();
 *
 * if (isLoading) return <StatsSkeleton />;
 * if (error) return <StatsError />;
 *
 * return (
 *   <div>
 *     <p>{stats.totalResorts} resorts</p>
 *     <p>{stats.openResorts} currently open</p>
 *     <p>{stats.avgSnowfall24h}" avg new snow</p>
 *   </div>
 * );
 * ```
 */
export function useRegionalStats(): UseRegionalStatsResult {
  const [stats, setStats] = useState<RegionalStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await resortService.getRegionalStats();

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch statistics');
      }

      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
