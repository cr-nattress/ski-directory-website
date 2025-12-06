# Story 18.3: Migrate DiningVenuesCard Component

## Description
Move the DiningVenuesCard component from `components/resort-detail/` to `modules/resort-detail/components/dining/`.

## Acceptance Criteria
- [ ] DiningVenuesCard copied to `modules/resort-detail/components/dining/DiningVenuesCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Dining venues card section displays correctly

## Files to Migrate
- `components/resort-detail/DiningVenuesCard.tsx` → `modules/resort-detail/components/dining/DiningVenuesCard.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/dining/DiningVenuesCard.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/dining/index.ts` barrel export

## Testing
- `npm run build` passes
- Dining section card displays on desktop

## Estimated Effort
10 minutes
