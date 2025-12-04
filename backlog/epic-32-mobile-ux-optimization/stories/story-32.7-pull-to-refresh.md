# Story 32.7: Implement Pull-to-Refresh on Lists

## Priority: Low

## Context

Native mobile apps typically support pull-to-refresh gestures for content lists. Adding this pattern to the resort grid and directory list views provides a familiar interaction for mobile users and allows manual data refresh without page reload.

## Current State

- No pull-to-refresh gesture support exists
- Users must reload page to refresh data
- Content relies on cache invalidation
- No visual feedback for data staleness

## Requirements

1. Add pull-to-refresh gesture on resort grid (home page)
2. Add pull-to-refresh gesture on directory list
3. Show loading spinner during refresh
4. Provide haptic feedback if available
5. Prevent browser's native pull-to-refresh interference
6. Only enable on mobile viewports

## Implementation

### 1. Create Pull-to-Refresh Hook

```tsx
// lib/hooks/usePullToRefresh.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Pull distance to trigger refresh
  disabled?: boolean;
}

interface UsePullToRefreshReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  pullProgress: number; // 0-1 for UI feedback
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    if (window.scrollY !== 0) return; // Only at top of page

    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Resistance formula for natural feel
      const distance = Math.min(diff * 0.5, threshold * 1.5);
      setPullDistance(distance);

      // Prevent native scroll while pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setIsPulling(false);
  }, [isPulling, disabled, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
}
```

### 2. Create Pull-to-Refresh Indicator Component

```tsx
// components/ui/PullToRefreshIndicator.tsx
'use client';

import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullProgress: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

export function PullToRefreshIndicator({
  pullProgress,
  isRefreshing,
  isPulling,
}: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="flex items-center justify-center py-4 transition-transform"
      style={{
        transform: `translateY(${Math.min(pullProgress * 60, 60)}px)`,
      }}
    >
      {isRefreshing ? (
        <Loader2 className="w-6 h-6 text-ski-blue animate-spin" />
      ) : (
        <div
          className={cn(
            'transition-transform duration-200',
            pullProgress >= 1 && 'rotate-180'
          )}
        >
          <ArrowDown
            className="w-6 h-6 text-gray-400"
            style={{ opacity: pullProgress }}
          />
        </div>
      )}
    </div>
  );
}
```

### 3. Integrate with Resort Grid

```tsx
// components/ResortGrid.tsx
'use client';

import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator';
import { useResorts } from '@/lib/hooks';

export function ResortGrid() {
  const { resorts, refetch } = useResorts();

  const {
    containerRef,
    isPulling,
    isRefreshing,
    pullProgress,
  } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
  });

  return (
    <div ref={containerRef} className="md:hidden">
      <PullToRefreshIndicator
        pullProgress={pullProgress}
        isRefreshing={isRefreshing}
        isPulling={isPulling}
      />

      {/* Resort grid content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {resorts.map((resort) => (
          <ResortCard key={resort.id} resort={resort} />
        ))}
      </div>
    </div>
  );
}
```

### 4. Prevent Browser Pull-to-Refresh

```css
/* globals.css */
html {
  overscroll-behavior-y: contain;
}
```

## Design Specifications

- **Pull threshold:** 80px to trigger refresh
- **Visual indicator:** Arrow icon that rotates 180° when threshold reached
- **Refresh state:** Spinning loader
- **Resistance:** 0.5x multiplier for natural feel
- **Haptic feedback:** 10ms vibration on trigger (if supported)

## Acceptance Criteria

- [ ] Pull-to-refresh works on resort grid (mobile only)
- [ ] Pull-to-refresh works on directory list (mobile only)
- [ ] Visual indicator shows pull progress
- [ ] Spinner displays during refresh
- [ ] Data actually refreshes after gesture
- [ ] Browser's native PTR doesn't interfere
- [ ] Desktop: Feature disabled (no gesture handling)
- [ ] Haptic feedback on supported devices

## Testing

1. Mobile viewport: Pull down from top of page
2. Verify indicator appears and shows progress
3. Pull past threshold - verify refresh triggers
4. Verify data updates after refresh
5. Test on iOS Safari - verify no double PTR
6. Test on Android Chrome - verify haptic works
7. Desktop: Verify no PTR behavior

## Libraries to Consider

Instead of custom implementation, consider:
- `react-pull-to-refresh` - Simple, lightweight
- `react-simple-pull-to-refresh` - More customizable
- `@smakss/react-scroll-direction` - For scroll detection

## Effort: Medium (2-4 hours)
