# Story 38.5: Disable Mountain Stats Section

## Story
**As a** developer
**I want** to disable the legacy Mountain Stats section when header stats are enabled
**So that** we don't show duplicate information

## Acceptance Criteria

- [ ] Wrap Mountain Stats section in `ResortDetail.tsx` with feature flag check
- [ ] When `resortHeaderStats: true` AND `mountainStatsSection: false`, hide the section
- [ ] Update `MobileResortSections.tsx` to hide "Mountain Stats" accordion item
- [ ] Ensure no visual gaps when section is hidden
- [ ] Keep legacy section functional for fallback (controlled by `mountainStatsSection` flag)

## Implementation

### ResortDetail.tsx Changes

```tsx
{/* Mountain Stats - controlled by feature flag */}
<FeatureFlag name="mountainStatsSection">
  <section className="border-t border-gray-200 pt-8">
    <h2 className="text-2xl font-semibold mb-4">Mountain Stats</h2>
    {/* ... existing stats grid ... */}
  </section>
</FeatureFlag>
```

### MobileResortSections.tsx Changes

```tsx
{/* Mountain Stats - controlled by feature flag */}
{featureFlags.mountainStatsSection && (
  <AccordionItem title="Mountain Stats" id="stats">
    {/* ... existing stats grid ... */}
  </AccordionItem>
)}
```

### Feature Flag Coordination

When rolling out new header stats:
1. Set `resortHeaderStats: true` to enable new component
2. Set `mountainStatsSection: false` to disable legacy section
3. Both can coexist during testing phase

## Priority
P2 - After header stats is integrated

## Effort
Small (S)

## Dependencies
- Story 38.2 (feature flag)
- Story 38.4 (integration)

## Files Modified
- `apps/v1/components/resort-detail/ResortDetail.tsx`
- `apps/v1/components/resort-detail/MobileResortSections.tsx`
