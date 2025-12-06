'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Utensils, X } from 'lucide-react';
import {
  DiningVenue,
  VenueType,
  DiningListProps,
  calculateVenueTypeSummary,
  getVenueTypeLabel,
} from '@/lib/types/dining';
import {
  trackDiningExpand,
  trackDiningFilter,
} from '@/lib/analytics/dining-analytics';
import { DiningVenueCard } from './DiningVenueCard';
import { cn } from '@/lib/utils';

export function DiningVenuesList({
  venues,
  resortName,
  initialCount = 3,
  showTypeSummary = true,
  enableFiltering = false,
  variant = 'full',
  className,
}: DiningListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<VenueType[]>([]);

  // Filter venues based on active filters
  const filteredVenues = useMemo(() => {
    if (activeFilters.length === 0) return venues;
    return venues.filter((venue) =>
      activeFilters.some((filter) => venue.venue_type.includes(filter))
    );
  }, [venues, activeFilters]);

  // Handle empty state
  if (!venues || venues.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No dining venues found nearby</p>
      </div>
    );
  }

  const typeSummary = calculateVenueTypeSummary(venues);
  const visibleVenues = isExpanded
    ? filteredVenues
    : filteredVenues.slice(0, initialCount);
  const remainingCount = filteredVenues.length - initialCount;
  const hasMore = remainingCount > 0;

  const toggleFilter = (type: VenueType) => {
    const isRemoving = activeFilters.includes(type);
    setActiveFilters((prev) =>
      isRemoving ? prev.filter((t) => t !== type) : [...prev, type]
    );
    // Track filter usage
    if (resortName) {
      trackDiningFilter(resortName, 'venue_type', type, isRemoving ? 'remove' : 'add');
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
      {/* Venue Type Summary / Filter Badges */}
      {showTypeSummary && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {typeSummary.restaurant > 0 && (
              <FilterBadge
                count={typeSummary.restaurant}
                label="Restaurant"
                type="restaurant"
                isActive={activeFilters.includes('restaurant')}
                onClick={enableFiltering ? () => toggleFilter('restaurant') : undefined}
                interactive={enableFiltering}
              />
            )}
            {typeSummary.bar > 0 && (
              <FilterBadge
                count={typeSummary.bar}
                label="Bar"
                type="bar"
                isActive={activeFilters.includes('bar')}
                onClick={enableFiltering ? () => toggleFilter('bar') : undefined}
                interactive={enableFiltering}
              />
            )}
            {typeSummary.brewery > 0 && (
              <FilterBadge
                count={typeSummary.brewery}
                label="Brewery"
                type="brewery"
                isActive={activeFilters.includes('brewery')}
                onClick={enableFiltering ? () => toggleFilter('brewery') : undefined}
                interactive={enableFiltering}
              />
            )}
            {typeSummary.cafe > 0 && (
              <FilterBadge
                count={typeSummary.cafe}
                label="Cafe"
                type="cafe"
                isActive={activeFilters.includes('cafe')}
                onClick={enableFiltering ? () => toggleFilter('cafe') : undefined}
                interactive={enableFiltering}
              />
            )}
            {typeSummary.lodge_dining > 0 && (
              <FilterBadge
                count={typeSummary.lodge_dining}
                label="Lodge Dining"
                type="lodge_dining"
                isActive={activeFilters.includes('lodge_dining')}
                onClick={enableFiltering ? () => toggleFilter('lodge_dining') : undefined}
                interactive={enableFiltering}
              />
            )}
          </div>

          {/* Active filters indicator */}
          {enableFiltering && activeFilters.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">
                Showing {filteredVenues.length} of {venues.length}
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
      {filteredVenues.length === 0 && activeFilters.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>No venues match your filters</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-ski-blue hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Venue Cards */}
      {filteredVenues.length > 0 && (
        <div className="space-y-3">
          {visibleVenues.map((venue) => (
            <DiningVenueCard
              key={venue.slug}
              venue={venue}
              resortName={resortName}
              variant={variant}
              showActions={variant === 'full'}
            />
          ))}
        </div>
      )}

      {/* Show More / Show Less Button */}
      {hasMore && filteredVenues.length > 0 && (
        <button
          onClick={() => {
            if (!isExpanded && resortName) {
              trackDiningExpand(resortName, filteredVenues.length);
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
              <span>View All {filteredVenues.length} Venues</span>
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
  type: VenueType;
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
    ? 'bg-orange-500 text-white'
    : 'bg-orange-100 text-orange-700';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:bg-orange-200 active:bg-orange-300'
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
export function DiningVenuesListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Type badges skeleton */}
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

export default DiningVenuesList;
