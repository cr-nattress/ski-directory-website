# Story 18.4: Migrate DiningVenuesAccordion Component

## Description
Move the DiningVenuesAccordion component from `components/resort-detail/` to `modules/resort-detail/components/dining/`.

## Acceptance Criteria
- [ ] DiningVenuesAccordion copied to `modules/resort-detail/components/dining/DiningVenuesAccordion.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Dining venues accordion displays correctly on mobile

## Files to Migrate
- `components/resort-detail/DiningVenuesAccordion.tsx` → `modules/resort-detail/components/dining/DiningVenuesAccordion.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/dining/DiningVenuesAccordion.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/dining/index.ts` barrel export

## Testing
- `npm run build` passes
- Dining accordion expands/collapses on mobile

## Estimated Effort
10 minutes
