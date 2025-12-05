'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Store, X } from 'lucide-react';
import {
  SkiShop,
  ShopType,
  SkiShopsListProps,
  calculateServicesSummary,
} from '@/lib/types/ski-shop';
import {
  trackSkiShopsExpand,
  trackSkiShopsFilter,
} from '@/lib/analytics/ski-shop-analytics';
import { SkiShopCard } from './SkiShopCard';
import { cn } from '@/lib/utils';

export function SkiShopsList({
  shops,
  resortName,
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
    const isRemoving = activeFilters.includes(type);
    setActiveFilters((prev) =>
      isRemoving ? prev.filter((t) => t !== type) : [...prev, type]
    );
    // Track filter usage
    if (resortName) {
      trackSkiShopsFilter(resortName, type, isRemoving ? 'remove' : 'add');
    }
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
              resortName={resortName}
              variant={variant}
              showActions={variant === 'full'}
            />
          ))}
        </div>
      )}

      {/* Show More / Show Less Button */}
      {hasMore && filteredShops.length > 0 && (
        <button
          onClick={() => {
            if (!isExpanded && resortName) {
              trackSkiShopsExpand(resortName, filteredShops.length);
            }
            setIsExpanded(!isExpanded);
          }}
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
