# Story 38.3: Implement ResortHeaderStats Component

## Story
**As a** skier viewing a resort page
**I want** to see key resort stats immediately in the header
**So that** I can quickly assess if the resort fits my skill level and preferences

## Acceptance Criteria

- [ ] Create `ResortHeaderStats` component at `components/resort-detail/ResortHeaderStats.tsx`
- [ ] Component displays:
  - Trail difficulty breakdown (green/blue/black/double-black with percentages)
  - Summit elevation
  - Base elevation
  - Vertical drop
  - Skiable acres
  - Total runs
  - Total lifts
  - Annual snowfall
- [ ] Trail difficulty uses industry-standard colors:
  - Green (beginner): `#22c55e`
  - Blue (intermediate): `#3b82f6`
  - Black (advanced): `#1f2937`
  - Double Black (expert): `#111827`
- [ ] Responsive design for mobile and desktop
- [ ] Uses existing resort data (no new API calls)
- [ ] Accessible with proper ARIA labels
- [ ] Clean visual design matching site theme
- [ ] Wrapped with feature flag check

## Design Approach

Based on Story 38.1 research, implement the recommended design. Likely patterns:

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRAIL DIFFICULTY           ELEVATION              KEY STATS               │
│  ██████░░░░░░░░░░░░░░░     Summit: 12,504'        Acres: 5,317            │
│  Beginner 10%              Base: 9,280'           Runs: 195               │
│  Intermediate 25%          Vertical: 3,224'       Lifts: 31               │
│  Advanced 40%                                     Snowfall: 300"/yr       │
│  Expert 25%                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
- Stack vertically or use horizontal scroll
- Ensure touch-friendly
- May use icons more prominently

## Component API

```typescript
interface ResortHeaderStatsProps {
  resort: Resort;
  className?: string;
}

export function ResortHeaderStats({ resort, className }: ResortHeaderStatsProps) {
  // Implementation
}
```

## Technical Notes

- Use `cn()` utility for class merging
- Consider using Lucide icons for stats
- Trail difficulty bar could be a horizontal stacked bar chart
- Format numbers with `toLocaleString()` for readability

## Priority
P1 - Core implementation

## Effort
Large (L)

## Dependencies
- Story 38.1 (research) - for design direction
- Story 38.2 (feature flag) - for controlled rollout

## Files Created
- `apps/v1/components/resort-detail/ResortHeaderStats.tsx`
