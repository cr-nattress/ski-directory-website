# Story 38.6: Mobile Optimization

## Story
**As a** mobile user
**I want** the header stats to display correctly on my phone
**So that** I get the same quick access to resort data

## Acceptance Criteria

- [ ] Stats grid reflows properly on small screens (< 640px)
- [ ] Trail difficulty visualization works on mobile
- [ ] Text remains readable at mobile sizes (minimum 14px)
- [ ] Touch targets are appropriately sized (min 44px)
- [ ] No horizontal scroll on stats section
- [ ] Test on common mobile breakpoints (375px, 390px, 414px)

## Design Considerations

### Mobile Layout Options

**Option A: Stacked Layout**
```
┌─────────────────────────────┐
│  TRAIL DIFFICULTY           │
│  ███████░░░░░░░░░░░░░░░░░░ │
│  Beginner 10%               │
│  Intermediate 25%           │
│  Advanced 40%               │
│  Expert 25%                 │
├─────────────────────────────┤
│  ELEVATION                  │
│  Summit: 12,504'            │
│  Base: 9,280'               │
│  Vertical: 3,224'           │
├─────────────────────────────┤
│  KEY STATS                  │
│  Acres: 5,317  Runs: 195    │
│  Lifts: 31     Snow: 300"   │
└─────────────────────────────┘
```

**Option B: Compact Grid**
```
┌─────────────────────────────┐
│  ███████████░░░░░░░░░░░░░░ │
│  10% | 25% | 40% | 25%      │
├─────────────────────────────┤
│  12,504'    │    3,224'     │
│  Summit     │    Vertical   │
├─────────────────────────────┤
│  5,317      │    195        │
│  Acres      │    Runs       │
└─────────────────────────────┘
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 639px) { }

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

### Tailwind Classes

```tsx
// Example responsive grid
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
```

## Testing

- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPhone 14 Pro (393px width)
- [ ] Test on iPhone 14 Pro Max (430px width)
- [ ] Test on Android phones (360px-412px)
- [ ] Test landscape orientation
- [ ] Verify with React DevTools mobile emulator

## Priority
P2 - After desktop implementation

## Effort
Medium (M)

## Dependencies
- Story 38.3 (component implementation)

## Files Modified
- `apps/v1/components/resort-detail/ResortHeaderStats.tsx`
