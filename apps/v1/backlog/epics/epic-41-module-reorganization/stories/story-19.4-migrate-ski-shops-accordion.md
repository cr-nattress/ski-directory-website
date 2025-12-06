# Story 19.4: Migrate SkiShopsAccordion Component

## Description
Move the SkiShopsAccordion component from `components/resort-detail/` to `modules/resort-detail/components/shops/`.

## Acceptance Criteria
- [ ] SkiShopsAccordion copied to `modules/resort-detail/components/shops/SkiShopsAccordion.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Ski shops accordion displays correctly on mobile

## Files to Migrate
- `components/resort-detail/SkiShopsAccordion.tsx` → `modules/resort-detail/components/shops/SkiShopsAccordion.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/shops/SkiShopsAccordion.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/shops/index.ts` barrel export

## Testing
- `npm run build` passes
- Shops accordion expands/collapses on mobile

## Estimated Effort
10 minutes
