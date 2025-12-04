# Story 29.12: Organize Hooks by Category

## Priority: Low

## Context

The `lib/hooks/` directory contains 16 hooks mixing different concerns (data fetching, UI state, tracking). Organizing by category improves discoverability and maintainability.

## Current State

**Location:** `apps/v1/lib/hooks/`

```
hooks/
├── index.ts
├── useEventBanner.ts
├── useFeatureFlag.ts
├── useImpressionTracking.ts
├── useInfiniteResorts.ts
├── useIntersectionObserver.ts
├── useLogger.ts
├── useMapPins.ts
├── useRankedResorts.ts
├── useRegionalStats.ts
├── useResort.ts
├── useResortConditions.ts
├── useResortSearch.ts
├── useResorts.ts
├── useThemedResorts.ts
└── useViewMode.ts
```

## Requirements

1. Organize hooks into subcategories
2. Update all import paths
3. Maintain backward compatibility via index.ts re-exports

## Implementation

### Proposed Structure

```
hooks/
├── index.ts                    # Re-exports all hooks for backward compatibility
├── data/
│   ├── index.ts
│   ├── useInfiniteResorts.ts   # Paginated resort fetching
│   ├── useMapPins.ts           # Map pin data with caching
│   ├── useRankedResorts.ts     # Scored/ranked resorts
│   ├── useRegionalStats.ts     # Regional statistics
│   ├── useResort.ts            # Single resort fetching
│   ├── useResortConditions.ts  # Liftie conditions
│   ├── useResortSearch.ts      # Search functionality
│   ├── useResorts.ts           # Resort list fetching
│   └── useThemedResorts.ts     # Themed section data
├── ui/
│   ├── index.ts
│   ├── useEventBanner.ts       # Banner visibility
│   ├── useFeatureFlag.ts       # Feature flag checking
│   ├── useIntersectionObserver.ts  # Visibility detection
│   └── useViewMode.ts          # Cards/map toggle
└── tracking/
    ├── index.ts
    ├── useImpressionTracking.ts  # Engagement tracking
    └── useLogger.ts              # Logging utility
```

### Update index.ts

```typescript
/**
 * @module Hooks
 * @purpose Centralized hook exports
 *
 * Hooks are organized by category:
 * - data/: Data fetching and caching
 * - ui/: UI state and interactions
 * - tracking/: Analytics and logging
 */

// Data hooks
export { useInfiniteResorts } from './data/useInfiniteResorts';
export { useMapPins } from './data/useMapPins';
export { useRankedResorts } from './data/useRankedResorts';
export { useRegionalStats } from './data/useRegionalStats';
export { useResort } from './data/useResort';
export { useResortConditions } from './data/useResortConditions';
export { useResortSearch } from './data/useResortSearch';
export { useResorts } from './data/useResorts';
export { useThemedResorts } from './data/useThemedResorts';

// UI hooks
export { useEventBanner } from './ui/useEventBanner';
export { useFeatureFlag } from './ui/useFeatureFlag';
export { useIntersectionObserver } from './ui/useIntersectionObserver';
export { useViewMode } from './ui/useViewMode';
export type { ViewMode } from './ui/useViewMode';

// Tracking hooks
export { useImpressionTracking } from './tracking/useImpressionTracking';
export { useLogger, createLogger } from './tracking/useLogger';
```

### Category Index Files

Create `hooks/data/index.ts`:
```typescript
export { useInfiniteResorts } from './useInfiniteResorts';
export { useMapPins } from './useMapPins';
// ... etc
```

### Update Imports Throughout Codebase

Most imports use `@/lib/hooks/useXxx` directly, so they need updating:

```typescript
// Before
import { useMapPins } from '@/lib/hooks/useMapPins';

// After (either works due to re-exports)
import { useMapPins } from '@/lib/hooks';
// or
import { useMapPins } from '@/lib/hooks/data/useMapPins';
```

### Migration Steps

1. Create subdirectory structure
2. Move files to appropriate directories
3. Create category index files
4. Update main index.ts with re-exports
5. Run TypeScript to find broken imports
6. Update imports as needed
7. Test all functionality

## Acceptance Criteria

- [ ] Hooks organized into data/, ui/, tracking/ directories
- [ ] Each category has index.ts with exports
- [ ] Main index.ts re-exports for backward compatibility
- [ ] All import paths updated or working via re-exports
- [ ] TypeScript compiles without errors
- [ ] All hooks function correctly

## Testing

1. Run `npx tsc --noEmit`
2. Run `npm run build`
3. Test each feature that uses hooks
4. Verify no console errors

## Effort: Small (< 2 hours)
