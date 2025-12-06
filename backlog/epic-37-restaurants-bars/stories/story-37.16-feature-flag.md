# Story 37.16: Feature Flag Setup

## Description

Set up feature flags for progressive rollout of dining features.

## Acceptance Criteria

- [ ] `diningVenues` feature flag in configuration
- [ ] `diningMapPins` sub-flag for map integration
- [ ] `diningSidebar` sub-flag for sidebar card
- [ ] Feature flag check wrapper component
- [ ] Environment-based defaults
- [ ] Percentage rollout support (optional)

## Feature Flag Configuration

```typescript
// lib/feature-flags/config.ts

export interface FeatureFlags {
  // Existing flags
  locationMapCard: boolean;
  skiShops: boolean;

  // New dining flags
  diningVenues: boolean;      // Master flag for all dining features
  diningMapPins: boolean;     // Show dining pins on location map
  diningSidebar: boolean;     // Show dining sidebar card
  diningFilters: boolean;     // Enable filtering in dining list
}

export const defaultFlags: FeatureFlags = {
  locationMapCard: true,
  skiShops: true,
  diningVenues: false,   // Off by default until ready
  diningMapPins: false,
  diningSidebar: false,
  diningFilters: false,
};

// Environment overrides
export function getFeatureFlags(): FeatureFlags {
  const envOverrides: Partial<FeatureFlags> = {};

  // Check environment variables
  if (process.env.NEXT_PUBLIC_FF_DINING_VENUES === 'true') {
    envOverrides.diningVenues = true;
  }
  if (process.env.NEXT_PUBLIC_FF_DINING_MAP_PINS === 'true') {
    envOverrides.diningMapPins = true;
  }
  if (process.env.NEXT_PUBLIC_FF_DINING_SIDEBAR === 'true') {
    envOverrides.diningSidebar = true;
  }
  if (process.env.NEXT_PUBLIC_FF_DINING_FILTERS === 'true') {
    envOverrides.diningFilters = true;
  }

  return { ...defaultFlags, ...envOverrides };
}
```

## Feature Flag Component

```tsx
// components/FeatureFlag.tsx
import React from 'react';
import { useFeatureFlags } from '@/lib/hooks/useFeatureFlags';
import { FeatureFlags } from '@/lib/feature-flags/config';

interface FeatureFlagProps {
  name: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  const flags = useFeatureFlags();

  if (!flags[name]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

## Usage in Components

```tsx
// In ResortDetail.tsx
import { FeatureFlag } from '@/components/FeatureFlag';
import { DiningList } from './DiningList';
import { DiningSidebarCard } from './DiningSidebarCard';

export function ResortDetail({ resort }: Props) {
  return (
    <div>
      {/* Dining list section */}
      <FeatureFlag name="diningVenues">
        <section id="dining" className="mt-8">
          <DiningList resortSlug={resort.slug} />
        </section>
      </FeatureFlag>

      {/* Sidebar */}
      <aside>
        <FeatureFlag name="diningSidebar">
          <DiningSidebarCard venues={diningVenues} resortSlug={resort.slug} />
        </FeatureFlag>
      </aside>
    </div>
  );
}

// In LocationMapCard.tsx
import { FeatureFlag } from '@/components/FeatureFlag';

export function LocationMapCard({ resort, skiShops, diningVenues }: Props) {
  return (
    <MapContainer>
      {/* Ski shop markers always shown when enabled */}
      {skiShops.map((shop) => <SkiShopMarker key={shop.id} shop={shop} />)}

      {/* Dining markers behind feature flag */}
      <FeatureFlag name="diningMapPins">
        {diningVenues.map((venue) => (
          <DiningMarker key={venue.id} venue={venue} />
        ))}
      </FeatureFlag>
    </MapContainer>
  );
}
```

## Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_FF_DINING_VENUES=true
NEXT_PUBLIC_FF_DINING_MAP_PINS=true
NEXT_PUBLIC_FF_DINING_SIDEBAR=true
NEXT_PUBLIC_FF_DINING_FILTERS=true

# .env.production (production - enable after testing)
NEXT_PUBLIC_FF_DINING_VENUES=false
NEXT_PUBLIC_FF_DINING_MAP_PINS=false
NEXT_PUBLIC_FF_DINING_SIDEBAR=false
NEXT_PUBLIC_FF_DINING_FILTERS=false
```

## Rollout Plan

1. **Phase 1 - Internal Testing**
   - Enable all flags in development
   - Test with sample resorts
   - Validate analytics tracking

2. **Phase 2 - Limited Rollout**
   - Enable for 10% of traffic
   - Monitor error rates and performance
   - Gather user feedback

3. **Phase 3 - Full Rollout**
   - Enable for 100% of traffic
   - Remove percentage gating
   - Keep flags for future kill switch

## Effort

Small (1-2 hours)
