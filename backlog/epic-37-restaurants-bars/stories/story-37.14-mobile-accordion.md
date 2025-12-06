# Story 37.14: Mobile Accordion Integration

## Description

Integrate dining venues into the mobile accordion layout for the resort detail page.

## Acceptance Criteria

- [ ] "Restaurants & Bars" accordion section
- [ ] Collapse/expand functionality
- [ ] Show venue count in header
- [ ] Compact venue list when expanded
- [ ] Filter chips (horizontal scroll)
- [ ] Tap venue to expand details
- [ ] Quick action buttons (call, directions)
- [ ] Smooth animations

## Component Design

```tsx
// components/resort-detail/mobile/DiningAccordion.tsx
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { DiningVenue } from '@/lib/types/dining';
import { VENUE_TYPE_LABELS, formatDistance } from '@/lib/utils/dining-helpers';

interface DiningAccordionProps {
  venues: DiningVenue[];
  resortSlug: string;
  defaultExpanded?: boolean;
}

export function DiningAccordion({
  venues,
  resortSlug,
  defaultExpanded = false,
}: DiningAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null);

  // Filter venues
  const filteredVenues = activeFilter
    ? venues.filter((v) => v.venue_type.includes(activeFilter as any))
    : venues;

  // Count by type for filter chips
  const typeCounts = venues.reduce((acc, v) => {
    v.venue_type.forEach((t) => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  if (venues.length === 0) return null;

  return (
    <div className="border-b border-gray-200">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <UtensilsIcon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">Restaurants & Bars</span>
          <span className="text-sm text-gray-500">({venues.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-gray-50">
          {/* Filter chips - horizontal scroll */}
          <div className="px-4 py-2 overflow-x-auto flex gap-2 scrollbar-hide">
            <button
              onClick={() => setActiveFilter(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                activeFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              All ({venues.length})
            </button>
            {Object.entries(typeCounts).map(([type, count]) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {VENUE_TYPE_LABELS[type as keyof typeof VENUE_TYPE_LABELS]} ({count})
              </button>
            ))}
          </div>

          {/* Venue list */}
          <div className="divide-y divide-gray-200">
            {filteredVenues.map((venue) => (
              <MobileVenueItem
                key={venue.id}
                venue={venue}
                isExpanded={expandedVenue === venue.id}
                onToggle={() =>
                  setExpandedVenue(expandedVenue === venue.id ? null : venue.id)
                }
              />
            ))}
          </div>

          {/* View all link */}
          {filteredVenues.length < venues.length && (
            <div className="p-4 text-center">
              <button
                onClick={() => setActiveFilter(null)}
                className="text-sm text-blue-600 font-medium"
              >
                Show all {venues.length} venues
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MobileVenueItemProps {
  venue: DiningVenue;
  isExpanded: boolean;
  onToggle: () => void;
}

function MobileVenueItem({ venue, isExpanded, onToggle }: MobileVenueItemProps) {
  return (
    <div className="bg-white">
      {/* Collapsed view */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{venue.name}</h4>
            {venue.is_on_mountain && (
              <span className="shrink-0 text-xs text-purple-600 font-medium">
                On-Mtn
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            {VENUE_TYPE_LABELS[venue.venue_type[0]]} • {venue.price_range} •{' '}
            {formatDistance(venue.distance_miles)}
          </div>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded view */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Description */}
          {venue.description && (
            <p className="text-sm text-gray-600">{venue.description}</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {venue.cuisine_type.slice(0, 3).map((type) => (
              <span
                key={type}
                className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800"
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
            {venue.is_ski_in_ski_out && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                Ski-In/Out
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {venue.phone && (
              <a
                href={`tel:${venue.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
              >
                <PhoneIcon className="w-4 h-4" />
                Call
              </a>
            )}
            <a
              href={getDirectionsUrl(venue)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
            >
              <DirectionsIcon className="w-4 h-4" />
              Directions
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Placement

This accordion should be added to the mobile resort detail view, after the ski shops accordion and before the weather section.

## Effort

Small (1-2 hours)
