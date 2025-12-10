# Epic 46: Dashboard Layout Position Toggle

## Overview

Implement a feature flag that controls the positioning of the dashboard map and intelligent categories (Discovery Sections) relative to the Hero section. When the flag is enabled, the map is positioned directly below the Hero; when disabled, the Discovery Sections appear below the Hero instead.

## Problem Statement

Currently, the landing page has a fixed layout structure:
1. Hero Section
2. Discovery Sections (when viewing "All")
3. Map/Cards View with category filters

Product needs the flexibility to:
- A/B test different layout configurations
- Prioritize map visibility for users seeking geographic exploration
- Prioritize content discovery for users seeking curated recommendations
- Quickly switch layouts without code changes

## Goals

1. Add a new feature flag `mapFirstLayout` to control section ordering
2. Modify `IntelligentResortSection` to respect the flag
3. Optionally extract the map into a standalone section for cleaner positioning
4. Ensure smooth transitions and no layout shift during hydration

## Current Layout (Flag OFF - Default)

```
┌─────────────────────────────────────────┐
│              Hero Section               │
├─────────────────────────────────────────┤
│         Discovery Sections              │  ← Shows when "All" selected
│   (Top Destinations, Hidden Gems, etc.) │
├─────────────────────────────────────────┤
│   Category Chips + View Toggle          │
├─────────────────────────────────────────┤
│        Map OR Cards Grid                │
└─────────────────────────────────────────┘
```

## New Layout (Flag ON)

```
┌─────────────────────────────────────────┐
│              Hero Section               │
├─────────────────────────────────────────┤
│      Full-Width Interactive Map         │  ← Map promoted to top
│    (with View Toggle to switch)         │
├─────────────────────────────────────────┤
│         Discovery Sections              │
│   (Top Destinations, Hidden Gems, etc.) │
├─────────────────────────────────────────┤
│   Category Chips + Cards Grid           │
└─────────────────────────────────────────┘
```

## User Stories

### Story 46.1: Add mapFirstLayout Feature Flag

**As a** developer
**I want** a feature flag to control layout ordering
**So that** product can toggle between layout configurations

**Acceptance Criteria:**
- Add `mapFirstLayout: false` to feature flags configuration
- Flag is in the "Landing Page Features" section
- TypeScript types are updated automatically

**Implementation:**
```typescript
// shared/config/feature-flags.ts
export const featureFlags = {
  // ... existing flags

  // ============================================
  // Landing Page Features
  // ============================================

  /** Map-first layout: Show map directly below hero instead of discovery sections */
  mapFirstLayout: false,

  // ... rest of flags
}
```

**Files to modify:**
- `apps/v1/shared/config/feature-flags.ts`

---

### Story 46.2: Create Standalone MapSection Component

**As a** developer
**I want** the map to be a standalone section
**So that** it can be positioned independently in the layout

**Acceptance Criteria:**
- Extract map view into `MapSection` component
- Component includes the "North America" header and view toggle
- Works independently from IntelligentResortSection
- Maintains all existing map functionality (pins, popups, geolocation)

**Implementation:**
```typescript
// components/MapSection.tsx
'use client';

import { ResortMapViewWrapper } from './ResortMapViewWrapper';
import { ViewToggle } from './ViewToggle';
import { useViewMode } from '@shared/state';
import { useMapPins } from '@/lib/hooks/useMapPins';

interface MapSectionProps {
  showViewToggle?: boolean;
  onToggleToCards?: () => void;
}

export function MapSection({ showViewToggle = true, onToggleToCards }: MapSectionProps) {
  const { mode, setMode, isHydrated } = useViewMode('map');
  const { pins } = useMapPins();

  const handleModeChange = (newMode: 'map' | 'cards') => {
    if (newMode === 'cards' && onToggleToCards) {
      onToggleToCards();
    }
    setMode(newMode);
  };

  return (
    <section className="py-8 bg-bg-light">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              Explore the Map
            </h2>
            <p className="text-gray-600 mt-2">
              {pins.length} resorts across North America
            </p>
          </div>
          {showViewToggle && isHydrated && (
            <ViewToggle value={mode} onChange={handleModeChange} />
          )}
        </div>
        <ResortMapViewWrapper />
      </div>
    </section>
  );
}
```

**Files to create:**
- `apps/v1/components/MapSection.tsx`

---

### Story 46.3: Update Landing Page Layout Logic

**As a** developer
**I want** the landing page to render sections based on the feature flag
**So that** the layout changes when the flag is toggled

**Acceptance Criteria:**
- When `mapFirstLayout: true`: Map Section appears directly below Hero
- When `mapFirstLayout: false`: Discovery Sections appear below Hero (current behavior)
- Layout transitions are smooth without hydration mismatches
- View toggle state is shared between map positions

**Implementation:**
```tsx
// app/page.tsx
import { FeatureFlag } from '@/components/FeatureFlag';
import { MapSection } from '@/components/MapSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <PageWrapper headerVariant="overlay" />
      <Hero />

      {/* Map-first layout: Show map directly below hero */}
      <FeatureFlag name="mapFirstLayout">
        <MapSection />
      </FeatureFlag>

      <FeatureFlag name="intelligentListing" fallback={<ResortSection />}>
        <IntelligentResortSection />
      </FeatureFlag>

      <FeatureFlag name="contentSection">
        <ContentSection />
      </FeatureFlag>

      <Footer />
    </main>
  );
}
```

