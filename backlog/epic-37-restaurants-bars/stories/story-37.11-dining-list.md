# Story 37.11: DiningList Component with Filters

## Description

Create the DiningList component that displays multiple dining venues with filtering, sorting, and pagination.

## Acceptance Criteria

- [ ] Display list of DiningCards
- [ ] Filter bar with dropdowns:
  - Venue type (multi-select)
  - Cuisine type (multi-select)
  - Price range (multi-select)
  - On-mountain only toggle
  - Ski-in/ski-out only toggle
- [ ] Sort dropdown (distance, name, price)
- [ ] Show active filter count with clear button
- [ ] "Load more" pagination
- [ ] Empty state for no results
- [ ] Loading skeleton
- [ ] Responsive grid layout

## Component Design

```tsx
// components/resort-detail/DiningList.tsx
import React, { useState, useEffect } from 'react';
import { DiningCard } from './DiningCard';
import { DiningFilters } from './DiningFilters';
import { DiningVenue, DiningFilters as FilterTypes, DiningAPIResponse } from '@/lib/types/dining';
import { useDiningVenues } from '@/lib/hooks/useDiningVenues';

interface DiningListProps {
  resortSlug: string;
  initialVenues?: DiningVenue[];
}

export function DiningList({ resortSlug, initialVenues }: DiningListProps) {
  const [filters, setFilters] = useState<FilterTypes>({});
  const [sort, setSort] = useState<string>('distance');

  const {
    venues,
    isLoading,
    error,
    hasMore,
    loadMore,
    availableFilters,
  } = useDiningVenues(resortSlug, { filters, sort });

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const clearFilters = () => {
    setFilters({});
  };

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Unable to load dining options. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Restaurants & Bars
          {venues.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({venues.length} places)
            </span>
          )}
        </h2>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="distance">Nearest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="price_asc">Price (Low to High)</option>
          <option value="price_desc">Price (High to Low)</option>
        </select>
      </div>

      {/* Filters */}
      <DiningFilters
        filters={filters}
        availableFilters={availableFilters}
        onChange={setFilters}
        activeCount={activeFilterCount}
        onClear={clearFilters}
      />

      {/* Loading state */}
      {isLoading && venues.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <DiningCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && venues.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DiningIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No dining options found
          </h3>
          <p className="text-gray-500 mb-4">
            {activeFilterCount > 0
              ? 'Try adjusting your filters to see more results.'
              : 'Check back later for dining recommendations.'}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Venue grid */}
      {venues.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <DiningCard
                key={venue.id}
                venue={venue}
                resortSlug={resortSlug}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DiningCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  );
}
```

## DiningFilters Component

```tsx
// components/resort-detail/DiningFilters.tsx
import React from 'react';
import { DiningFilters as FilterTypes } from '@/lib/types/dining';
import { VENUE_TYPE_LABELS, CUISINE_TYPE_LABELS } from '@/lib/utils/dining-helpers';

interface DiningFiltersProps {
  filters: FilterTypes;
  availableFilters: {
    venueTypes: string[];
    cuisineTypes: string[];
    priceRanges: string[];
  };
  onChange: (filters: FilterTypes) => void;
  activeCount: number;
  onClear: () => void;
}

export function DiningFilters({
  filters,
  availableFilters,
  onChange,
  activeCount,
  onClear,
}: DiningFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
      {/* Venue Type */}
      <MultiSelect
        label="Type"
        options={availableFilters.venueTypes}
        selected={filters.venueType || []}
        onChange={(values) => onChange({ ...filters, venueType: values })}
        labelMap={VENUE_TYPE_LABELS}
      />

      {/* Cuisine Type */}
      <MultiSelect
        label="Cuisine"
        options={availableFilters.cuisineTypes}
        selected={filters.cuisineType || []}
        onChange={(values) => onChange({ ...filters, cuisineType: values })}
        labelMap={CUISINE_TYPE_LABELS}
      />

      {/* Price Range */}
      <MultiSelect
        label="Price"
        options={availableFilters.priceRanges}
        selected={filters.priceRange || []}
        onChange={(values) => onChange({ ...filters, priceRange: values })}
      />

      {/* On-Mountain Toggle */}
      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
        <input
          type="checkbox"
          checked={filters.isOnMountain === true}
          onChange={(e) =>
            onChange({ ...filters, isOnMountain: e.target.checked || undefined })
          }
          className="rounded text-blue-600"
        />
        <span className="text-sm">On-Mountain</span>
      </label>

      {/* Ski-In/Ski-Out Toggle */}
      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
        <input
          type="checkbox"
          checked={filters.isSkiInSkiOut === true}
          onChange={(e) =>
            onChange({ ...filters, isSkiInSkiOut: e.target.checked || undefined })
          }
          className="rounded text-blue-600"
        />
        <span className="text-sm">Ski-In/Out</span>
      </label>

      {/* Clear button */}
      {activeCount > 0 && (
        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-auto"
        >
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}
```

## Effort

Large (4-6 hours)
