# Story 37.15: Analytics Integration

## Description

Implement analytics tracking for dining venue interactions to measure engagement and feature usage.

## Acceptance Criteria

- [ ] Track dining section views
- [ ] Track venue card impressions
- [ ] Track clicks on:
  - Phone number (call)
  - Website link
  - Directions link
- [ ] Track filter usage
- [ ] Track sort changes
- [ ] Track map pin clicks
- [ ] Track "Load more" clicks
- [ ] Event properties include venue ID, name, type, resort context

## Event Schema

```typescript
// lib/analytics/dining-events.ts

export interface DiningEvent {
  action: string;
  category: 'dining';
  properties: {
    resortSlug: string;
    resortName?: string;
    venueId?: string;
    venueName?: string;
    venueType?: string[];
    [key: string]: any;
  };
}

// Event types
export type DiningEventAction =
  | 'section_view'        // User scrolled dining section into view
  | 'venue_impression'    // Venue card became visible
  | 'phone_click'         // Clicked call button
  | 'website_click'       // Clicked website link
  | 'directions_click'    // Clicked directions button
  | 'filter_apply'        // Applied a filter
  | 'filter_clear'        // Cleared filters
  | 'sort_change'         // Changed sort order
  | 'map_pin_click'       // Clicked venue pin on map
  | 'popup_view'          // Viewed venue popup on map
  | 'load_more'           // Clicked load more button
  | 'sidebar_venue_click' // Clicked venue in sidebar
  | 'accordion_expand'    // Expanded mobile accordion
  | 'accordion_collapse'; // Collapsed mobile accordion
```

## Analytics Functions

```typescript
// lib/analytics/dining-events.ts

import { trackEvent } from './core';

export function trackDiningClick(params: {
  action: 'phone' | 'website' | 'directions';
  venueId: string;
  venueName: string;
  resortSlug: string;
  venueType?: string[];
}) {
  trackEvent({
    action: `${params.action}_click`,
    category: 'dining',
    properties: {
      resortSlug: params.resortSlug,
      venueId: params.venueId,
      venueName: params.venueName,
      venueType: params.venueType,
    },
  });
}

export function trackDiningFilter(params: {
  resortSlug: string;
  filterType: 'venue_type' | 'cuisine_type' | 'price_range' | 'on_mountain' | 'ski_in_out';
  filterValue: string | boolean;
  activeFiltersCount: number;
}) {
  trackEvent({
    action: 'filter_apply',
    category: 'dining',
    properties: {
      resortSlug: params.resortSlug,
      filterType: params.filterType,
      filterValue: String(params.filterValue),
      activeFiltersCount: params.activeFiltersCount,
    },
  });
}

export function trackDiningSort(params: {
  resortSlug: string;
  sortBy: string;
}) {
  trackEvent({
    action: 'sort_change',
    category: 'dining',
    properties: {
      resortSlug: params.resortSlug,
      sortBy: params.sortBy,
    },
  });
}

export function trackDiningSectionView(params: {
  resortSlug: string;
  venueCount: number;
}) {
  trackEvent({
    action: 'section_view',
    category: 'dining',
    properties: {
      resortSlug: params.resortSlug,
      venueCount: params.venueCount,
    },
  });
}

export function trackDiningMapInteraction(params: {
  action: 'pin_click' | 'popup_view' | 'toggle_visibility';
  resortSlug: string;
  venueId?: string;
  venueName?: string;
  showDining?: boolean;
}) {
  trackEvent({
    action: `map_${params.action}`,
    category: 'dining',
    properties: {
      resortSlug: params.resortSlug,
      venueId: params.venueId,
      venueName: params.venueName,
      showDining: params.showDining,
    },
  });
}
```

## Usage in Components

```tsx
// In DiningCard.tsx
import { trackDiningClick } from '@/lib/analytics/dining-events';

const handlePhoneClick = () => {
  trackDiningClick({
    action: 'phone',
    venueId: venue.id,
    venueName: venue.name,
    resortSlug,
    venueType: venue.venue_type,
  });
};

// In DiningList.tsx
import { useDiningAnalytics } from '@/lib/hooks/useDiningAnalytics';

export function DiningList({ resortSlug, venues }: Props) {
  const { trackSectionView, trackImpression } = useDiningAnalytics(resortSlug);

  // Track section view on mount
  useEffect(() => {
    trackSectionView(venues.length);
  }, []);

  // Track impressions using IntersectionObserver
  // ...
}
```

## Dashboard Metrics

Key metrics to track:
- Dining section engagement rate (views / page views)
- Click-through rate by action type
- Most popular filters
- Venue types with highest engagement
- Phone vs Website vs Directions preference
- Mobile vs Desktop engagement patterns

## Effort

Small (1-2 hours)
