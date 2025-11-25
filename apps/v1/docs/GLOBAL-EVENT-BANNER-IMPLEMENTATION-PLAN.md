# Global Event Banner - Implementation Blueprint

## Executive Summary

This document provides a comprehensive implementation plan for adding a **Global Event Banner** system to the Ski Colorado ski resort directory. The banner will display contextual alerts (snow reports, weather warnings, safety notices, system alerts) across all routes, positioned directly below the header.

---

## Table of Contents

1. [Architectural Analysis](#architectural-analysis)
2. [Implementation Strategy](#implementation-strategy)
3. [File Tree Modifications](#file-tree-modifications)
4. [TypeScript Interfaces](#typescript-interfaces)
5. [Component Implementation](#component-implementation)
6. [Hook Implementation](#hook-implementation)
7. [API Service Implementation](#api-service-implementation)
8. [Styling & Animation](#styling--animation)
9. [localStorage Strategy](#localstorage-strategy)
10. [Integration Steps](#integration-steps)
11. [Testing Checklist](#testing-checklist)

---

## Architectural Analysis

### Current Architecture

**Layout Structure:**
- `app/layout.tsx` - Server Component (minimal, fonts + children wrapper)
- Header is NOT in layout - each page imports Header individually
- Dashboard: `app/page.tsx` → `<Header variant="solid" />`
- Resort Detail: `components/resort-detail/ResortDetail.tsx` → `<Header variant="solid" />`

**State Management:**
- No global state (no Context, Redux, Zustand)
- React hooks pattern for data fetching (`lib/hooks/`)
- API service layer simulates backend (`lib/api/resort-service.ts`)

**Styling:**
- Tailwind CSS with custom colors: `ski-blue`, `powder-blue`, `epic-red`, `ikon-orange`, `success-green`
- `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge)
- Custom `container-custom` class for consistent max-width

**Key Pattern Recognition:**
```tsx
// Hooks follow this pattern:
export function useXxx(): UseXxxResult {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // ...
}
```

### Design Decision: Where to Place the Banner

**Option A: In layout.tsx (Rejected)**
- Would require converting to Client Component
- Breaks Next.js optimization patterns
- Requires significant refactoring

**Option B: Create a Wrapper Component (Selected)**
- Create `PageWrapper` component that includes Header + EventBanner
- Update all pages to use PageWrapper instead of Header
- Clean separation of concerns
- Maintains Server Component layout

**Option C: Create Context Provider (Alternative)**
- Add EventBannerProvider in layout
- More complex but enables cross-component communication
- Overkill for current requirements

---

## Implementation Strategy

### Phase 1: Core Infrastructure
1. Define TypeScript interfaces for alerts
2. Create mock alert data service
3. Implement localStorage utility for dismissals

### Phase 2: Component Development
4. Build `EventBanner` component with animations
5. Build `PageWrapper` component
6. Create `useEventBanner` hook

### Phase 3: Integration
7. Update `app/page.tsx` to use PageWrapper
8. Update `ResortDetail.tsx` to use PageWrapper
9. Add Tailwind animation utilities

### Phase 4: Enhancement (Future)
10. Connect to real APIs (weather, snow, NWS)
11. Add priority-based stacking
12. Implement resort-specific alerts

---

## File Tree Modifications

```
apps/v1/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # ADD: Alert types
│   │   ├── alert-service.ts            # NEW: Alert fetching service
│   │   └── resort-service.ts           # (unchanged)
│   ├── hooks/
│   │   ├── index.ts                    # ADD: export useEventBanner
│   │   └── useEventBanner.ts           # NEW: Alert hook
│   └── utils.ts                        # ADD: localStorage helpers
├── components/
│   ├── EventBanner.tsx                 # NEW: Main banner component
│   ├── PageWrapper.tsx                 # NEW: Header + Banner wrapper
│   └── Header.tsx                      # (unchanged)
├── app/
│   ├── page.tsx                        # MODIFY: Use PageWrapper
│   ├── globals.css                     # ADD: Animation keyframes
│   └── colorado/
│       └── [slug]/
│           └── page.tsx                # (unchanged - uses ResortDetail)
└── tailwind.config.ts                  # ADD: Custom animation
```

---

## TypeScript Interfaces

### `lib/api/types.ts` (additions)

```typescript
// Alert Types
export type AlertType = 'info' | 'snow-report' | 'weather' | 'safety' | 'system';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertSource = 'manual' | 'weather-api' | 'snow-api' | 'nws-api' | 'system';

export interface EventAlert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  source: AlertSource;

  // Content
  title: string;
  message: string;

  // Optional link
  linkText?: string;
  linkUrl?: string;

  // Targeting (optional - for future resort-specific alerts)
  resortSlug?: string;      // null = global, specific = resort-only

  // Timing
  startsAt: string;         // ISO date string
  expiresAt: string;        // ISO date string

  // Behavior
  isDismissible: boolean;
  isPersistent: boolean;    // If true, shows even after dismiss until expires

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface UseEventBannerResult {
  alerts: EventAlert[];
  activeAlert: EventAlert | null;
  isLoading: boolean;
  error: Error | null;
  dismissAlert: (alertId: string) => void;
  refetch: () => Promise<void>;
}

export interface AlertApiResponse {
  data: EventAlert[];
  status: 'success' | 'error';
  message?: string;
}
```

---

## Component Implementation

### `components/EventBanner.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Snowflake, AlertTriangle, Info, Cloud, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventAlert, AlertType } from '@/lib/api/types';

interface EventBannerProps {
  alert: EventAlert | null;
  onDismiss: (alertId: string) => void;
}

const alertConfig: Record<AlertType, {
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  'info': {
    icon: Info,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  'snow-report': {
    icon: Snowflake,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-200',
  },
  'weather': {
    icon: Cloud,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
  'safety': {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  'system': {
    icon: Bell,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
  },
};

export function EventBanner({ alert, onDismiss }: EventBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (alert) {
      // Small delay to trigger entrance animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [alert]);

  const handleDismiss = () => {
    if (!alert) return;

    setIsExiting(true);
    // Wait for exit animation before calling onDismiss
    setTimeout(() => {
      onDismiss(alert.id);
      setIsExiting(false);
    }, 300);
  };

  if (!alert) return null;

  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'w-full border-b overflow-hidden transition-all duration-300 ease-out',
        config.bgColor,
        config.borderColor,
        isVisible && !isExiting
          ? 'max-h-24 opacity-100'
          : 'max-h-0 opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="container-custom py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Icon + Content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className={cn('w-5 h-5 flex-shrink-0', config.textColor)} />

            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', config.textColor)}>
                {alert.title}
                {alert.message && (
                  <span className="font-normal ml-1.5">
                    — {alert.message}
                  </span>
                )}
              </p>
            </div>

            {/* Optional Link */}
            {alert.linkUrl && alert.linkText && (
              <a
                href={alert.linkUrl}
                className={cn(
                  'text-sm font-medium underline hover:no-underline flex-shrink-0',
                  config.textColor
                )}
              >
                {alert.linkText}
              </a>
            )}
          </div>

          {/* Dismiss Button */}
          {alert.isDismissible && (
            <button
              onClick={handleDismiss}
              className={cn(
                'p-1 rounded-full hover:bg-black/5 transition-colors flex-shrink-0',
                config.textColor
              )}
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### `components/PageWrapper.tsx`

```tsx
'use client';

import { Header } from './Header';
import { EventBanner } from './EventBanner';
import { useEventBanner } from '@/lib/hooks';

interface PageWrapperProps {
  headerVariant?: 'overlay' | 'solid';
  resortSlug?: string;  // For resort-specific alerts
  children?: React.ReactNode;
}

export function PageWrapper({
  headerVariant = 'solid',
  resortSlug,
  children
}: PageWrapperProps) {
  const { activeAlert, dismissAlert } = useEventBanner({ resortSlug });

  return (
    <>
      <Header variant={headerVariant} />
      <EventBanner alert={activeAlert} onDismiss={dismissAlert} />
      {children}
    </>
  );
}
```

---

## Hook Implementation

### `lib/hooks/useEventBanner.ts`

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { EventAlert, UseEventBannerResult } from '@/lib/api/types';
import { alertService } from '@/lib/api/alert-service';
import { getDismissedAlertIds, addDismissedAlertId } from '@/lib/utils';

interface UseEventBannerOptions {
  resortSlug?: string;
  pollInterval?: number;  // ms, default 5 minutes
}

export function useEventBanner(
  options: UseEventBannerOptions = {}
): UseEventBannerResult {
  const { resortSlug, pollInterval = 5 * 60 * 1000 } = options;

  const [alerts, setAlerts] = useState<EventAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await alertService.getActiveAlerts({ resortSlug });

      if (response.status === 'success') {
        // Filter out dismissed alerts
        const dismissedIds = getDismissedAlertIds();
        const activeAlerts = response.data.filter(
          alert => !dismissedIds.includes(alert.id) || alert.isPersistent
        );
        setAlerts(activeAlerts);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch alerts'));
    } finally {
      setIsLoading(false);
    }
  }, [resortSlug]);

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
    addDismissedAlertId(alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Get highest priority active alert
  const activeAlert = alerts.length > 0
    ? alerts.reduce((highest, current) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[current.priority] > priorityOrder[highest.priority]
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
```

### `lib/hooks/index.ts` (additions)

```typescript
// Add this export
export { useEventBanner } from './useEventBanner';

// Add type export
export type { UseEventBannerResult } from '../api/types';
```

---

## API Service Implementation

### `lib/api/alert-service.ts`

```typescript
import { EventAlert, AlertApiResponse } from './types';

// Mock alerts for development - replace with real API calls later
const mockAlerts: EventAlert[] = [
  {
    id: 'alert-snow-001',
    type: 'snow-report',
    priority: 'high',
    source: 'snow-api',
    title: 'Fresh Powder Alert',
    message: '12-18" expected across all Front Range resorts tonight',
    linkText: 'View Snow Report',
    linkUrl: '#',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isDismissible: true,
    isPersistent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'alert-weather-001',
    type: 'weather',
    priority: 'medium',
    source: 'weather-api',
    title: 'Winter Storm Watch',
    message: 'Heavy snowfall and reduced visibility expected Tuesday-Wednesday',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    isDismissible: true,
    isPersistent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'alert-safety-001',
    type: 'safety',
    priority: 'critical',
    source: 'nws-api',
    title: 'Avalanche Warning',
    message: 'Considerable avalanche danger above treeline in backcountry zones',
    linkText: 'CAIC Report',
    linkUrl: 'https://avalanche.state.co.us/',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    isDismissible: false,
    isPersistent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface GetAlertsOptions {
  resortSlug?: string;
}

export const alertService = {
  async getActiveAlerts(options: GetAlertsOptions = {}): Promise<AlertApiResponse> {
    await delay(100); // Simulate network delay

    const now = new Date();

    let activeAlerts = mockAlerts.filter(alert => {
      const startsAt = new Date(alert.startsAt);
      const expiresAt = new Date(alert.expiresAt);
      return now >= startsAt && now <= expiresAt;
    });

    // Filter by resort if specified
    if (options.resortSlug) {
      activeAlerts = activeAlerts.filter(
        alert => !alert.resortSlug || alert.resortSlug === options.resortSlug
      );
    } else {
      // Global page - only show global alerts
      activeAlerts = activeAlerts.filter(alert => !alert.resortSlug);
    }

    // Sort by priority (critical first)
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    activeAlerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return {
      data: activeAlerts,
      status: 'success',
    };
  },

  async dismissAlert(alertId: string): Promise<AlertApiResponse> {
    await delay(50);
    // In real implementation, this would update server-side state
    return {
      data: [],
      status: 'success',
      message: `Alert ${alertId} dismissed`,
    };
  },
};
```

---

## Styling & Animation

### `app/globals.css` (additions)

```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  /* Event Banner animations */
  .animate-slide-down {
    animation: slideDown 0.3s ease-out forwards;
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out forwards;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 6rem;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    max-height: 6rem;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
}
```

### `tailwind.config.ts` (additions)

```typescript
// Add to theme.extend:
animation: {
  'slide-down': 'slideDown 0.3s ease-out forwards',
  'slide-up': 'slideUp 0.3s ease-out forwards',
},
keyframes: {
  slideDown: {
    from: { opacity: '0', maxHeight: '0', transform: 'translateY(-10px)' },
    to: { opacity: '1', maxHeight: '6rem', transform: 'translateY(0)' },
  },
  slideUp: {
    from: { opacity: '1', maxHeight: '6rem', transform: 'translateY(0)' },
    to: { opacity: '0', maxHeight: '0', transform: 'translateY(-10px)' },
  },
},
```

---

## localStorage Strategy

### `lib/utils.ts` (additions)

```typescript
// LocalStorage key for dismissed alerts
const DISMISSED_ALERTS_KEY = 'skicolorado_dismissed_alerts';

interface DismissedAlert {
  id: string;
  dismissedAt: string;
}

/**
 * Get list of dismissed alert IDs from localStorage
 * Automatically cleans up expired dismissals (older than 7 days)
 */
export function getDismissedAlertIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!stored) return [];

    const dismissals: DismissedAlert[] = JSON.parse(stored);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter out old dismissals
    const validDismissals = dismissals.filter(
      d => new Date(d.dismissedAt) > sevenDaysAgo
    );

    // Update storage if we cleaned up any
    if (validDismissals.length !== dismissals.length) {
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(validDismissals));
    }

    return validDismissals.map(d => d.id);
  } catch {
    return [];
  }
}

/**
 * Add an alert ID to the dismissed list
 */
export function addDismissedAlertId(alertId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const currentIds = getDismissedAlertIds();
    if (currentIds.includes(alertId)) return;

    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
    const dismissals: DismissedAlert[] = stored ? JSON.parse(stored) : [];

    dismissals.push({
      id: alertId,
      dismissedAt: new Date().toISOString(),
    });

    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissals));
  } catch {
    // Silently fail - localStorage might be full or disabled
  }
}

/**
 * Clear all dismissed alerts (useful for testing)
 */
export function clearDismissedAlerts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DISMISSED_ALERTS_KEY);
}
```

---

## Integration Steps

### Step 1: Update `app/page.tsx`

```tsx
// Before:
import { Header } from '@/components/Header';

// After:
import { PageWrapper } from '@/components/PageWrapper';

// Replace:
<main className="min-h-screen">
  <Header variant="solid" />
  ...
</main>

// With:
<main className="min-h-screen">
  <PageWrapper headerVariant="solid" />
  ...
</main>
```

### Step 2: Update `components/resort-detail/ResortDetail.tsx`

```tsx
// Before:
import { Header } from '@/components/Header';

// After:
import { PageWrapper } from '@/components/PageWrapper';

// Replace:
<div className="min-h-screen bg-white">
  <ResortStructuredData resort={resort} />
  <Header variant="solid" />
  ...
</div>

// With:
<div className="min-h-screen bg-white">
  <ResortStructuredData resort={resort} />
  <PageWrapper headerVariant="solid" resortSlug={resort.slug} />
  ...
</div>
```

### Step 3: Create all new files

1. `lib/api/types.ts` - Add alert type definitions
2. `lib/api/alert-service.ts` - Create alert service
3. `lib/hooks/useEventBanner.ts` - Create hook
4. `lib/hooks/index.ts` - Export hook
5. `lib/utils.ts` - Add localStorage helpers
6. `components/EventBanner.tsx` - Create component
7. `components/PageWrapper.tsx` - Create wrapper
8. `app/globals.css` - Add animations
9. `tailwind.config.ts` - Add animation config

---

## Testing Checklist

### Unit Tests
- [ ] `getDismissedAlertIds()` returns empty array on fresh localStorage
- [ ] `addDismissedAlertId()` persists to localStorage
- [ ] `getDismissedAlertIds()` filters out dismissals older than 7 days
- [ ] Alert priority sorting works correctly
- [ ] Expired alerts are filtered out

### Integration Tests
- [ ] Banner appears when there are active alerts
- [ ] Banner dismisses with animation on X click
- [ ] Dismissed alerts don't reappear on page refresh
- [ ] `isPersistent` alerts reappear after dismiss
- [ ] Resort-specific alerts only show on matching resort pages
- [ ] Global alerts show on all pages

### Visual/Manual Tests
- [ ] Slide-down animation is smooth (300ms)
- [ ] Slide-up animation on dismiss is smooth
- [ ] All alert types have correct color schemes
- [ ] Mobile responsive (text truncates appropriately)
- [ ] Dismiss button has hover state
- [ ] External links open in new tab

### Edge Cases
- [ ] No alerts - banner doesn't render (no empty space)
- [ ] Multiple alerts - highest priority shows
- [ ] localStorage disabled - graceful fallback
- [ ] Network error - error state handled
- [ ] SSR hydration - no mismatch warnings

---

## Future Enhancements

1. **Real API Integration**
   - Connect to OpenWeather API for weather alerts
   - Connect to CAIC API for avalanche warnings
   - Connect to NWS API for severe weather

2. **Admin Dashboard**
   - Create manual alerts
   - Schedule alert timing
   - Target specific resorts

3. **Alert Stacking**
   - Show multiple alerts with carousel
   - "2 more alerts" indicator
   - Expand to see all

4. **User Preferences**
   - Alert type preferences
   - Email/push notification opt-in
   - "Don't show snow reports" option

---

## Quick Start for Implementation

```bash
# 1. Create the new files in order
touch lib/api/alert-service.ts
touch lib/hooks/useEventBanner.ts
touch components/EventBanner.tsx
touch components/PageWrapper.tsx

# 2. Update existing files
# - lib/api/types.ts (add alert types)
# - lib/hooks/index.ts (export hook)
# - lib/utils.ts (add localStorage helpers)
# - app/globals.css (add animations)
# - tailwind.config.ts (add animation config)

# 3. Integrate
# - app/page.tsx (use PageWrapper)
# - components/resort-detail/ResortDetail.tsx (use PageWrapper)

# 4. Test
npm run dev
# Visit http://localhost:3000 - should see snow alert banner
```

---

*Document Version: 1.0*
*Last Updated: November 2024*
*Author: Claude Code*
