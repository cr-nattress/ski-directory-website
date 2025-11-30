# Epic 22: Feature Flag System

## Overview

Implement a configuration-based feature flag system to toggle UI components on/off without code changes. This enables gradual rollouts, A/B testing preparation, and easy feature disabling for incomplete or problematic features.

## Problem Statement

Currently, all UI components are either always visible or controlled by data-driven conditions (e.g., `resort.isLost`). There's no centralized way to:
- Disable features globally without code changes
- Toggle experimental features on/off
- Hide incomplete features in production
- Quickly disable problematic components

## Goals

1. Create a simple, type-safe feature flag configuration
2. Provide a hook for accessing flags in components
3. Apply flags to initial target components
4. Keep the system lightweight (no external dependencies)

## User Stories

### Story 22.1: Create Feature Flag Configuration
**As a** developer
**I want** a centralized configuration file for feature flags
**So that** I can toggle features without modifying component code

**Acceptance Criteria:**
- Create `lib/config/feature-flags.ts` with typed flag definitions
- Flags default to `true` (enabled) for backward compatibility
- Configuration is easily readable and modifiable
- TypeScript provides autocomplete for flag names

**Implementation:**
```typescript
// lib/config/feature-flags.ts
export const featureFlags = {
  // Resort Detail Page
  planYourVisitCard: true,
  trailMapCard: true,
  weatherForecastCard: true,
  socialMediaCard: true,
  locationMapCard: true,

  // Global Components
  alertBanner: true,

  // Directory Page
  directoryFilters: true,

  // Future flags (disabled by default)
  userAuthentication: false,
  resortReviews: false,
  savedResorts: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
```

### Story 22.2: Create useFeatureFlag Hook
**As a** developer
**I want** a React hook to check feature flag status
**So that** I can conditionally render components

**Acceptance Criteria:**
- `useFeatureFlag(flag)` returns boolean
- `useFeatureFlags()` returns all flags
- Hook is type-safe with autocomplete
- Works in both client and server components

**Implementation:**
```typescript
// lib/hooks/useFeatureFlag.ts
import { featureFlags, FeatureFlag } from '@/lib/config/feature-flags';

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}

export function useFeatureFlags() {
  return featureFlags;
}
```

### Story 22.3: Create FeatureFlag Wrapper Component
**As a** developer
**I want** a wrapper component for conditional rendering
**So that** I can easily toggle UI sections

**Acceptance Criteria:**
- `<FeatureFlag name="flagName">` renders children only if enabled
- Supports `fallback` prop for disabled state
- Clean, declarative API

**Implementation:**
```typescript
// components/FeatureFlag.tsx
import { featureFlags, FeatureFlag as FeatureFlagType } from '@/lib/config/feature-flags';

interface FeatureFlagProps {
  name: FeatureFlagType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  if (!featureFlags[name]) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
```

### Story 22.4: Apply Flag to Plan Your Visit Card
**As a** product owner
**I want** to toggle the "Plan Your Visit" card
**So that** I can hide it when conditions data is unavailable

**Acceptance Criteria:**
- Card respects `planYourVisitCard` flag
- When disabled, card is not rendered
- No visual artifacts when disabled

**Target File:** `components/resort-detail/ResortDetail.tsx` (lines 145-195)

### Story 22.5: Apply Flag to Trail Map Card
**As a** product owner
**I want** to toggle the "Trail Map" card
**So that** I can hide it globally if needed

**Acceptance Criteria:**
- Card respects `trailMapCard` flag
- When disabled, entire section is hidden
- Works in conjunction with existing `trailMapUrl` check

**Target File:** `components/resort-detail/ResortDetail.tsx` (lines 134-137)

### Story 22.6: Apply Flag to Alert Banner
**As a** product owner
**I want** to toggle the global alert banner
**So that** I can disable alerts site-wide if needed

**Acceptance Criteria:**
- Banner respects `alertBanner` flag
- When disabled, `useEventBanner` returns null
- No API calls made when disabled

**Target Files:**
- `components/PageWrapper.tsx`
- `lib/hooks/useEventBanner.ts`

### Story 22.7: Apply Flags to Other Resort Detail Cards
**As a** product owner
**I want** to toggle other resort detail cards
**So that** I have fine-grained control over the page layout

**Acceptance Criteria:**
- Weather Forecast Card respects `weatherForecastCard` flag
- Social Media Card respects `socialMediaCard` flag
- Location Map Card respects `locationMapCard` flag

**Target File:** `components/resort-detail/ResortDetail.tsx`

## Technical Implementation

### File Structure
```
lib/
├── config/
│   └── feature-flags.ts    # Flag definitions
├── hooks/
│   └── useFeatureFlag.ts   # React hook
components/
├── FeatureFlag.tsx         # Wrapper component
```

### Configuration Format
```typescript
export const featureFlags = {
  // Group: Resort Detail Page
  planYourVisitCard: true,
  trailMapCard: true,
  weatherForecastCard: true,
  socialMediaCard: true,
  locationMapCard: true,

  // Group: Global Components
  alertBanner: true,

  // Group: Directory Page
  directoryFilters: true,
  stateFilter: true,
  countryFilter: true,

  // Group: Future Features (disabled)
  userAuthentication: false,
  resortReviews: false,
  savedResorts: false,
  compareResorts: false,
} as const;
```

### Usage Examples

**Using the hook:**
```tsx
function PlanYourVisitCard({ resort }) {
  const showCard = useFeatureFlag('planYourVisitCard');

  if (!showCard || resort.isLost) return null;

  return (
    <div className="bg-white border...">
      {/* card content */}
    </div>
  );
}
```

**Using the wrapper component:**
```tsx
<FeatureFlag name="trailMapCard">
  <section className="border-t border-gray-200 pt-8">
    <TrailMapCard resort={resort} />
  </section>
</FeatureFlag>
```

**Checking in useEventBanner:**
```tsx
export function useEventBanner({ resortSlug }) {
  const alertsEnabled = useFeatureFlag('alertBanner');

  if (!alertsEnabled) {
    return { activeAlert: null, dismissAlert: () => {} };
  }

  // ... existing logic
}
```

## Definition of Done

- [ ] Feature flag configuration file created
- [ ] useFeatureFlag hook implemented
- [ ] FeatureFlag wrapper component created
- [ ] Plan Your Visit card uses flag
- [ ] Trail Map card uses flag
- [ ] Alert Banner uses flag
- [ ] Other resort detail cards use flags
- [ ] TypeScript builds without errors
- [ ] All flags default to `true` (no visual changes initially)
- [ ] Documentation updated

## Future Enhancements (Out of Scope)

- Environment-based flags (dev vs prod)
- User-specific flags
- Remote flag management (LaunchDarkly, etc.)
- Flag analytics/logging
- Percentage-based rollouts

## Dependencies

- None (this is foundational infrastructure)

## Estimated Complexity

**Small** - Primarily involves:
- Creating 2-3 new files
- Wrapping existing components with conditionals
- No external dependencies
- No database changes
