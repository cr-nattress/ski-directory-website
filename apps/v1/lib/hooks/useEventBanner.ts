'use client';

import { useState, useEffect, useCallback } from 'react';
import { EventAlert, UseEventBannerResult } from '@/lib/api/types';
import { alertService } from '@/lib/api/alert-service';
import { featureFlags } from '@/lib/config/feature-flags';

interface UseEventBannerOptions {
  resortSlug?: string;
  pollInterval?: number; // ms, default 5 minutes
}

export function useEventBanner(
  options: UseEventBannerOptions = {}
): UseEventBannerResult {
  const { resortSlug, pollInterval = 5 * 60 * 1000 } = options;

  // Check feature flag - if disabled, return empty state immediately
  const isAlertBannerEnabled = featureFlags.alertBanner;

  const [alerts, setAlerts] = useState<EventAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isAlertBannerEnabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlerts = useCallback(async () => {
    // Skip fetching if feature flag is disabled
    if (!isAlertBannerEnabled) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await alertService.getActiveAlerts({ resortSlug });

      if (response.status === 'success') {
        setAlerts(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch alerts')
      );
    } finally {
      setIsLoading(false);
    }
  }, [resortSlug, isAlertBannerEnabled]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Polling for updates
  useEffect(() => {
    const interval = setInterval(fetchAlerts, pollInterval);
    return () => clearInterval(interval);
  }, [fetchAlerts, pollInterval]);

  const dismissAlert = useCallback((alertId: string) => {
    // Only hide for current session, don't persist to localStorage
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  // Get highest priority active alert
  const activeAlert =
    alerts.length > 0
      ? alerts.reduce((highest, current) => {
          const priorityOrder: Record<string, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return priorityOrder[current.priority] >
            priorityOrder[highest.priority]
            ? current
            : highest;
        })
      : null;

  return {
    alerts,
    activeAlert,
    isLoading,
    error,
    dismissAlert,
    refetch: fetchAlerts,
  };
}
