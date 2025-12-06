# Story 37.12: Dining Sidebar Card

## Description

Create a compact sidebar card component that shows a summary of dining options near the resort, with quick links to top venues.

## Acceptance Criteria

- [ ] Show total count of dining venues
- [ ] List top 3-5 venues (sorted by relevance/rating)
- [ ] Quick filter chips (On-Mountain, Bars, Restaurants)
- [ ] "View all" link to full dining section
- [ ] Compact design to fit in sidebar
- [ ] On-mountain venues highlighted
- [ ] Loading skeleton
- [ ] Empty state

## Component Design

```tsx
// components/resort-detail/DiningSidebarCard.tsx
import React from 'react';
import Link from 'next/link';
import { DiningVenue } from '@/lib/types/dining';
import { VENUE_TYPE_LABELS, formatDistance, formatPriceRange } from '@/lib/utils/dining-helpers';

interface DiningSidebarCardProps {
  venues: DiningVenue[];
  resortSlug: string;
  isLoading?: boolean;
}

export function DiningSidebarCard({
  venues,
  resortSlug,
  isLoading = false,
}: DiningSidebarCardProps) {
  if (isLoading) {
    return <DiningSidebarSkeleton />;
  }

  if (venues.length === 0) {
    return null;
  }

  // Prioritize on-mountain and closest venues
  const topVenues = [...venues]
    .sort((a, b) => {
      if (a.is_on_mountain !== b.is_on_mountain) {
        return a.is_on_mountain ? -1 : 1;
      }
      return a.distance_miles - b.distance_miles;
    })
    .slice(0, 5);

  // Count by type
  const restaurantCount = venues.filter((v) =>
    v.venue_type.includes('restaurant')
  ).length;
  const barCount = venues.filter((v) =>
    v.venue_type.includes('bar') || v.venue_type.includes('brewery')
  ).length;
  const onMountainCount = venues.filter((v) => v.is_on_mountain).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Restaurants & Bars</h3>
          <span className="text-sm text-gray-500">{venues.length} places</span>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
          {restaurantCount > 0 && (
            <span className="flex items-center gap-1">
              <UtensilsIcon className="w-3.5 h-3.5" />
              {restaurantCount}
            </span>
          )}
          {barCount > 0 && (
            <span className="flex items-center gap-1">
              <GlassIcon className="w-3.5 h-3.5" />
              {barCount}
            </span>
          )}
          {onMountainCount > 0 && (
            <span className="flex items-center gap-1 text-purple-600">
              <MountainIcon className="w-3.5 h-3.5" />
              {onMountainCount} on-mountain
            </span>
          )}
        </div>
      </div>

      {/* Top venues list */}
      <div className="divide-y divide-gray-100">
        {topVenues.map((venue) => (
          <div key={venue.id} className="p-3 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {venue.name}
                  </h4>
                  {venue.is_on_mountain && (
                    <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      On-Mountain
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span>{VENUE_TYPE_LABELS[venue.venue_type[0]]}</span>
                  <span>•</span>
                  <span>{venue.price_range}</span>
                  <span>•</span>
                  <span>{formatDistance(venue.distance_miles)}</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 mt-2">
              {venue.phone && (
                <a
                  href={`tel:${venue.phone}`}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Call
                </a>
              )}
              {venue.website_url && (
                <>
                  <span className="text-gray-300">•</span>
                  <a
                    href={venue.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Website
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View all link */}
      {venues.length > 5 && (
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <a
            href="#dining"
            className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all {venues.length} dining options
          </a>
        </div>
      )}
    </div>
  );
}

function DiningSidebarSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Placement

This component should be placed in the resort detail sidebar, below the ski shops card, wrapped in a feature flag.

## Effort

Medium (2-3 hours)
