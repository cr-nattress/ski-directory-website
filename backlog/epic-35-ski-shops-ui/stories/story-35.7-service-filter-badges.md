# Story 35.7: Service Filter Badges

## Priority: Low

## Phase: Enhancement

## Context

Add interactive filter badges that allow users to filter the ski shops list by service type (Rental, Retail, Repair, Demo). This enhancement helps users quickly find shops that offer specific services.

## Requirements

1. Clickable filter badges in the service summary area
2. Multi-select support (can select multiple types)
3. Visual feedback for selected filters
4. Filter applied to visible shop list
5. Clear all filters option

## Implementation

### Update: `apps/v1/components/resort-detail/SkiShopsList.tsx`

Add filtering capability:

```tsx
'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Store, X } from 'lucide-react';
import {
  SkiShop,
  ShopType,
  calculateServicesSummary,
} from '@/lib/types/ski-shop';
import { SkiShopCard } from './SkiShopCard';
import { cn } from '@/lib/utils';

interface SkiShopsListProps {
  shops: SkiShop[];
  initialCount?: number;
  showServiceSummary?: boolean;
  enableFiltering?: boolean; // New prop
  variant?: 'full' | 'compact';
  className?: string;
}

export function SkiShopsList({
  shops,
  initialCount = 3,
  showServiceSummary = true,
  enableFiltering = false,
  variant = 'full',
  className,
}: SkiShopsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ShopType[]>([]);

  // Filter shops based on active filters
  const filteredShops = useMemo(() => {
    if (activeFilters.length === 0) return shops;
    return shops.filter((shop) =>
      activeFilters.some((filter) => shop.shop_type.includes(filter))
    );
  }, [shops, activeFilters]);

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
  const visibleShops = isExpanded
    ? filteredShops
    : filteredShops.slice(0, initialCount);
  const remainingCount = filteredShops.length - initialCount;
  const hasMore = remainingCount > 0;

  const toggleFilter = (type: ShopType) => {
    setActiveFilters((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
    // Reset expansion when filter changes
    setIsExpanded(false);
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setIsExpanded(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Service Summary / Filter Badges */}
      {showServiceSummary && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {serviceSummary.rental > 0 && (
              <FilterBadge
                count={serviceSummary.rental}
                label="Rental"
                type="rental"
                isActive={activeFilters.includes('rental')}
                onClick={enableFiltering ? () => toggleFilter('rental') : undefined}
                interactive={enableFiltering}
              />
            )}
            {serviceSummary.retail > 0 && (
              <FilterBadge
                count={serviceSummary.retail}
                label="Retail"
                type="retail"
                isActive={activeFilters.includes('retail')}
                onClick={enableFiltering ? () => toggleFilter('retail') : undefined}
                interactive={enableFiltering}
              />
            )}
            {serviceSummary.repair > 0 && (
              <FilterBadge
                count={serviceSummary.repair}
                label="Repair"
                type="repair"
                isActive={activeFilters.includes('repair')}
                onClick={enableFiltering ? () => toggleFilter('repair') : undefined}
                interactive={enableFiltering}
              />
            )}
            {serviceSummary.demo > 0 && (
              <FilterBadge
                count={serviceSummary.demo}
                label="Demo"
                type="demo"
                isActive={activeFilters.includes('demo')}
                onClick={enableFiltering ? () => toggleFilter('demo') : undefined}
                interactive={enableFiltering}
              />
            )}
          </div>

          {/* Active filters indicator */}
          {enableFiltering && activeFilters.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">
                Showing {filteredShops.length} of {shops.length}
              </span>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-ski-blue hover:underline"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* No results after filtering */}
      {filteredShops.length === 0 && activeFilters.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>No shops match your filters</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-ski-blue hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Shop Cards */}
      {filteredShops.length > 0 && (
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
      )}

      {/* Show More / Show Less Button */}
      {hasMore && filteredShops.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'py-3 px-4 rounded-lg',
            'bg-gray-50 hover:bg-gray-100 active:bg-gray-200',
            'text-gray-700 font-medium text-sm',
            'transition-colors',
            'min-h-[44px]'
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
              <span>View All {filteredShops.length} Shops</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Interactive filter badge
 */
interface FilterBadgeProps {
  count: number;
  label: string;
  type: ShopType;
  isActive: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

function FilterBadge({
  count,
  label,
  isActive,
  onClick,
  interactive = false,
}: FilterBadgeProps) {
  const baseClasses =
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors';

  const stateClasses = isActive
    ? 'bg-ski-blue text-white'
    : 'bg-gray-100 text-gray-700';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:bg-gray-200 active:bg-gray-300'
    : '';

  if (interactive && onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(baseClasses, stateClasses, interactiveClasses)}
        aria-pressed={isActive}
      >
        <span className="font-semibold mr-1">{count}</span>
        {label}
      </button>
    );
  }

  return (
    <span className={cn(baseClasses, stateClasses)}>
      <span className="font-semibold mr-1">{count}</span>
      {label}
    </span>
  );
}

export default SkiShopsList;
```

### Wireframe: Filters Active

```
┌─────────────────────────────────────┐
│ [7 Rental✓] [5 Retail] [4 Repair]  │
│                                     │
│ Showing 7 of 10  × Clear filters   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Vail Mountain Rental  (Rental)  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Black Tie Rentals     (Rental)  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Christy Sports        (Rental)  │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    View All 7 Shops  ▼        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Usage

```tsx
// Non-interactive (default, mobile accordion)
<SkiShopsList shops={shops} enableFiltering={false} />

// Interactive filters (desktop or expanded view)
<SkiShopsList shops={shops} enableFiltering={true} />
```

## Acceptance Criteria

- [ ] Filter badges are clickable when enabled
- [ ] Multiple filters can be selected (OR logic)
- [ ] Active filters highlighted with different style
- [ ] "Showing X of Y" indicator when filtered
- [ ] "Clear filters" resets to show all
- [ ] No results state when filters match nothing
- [ ] Touch targets >= 44px on badges
- [ ] Works on mobile and desktop

## Testing

1. Enable filtering and click badges
2. Select multiple filters
3. Verify correct shops shown
4. Test clear filters
5. Test with no matching results

## Effort: Small (1-2 hours)
