# Story 33.3: Add Custom GA4 Event Tracking

## Priority: Medium

## Context

Custom event tracking provides insights into user behavior beyond page views. Tracking specific interactions helps understand how users engage with resort content, which features are popular, and where users drop off.

## Current State

- No custom event tracking implemented
- No conversion tracking
- No engagement metrics beyond page views

## Requirements

1. Create reusable event tracking utility
2. Track key user interactions:
   - Resort card clicks
   - View toggle (Cards/Map) switches
   - Filter selections
   - External link clicks (resort websites)
   - Search queries
   - Trail map views
   - Social link clicks
3. Track engagement metrics:
   - Scroll depth on resort pages
   - Time on page

## Implementation

### Event Tracking Utility

```tsx
// lib/analytics.ts
export const GA_MEASUREMENT_ID = 'G-JE4S4F12GX';

type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export const trackEvent = ({ action, category, label, value }: GtagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Specific event helpers
export const trackResortClick = (resortName: string, source: string) => {
  trackEvent({
    action: 'resort_click',
    category: 'engagement',
    label: `${resortName} from ${source}`,
  });
};

export const trackViewModeChange = (mode: 'cards' | 'map') => {
  trackEvent({
    action: 'view_mode_change',
    category: 'engagement',
    label: mode,
  });
};

export const trackFilterSelection = (filterType: string, filterValue: string) => {
  trackEvent({
    action: 'filter_select',
    category: 'engagement',
    label: `${filterType}: ${filterValue}`,
  });
};

export const trackExternalLink = (url: string, resortName?: string) => {
  trackEvent({
    action: 'external_link_click',
    category: 'outbound',
    label: resortName ? `${resortName}: ${url}` : url,
  });
};

export const trackSearch = (query: string, resultCount: number) => {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: query,
    value: resultCount,
  });
};

export const trackTrailMapView = (resortName: string) => {
  trackEvent({
    action: 'trail_map_view',
    category: 'engagement',
    label: resortName,
  });
};
```

### Usage in Components

```tsx
// In ResortCard.tsx
import { trackResortClick } from '@/lib/analytics';

<Link
  href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
  onClick={() => trackResortClick(resort.name, 'card')}
>

// In ViewToggle.tsx
import { trackViewModeChange } from '@/lib/analytics';

const handleModeChange = (mode: ViewMode) => {
  trackViewModeChange(mode);
  onChange(mode);
};
```

## Acceptance Criteria

- [ ] Event tracking utility created
- [ ] Resort card clicks tracked
- [ ] View mode changes tracked
- [ ] Filter selections tracked
- [ ] External links tracked
- [ ] Search queries tracked
- [ ] Events visible in GA4 Real-Time > Events

## Testing

1. Open GA4 Real-Time > Events
2. Perform each tracked action
3. Verify events appear with correct parameters
4. Check event categories and labels

## Effort: Medium (2-3 hours)
