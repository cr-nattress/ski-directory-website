# Story 2.5: Create useAlertsQuery Hook

## Description
Create a TanStack Query-based hook for fetching alerts with polling, replacing the existing `useEventBanner` hook.

## Acceptance Criteria
- [ ] `useAlertsQuery` hook created using TanStack Query
- [ ] Supports polling interval via refetchInterval
- [ ] Returns compatible data shape
- [ ] Old hook continues to work

## Technical Details

### Files to Create

**`shared/api/queries/useAlertsQuery.ts`**
```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { alertService } from '@/lib/api/alert-service';
import { EventAlert } from '@/lib/api/types';
import { featureFlags } from '@/lib/config/feature-flags';
import { queryKeys } from '../queryKeys';

interface UseAlertsQueryOptions {
  resortSlug?: string;
  pollInterval?: number; // ms, default 5 minutes
  enabled?: boolean;
}

/**
 * Query hook for fetching active alerts with optional polling.
 *
 * @example
 * const { data: alerts, activeAlert, dismissAlert } = useAlertsQuery();
 * return <EventBanner alert={activeAlert} onDismiss={dismissAlert} />;
 */
export function useAlertsQuery(options: UseAlertsQueryOptions = {}) {
  const {
    resortSlug,
    pollInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true,
  } = options;

  const queryClient = useQueryClient();
  const isEnabled = enabled && featureFlags.alertBanner;

  const query = useQuery({
    queryKey: queryKeys.alerts.active(resortSlug),
    queryFn: async () => {
      const response = await alertService.getActiveAlerts({ resortSlug });
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch alerts');
      }
      return response.data;
    },
    enabled: isEnabled,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: isEnabled ? pollInterval : false,
  });

  // Get highest priority alert
  const activeAlert = query.data?.length
    ? query.data.reduce((highest, current) => {
        const priorityOrder: Record<string, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        return priorityOrder[current.priority] > priorityOrder[highest.priority]
          ? current
          : highest;
      })
    : null;

  // Dismiss alert by removing from cache (session only)
  const dismissAlert = useCallback(
    (alertId: string) => {
      queryClient.setQueryData<EventAlert[]>(
        queryKeys.alerts.active(resortSlug),
        (old) => old?.filter((alert) => alert.id !== alertId) ?? []
      );
    },
    [queryClient, resortSlug]
  );

  return {
    alerts: query.data ?? [],
    activeAlert,
    isLoading: query.isLoading,
    error: query.error,
    dismissAlert,
    refetch: query.refetch,
  };
}
```

### Files to Update (deprecation notice only)

**`lib/hooks/useEventBanner.ts`** - Add deprecation comment

## Migration Path
```tsx
// Before
const { activeAlert, dismissAlert } = useEventBanner({ resortSlug });

// After
const { activeAlert, dismissAlert } = useAlertsQuery({ resortSlug });
```

## Benefits Over Current Implementation
- Automatic polling management
- Shared cache across components
- No manual setInterval cleanup
- Better error handling

## Testing
- [ ] Alerts fetched correctly
- [ ] Polling works at configured interval
- [ ] Dismiss removes from cache
- [ ] Feature flag check works

## Estimate
Small (1-2 hours)
