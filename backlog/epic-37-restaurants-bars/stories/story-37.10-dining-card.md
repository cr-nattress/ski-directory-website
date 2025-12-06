# Story 37.10: DiningCard Component

## Description

Create the DiningCard component for displaying a single dining venue with all relevant information.

## Acceptance Criteria

- [ ] Display venue name, description, and image (if available)
- [ ] Show venue type badges (restaurant, bar, brewery, etc.)
- [ ] Show cuisine type badges
- [ ] Display price range indicator
- [ ] Show distance from resort
- [ ] Meal availability indicators (breakfast, lunch, dinner, drinks)
- [ ] Feature badges (outdoor seating, live music, etc.)
- [ ] Ski-specific badges (on-mountain, ski-in/ski-out)
- [ ] Phone link with click-to-call
- [ ] Website link (external)
- [ ] Directions link (Google Maps)
- [ ] Analytics tracking on clicks

## Component Design

```tsx
// components/resort-detail/DiningCard.tsx
import React from 'react';
import { DiningVenue } from '@/lib/types/dining';
import {
  VENUE_TYPE_LABELS,
  CUISINE_TYPE_LABELS,
  formatDistance,
  formatPhone,
  getDirectionsUrl,
  getMealTypes,
} from '@/lib/utils/dining-helpers';
import { trackDiningClick } from '@/lib/analytics/dining-events';

interface DiningCardProps {
  venue: DiningVenue;
  resortSlug: string;
}

export function DiningCard({ venue, resortSlug }: DiningCardProps) {
  const handlePhoneClick = () => {
    trackDiningClick({
      action: 'phone',
      venueId: venue.id,
      venueName: venue.name,
      resortSlug,
    });
  };

  const handleWebsiteClick = () => {
    trackDiningClick({
      action: 'website',
      venueId: venue.id,
      venueName: venue.name,
      resortSlug,
    });
  };

  const handleDirectionsClick = () => {
    trackDiningClick({
      action: 'directions',
      venueId: venue.id,
      venueName: venue.name,
      resortSlug,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with name and price */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {venue.name}
          </h3>
          <span className="text-sm font-medium text-green-700 whitespace-nowrap">
            {venue.price_range}
          </span>
        </div>

        {/* Location and distance */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          {venue.is_on_mountain ? (
            <span className="inline-flex items-center gap-1">
              <MountainIcon className="w-4 h-4" />
              {venue.mountain_location === 'base' ? 'Base Area' :
               venue.mountain_location === 'mid_mountain' ? 'Mid-Mountain' :
               venue.mountain_location === 'summit' ? 'Summit' : 'Village'}
            </span>
          ) : (
            <span>{venue.city}</span>
          )}
          <span className="text-gray-300">•</span>
          <span>{formatDistance(venue.distance_miles)}</span>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-2">
        <p className="text-sm text-gray-600 line-clamp-2">{venue.description}</p>
      </div>

      {/* Badges */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5">
        {/* Venue types */}
        {venue.venue_type.slice(0, 2).map((type) => (
          <span
            key={type}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {VENUE_TYPE_LABELS[type]}
          </span>
        ))}

        {/* Cuisine types */}
        {venue.cuisine_type.slice(0, 2).map((type) => (
          <span
            key={type}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
          >
            {CUISINE_TYPE_LABELS[type]}
          </span>
        ))}

        {/* Ski-in/Ski-out badge */}
        {venue.is_ski_in_ski_out && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Ski-In/Ski-Out
          </span>
        )}
      </div>

      {/* Meal types */}
      <div className="px-4 py-2 flex items-center gap-3 text-sm text-gray-500">
        {getMealTypes(venue).map((meal) => (
          <span key={meal} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {meal}
          </span>
        ))}
      </div>

      {/* Features highlight */}
      {venue.features.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          {venue.features.slice(0, 3).map((feature, i) => (
            <span key={feature}>
              {feature.replace(/_/g, ' ')}
              {i < Math.min(venue.features.length, 3) - 1 && ' • '}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between gap-2 border-t border-gray-100">
        {venue.phone && (
          <a
            href={`tel:${venue.phone}`}
            onClick={handlePhoneClick}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <PhoneIcon className="w-4 h-4" />
            Call
          </a>
        )}

        {venue.website_url && (
          <a
            href={venue.website_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWebsiteClick}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <GlobeIcon className="w-4 h-4" />
            Website
          </a>
        )}

        <a
          href={getDirectionsUrl(venue)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDirectionsClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <DirectionsIcon className="w-4 h-4" />
          Directions
        </a>
      </div>
    </div>
  );
}
```

## Responsive Behavior

- Mobile: Full width card, stacked layout
- Tablet: 2-column grid
- Desktop: 3-column grid or sidebar list

## Effort

Medium (2-3 hours)
