# Story 38.2: Add Feature Flag for Header Stats

## Story
**As a** developer
**I want** a feature flag to control the new header stats component
**So that** we can safely test and roll out the new layout

## Acceptance Criteria

- [ ] Add `resortHeaderStats` flag to `feature-flags.ts` (default: false)
- [ ] Add `mountainStatsSection` flag to control legacy section visibility (default: true)
- [ ] Document the flags in feature-flags.ts comments
- [ ] Flags work correctly with FeatureFlag component

## Implementation

### feature-flags.ts Changes

```typescript
// ============================================
// Resort Detail Page Components
// ============================================

/** Consolidated header stats (trail difficulty, elevation, key metrics) - Epic 38 */
resortHeaderStats: false,

/** Legacy Mountain Stats section (disable when resortHeaderStats is enabled) */
mountainStatsSection: true,
```

## Priority
P1 - Must complete before implementation

## Effort
Small (S)

## Dependencies
None

## Files Modified
- `apps/v1/lib/config/feature-flags.ts`