**Files to modify:**
- `apps/v1/app/page.tsx`

---

### Story 46.4: Modify IntelligentResortSection for Map-First Mode

**As a** developer
**I want** IntelligentResortSection to adapt when map is shown above
**So that** there's no duplicate map and the flow is seamless

**Acceptance Criteria:**
- When `mapFirstLayout: true`:
  - Discovery Sections show first (already visible)
  - Category chips and cards grid show below
  - View toggle either hides or syncs with top map
- When `mapFirstLayout: false`:
  - Maintains current behavior exactly
- No duplicate maps on the page

**Implementation approach:**
```tsx
// components/IntelligentResortSection.tsx

import { featureFlags } from '@shared/config';

export function IntelligentResortSection() {
  const isMapFirst = featureFlags.mapFirstLayout;

  // When map-first is enabled, don't show map in this section
  // (it's already shown above in MapSection)
  const showMapInSection = !isMapFirst;

  return (
    <>
      {/* Discovery Sections - show when viewing "All" */}
      {showDiscoverySections && (
        <section className="py-8 bg-white">
          <div className="container-custom">
            <DiscoverySections />
          </div>
        </section>
      )}

      <section className="py-8 bg-bg-light">
        {/* ... header and category chips ... */}

        <div className={cn('transition-opacity duration-300', !isHydrated && 'opacity-0')}>
          {mode === 'cards' || isMapFirst ? (
            {/* Cards view */}
          ) : (
            showMapInSection && <ResortMapViewWrapper />
          )}
        </div>
      </section>
    </>
  );
}
```

**Files to modify:**
- `apps/v1/components/IntelligentResortSection.tsx`

---

### Story 46.5: Synchronize View Mode State

**As a** user
**I want** the view toggle to work consistently across sections
**So that** switching modes affects the entire page appropriately

**Acceptance Criteria:**
- View mode state is shared via Zustand store (already exists)
- When in map-first mode:
  - Top map is always visible
  - Cards section below always shows cards
  - View toggle controls scroll-to behavior OR hides top map
- State persists across page refreshes

**Implementation notes:**
- The existing `useViewMode` hook from `@shared/state` already uses Zustand
- May need to add a new state for "map section visible" vs "view mode"
- Consider whether toggle should scroll to map or hide/show it

**Files to modify (if needed):**
- `apps/v1/shared/state/view-mode.ts`

---

### Story 46.6: Add Scroll-to-Section Behavior (Optional Enhancement)

**As a** user
**I want** to quickly navigate between map and cards
**So that** I can switch views without manual scrolling

**Acceptance Criteria:**
- When in map-first layout:
  - "View Cards" scrolls to the cards section
  - "View Map" scrolls to the map section
- Smooth scroll animation
- Works on both mobile and desktop

**Implementation:**
```typescript
const scrollToMap = () => {
  document.getElementById('map-section')?.scrollIntoView({
    behavior: 'smooth'
  });
};

const scrollToCards = () => {
  document.getElementById('cards-section')?.scrollIntoView({
    behavior: 'smooth'
  });
};
```

**Files to modify:**
- `apps/v1/components/MapSection.tsx`
- `apps/v1/components/IntelligentResortSection.tsx`

---

## Technical Considerations

### Hydration Safety

The layout must be deterministic on both server and client:
- Feature flags are static (no SSR mismatch)
- View mode uses `isHydrated` pattern to prevent flash

### Performance

- Map component uses dynamic import with `ssr: false`
- Only one map instance should render (not duplicated)
- Lazy load discovery sections if not immediately visible

### State Management

```
┌─────────────────────────────────────────┐
│           Zustand Store                 │
│  ┌─────────────────────────────────┐    │
│  │  viewMode: 'map' | 'cards'      │    │
│  │  isHydrated: boolean            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│   MapSection    │    │ IntelligentReso │
│                 │    │ rtSection       │
│ useViewMode()   │    │ useViewMode()   │
└─────────────────┘    └─────────────────┘
```

## Definition of Done

- [ ] `mapFirstLayout` feature flag added to configuration
- [ ] `MapSection` component created (if needed)
- [ ] Landing page conditionally renders sections based on flag
- [ ] IntelligentResortSection adapts behavior when flag is enabled
- [ ] No duplicate maps when flag is enabled
- [ ] View mode state synchronizes across sections
- [ ] No hydration mismatches
- [ ] TypeScript builds without errors
- [ ] Visual testing confirms both layouts work correctly
- [ ] Documentation updated

## Testing Scenarios

### Flag OFF (Default - Current Behavior)
1. Hero displays
2. Discovery sections display below hero
3. Category chips + view toggle display
4. Map/Cards toggle works as expected

### Flag ON (Map-First Layout)
1. Hero displays
2. Full-width map displays directly below hero
3. Discovery sections display below map
4. Category chips + cards grid display below
5. View toggle behavior is intuitive

## Dependencies

- Epic 22: Feature Flags (completed)
- Epic 24: Intelligent Resort Listing (completed)
- Epic 42: State Management Migration (completed)

## Estimated Complexity

**Small-Medium** - Involves:
- Adding 1 feature flag
- Creating 1 new component (MapSection)
- Modifying 2-3 existing files
- No database changes
- No external dependencies
