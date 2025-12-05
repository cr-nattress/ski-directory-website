# Story 35.4: SkiShopsList Component with Expansion

## Priority: High

## Phase: UI

## Context

Create a list component that displays multiple ski shops with progressive disclosure - showing an initial set (3 shops) with a "Show More" button to reveal the rest.

## Requirements

1. Show configurable initial count (default: 3)
2. "Show More" button to reveal remaining shops
3. Optional service summary badges at top
4. Empty state handling
5. Loading state support

## Implementation

### File: `apps/v1/components/resort-detail/SkiShopsList.tsx`

```tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Store } from 'lucide-react';
import { SkiShop, SkiShopsListProps, calculateServicesSummary } from '@/lib/types/ski-shop';
import { SkiShopCard } from './SkiShopCard';
import { cn } from '@/lib/utils';

interface SkiShopsListComponentProps extends SkiShopsListProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export function SkiShopsList({
  shops,
  initialCount = 3,
  showServiceSummary = true,
  variant = 'full',
  className,
}: SkiShopsListComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle empty state
  if (!shops || shops.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No ski shops found nearby</p>
      </div>
    );
  }

  const serviceSummary = calculateServicesSummary(shops);
  const visibleShops = isExpanded ? shops : shops.slice(0, initialCount);
  const remainingCount = shops.length - initialCount;
  const hasMore = remainingCount > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Service Summary Badges */}
      {showServiceSummary && (
        <div className="flex flex-wrap gap-2 text-sm">
          {serviceSummary.rental > 0 && (
            <ServiceBadge count={serviceSummary.rental} label="Rental" />
          )}
          {serviceSummary.retail > 0 && (
            <ServiceBadge count={serviceSummary.retail} label="Retail" />
          )}
          {serviceSummary.repair > 0 && (
            <ServiceBadge count={serviceSummary.repair} label="Repair" />
          )}
          {serviceSummary.demo > 0 && (
            <ServiceBadge count={serviceSummary.demo} label="Demo" />
          )}
        </div>
      )}

      {/* Shop Cards */}
      <div className="space-y-3">
        {visibleShops.map((shop) => (
          <SkiShopCard
            key={shop.slug}
            shop={shop}
            variant={variant}
            showActions={variant === 'full'}
          />
        ))}
      </div>

      {/* Show More / Show Less Button */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'py-3 px-4 rounded-lg',
            'bg-gray-50 hover:bg-gray-100 active:bg-gray-200',
            'text-gray-700 font-medium text-sm',
            'transition-colors',
            'min-h-[44px]' // Touch target
          )}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <span>View All {shops.length} Shops</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Service count badge
 */
function ServiceBadge({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
      <span className="font-semibold mr-1">{count}</span>
      {label}
    </span>
  );
}

/**
 * Loading skeleton for the list
 */
export function SkiShopsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Service badges skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-11 w-full bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-11 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkiShopsList;
```

### Wireframe: Collapsed State

```
┌─────────────────────────────────────┐
│ [7 Rental] [5 Retail] [4 Repair]   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Shop 1 (on-mountain)            │ │
│ │ [Call] [Directions]             │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Shop 2                          │ │
│ │ [Call] [Directions]             │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Shop 3                          │ │
│ │ [Call] [Directions]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    View All 10 Shops  ▼       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Wireframe: Expanded State

```
┌─────────────────────────────────────┐
│ [7 Rental] [5 Retail] [4 Repair]   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Shop 1 (on-mountain)            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Shop 2                          │ │
│ └─────────────────────────────────┘ │
│        ... shops 3-9 ...            │
│ ┌─────────────────────────────────┐ │
│ │ Shop 10                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐  │
│  │       Show Less  ▲            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| shops | SkiShop[] | required | Array of ski shops |
| initialCount | number | 3 | Shops visible before expansion |
| showServiceSummary | boolean | true | Show service count badges |
| variant | 'full' \| 'compact' | 'full' | Card display variant |
| className | string | undefined | Additional CSS classes |

## Acceptance Criteria

- [ ] Displays initial shops (default 3)
- [ ] "View All X Shops" button shows when more exist
- [ ] Button expands to show all shops
- [ ] "Show Less" collapses back to initial count
- [ ] Service summary shows accurate counts
- [ ] Empty state displayed when no shops
- [ ] Loading skeleton available
- [ ] Touch target >= 44px on button

## Testing

1. Test with 0 shops (empty state)
2. Test with 2 shops (no expand button)
3. Test with 10 shops (expand/collapse)
4. Test service summary counts
5. Test on mobile viewport

## Effort: Small (1-2 hours)
