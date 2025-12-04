# Story 29.7: Add localStorage Cache Validation

## Priority: Medium

## Context

Cached data from localStorage is parsed and used without validating its structure. If the cache format changes or gets corrupted, this could cause runtime errors.

## Current State

**Location:** `apps/v1/lib/hooks/useMapPins.ts:60-73`

**Current Code:**
```typescript
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
    localStorage.removeItem(CACHE_KEY);
  }
}
```

## Requirements

1. Add runtime validation for cached data structure
2. Apply to all hooks using localStorage caching
3. Gracefully handle invalid cache data
4. Log cache validation failures for debugging

## Implementation

### Create Validation Utility

Create `apps/v1/lib/utils/cache-validation.ts`:

```typescript
import type { ResortMapPin } from '@/lib/types';

/**
 * Validate that data has the expected CachedData structure
 */
export function isValidCachedPins(data: unknown): data is {
  pins: ResortMapPin[];
  timestamp: number;
} {
  if (!data || typeof data !== 'object') return false;

  const d = data as Record<string, unknown>;

  // Check timestamp
  if (typeof d.timestamp !== 'number' || isNaN(d.timestamp)) return false;

  // Check pins array
  if (!Array.isArray(d.pins)) return false;

  // Validate first pin structure (spot check)
  if (d.pins.length > 0) {
    const firstPin = d.pins[0];
    if (
      typeof firstPin !== 'object' ||
      typeof firstPin.id !== 'string' ||
      typeof firstPin.slug !== 'string' ||
      typeof firstPin.name !== 'string'
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Validate cached view mode
 */
export function isValidViewMode(value: unknown): value is 'cards' | 'map' {
  return value === 'cards' || value === 'map';
}

/**
 * Validate cached dismissed alerts
 */
export function isValidDismissedAlerts(data: unknown): data is Array<{
  id: string;
  dismissedAt: string;
}> {
  if (!Array.isArray(data)) return false;

  return data.every(
    item =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.dismissedAt === 'string'
  );
}
```

### Update useMapPins Hook

```typescript
import { isValidCachedPins } from '@/lib/utils/cache-validation';
import { createLogger } from '@/lib/hooks/useLogger';

const log = createLogger('useMapPins');

// In fetchPins:
if (!bypassCache && typeof window !== 'undefined') {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);

      if (!isValidCachedPins(parsed)) {
        log.warn('Invalid cache structure, clearing', { cacheKey: CACHE_KEY });
        localStorage.removeItem(CACHE_KEY);
      } else if (Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
        log.debug('Using cached pins', { count: parsed.pins.length });
        setPins(parsed.pins);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      log.warn('Failed to parse cache', { error: String(e) });
      localStorage.removeItem(CACHE_KEY);
    }
  }
}
```

### Update useViewMode Hook

```typescript
import { isValidViewMode } from '@/lib/utils/cache-validation';

// In useEffect:
useEffect(() => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidViewMode(stored)) {
        setModeState(stored);
      }
    } catch {
      // localStorage might be disabled
    }
    setIsHydrated(true);
  }
}, []);
```

### Update Alert Dismissal Utils

In `apps/v1/lib/utils.ts`:

```typescript
import { isValidDismissedAlerts } from './utils/cache-validation';

export function getDismissedAlertIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!isValidDismissedAlerts(parsed)) {
      localStorage.removeItem(DISMISSED_ALERTS_KEY);
      return [];
    }

    // ... rest of function
  } catch {
    return [];
  }
}
```

## Acceptance Criteria

- [ ] Validation utility created with type guards
- [ ] useMapPins validates cache structure
- [ ] useViewMode validates stored value
- [ ] Alert dismissal utils validate structure
- [ ] Invalid cache is cleared gracefully
- [ ] Validation failures are logged

## Testing

1. Clear localStorage and reload - should fetch fresh
2. Manually corrupt localStorage value - should clear and refetch
3. Set invalid type in localStorage - should clear and use default
4. Check browser console for validation logs

## Effort: Small (< 2 hours)
