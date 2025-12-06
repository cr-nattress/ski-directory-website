# Story 38.4: Integrate Header Stats into ResortHero

## Story
**As a** developer
**I want** to integrate the new stats component into the resort hero section
**So that** users see stats immediately without scrolling

## Acceptance Criteria

- [ ] Add `ResortHeaderStats` to `ResortHero.tsx`
- [ ] Position stats strip below resort title/location, above photo gallery
- [ ] Ensure proper spacing and visual flow
- [ ] Feature flag controls visibility
- [ ] Works correctly on both desktop and mobile
- [ ] No layout shift when component loads

## Implementation Notes

### ResortHero.tsx Changes

```tsx
import { ResortHeaderStats } from './ResortHeaderStats';
import { FeatureFlag } from '@/components/FeatureFlag';

// Inside ResortHero component, after title/location, before gallery:
<FeatureFlag name="resortHeaderStats">
  <ResortHeaderStats resort={resort} className="mt-4 mb-6" />
</FeatureFlag>
```

### Layout Considerations

- Stats should not compete visually with the photo gallery
- Maintain visual breathing room between title and gallery
- Consider light background or subtle border for stats section
- Ensure stats don't push gallery too far down

## Priority
P2 - After core component is built

## Effort
Medium (M)

## Dependencies
- Story 38.2 (feature flag)
- Story 38.3 (component implementation)

## Files Modified
- `apps/v1/components/resort-detail/ResortHero.tsx`
