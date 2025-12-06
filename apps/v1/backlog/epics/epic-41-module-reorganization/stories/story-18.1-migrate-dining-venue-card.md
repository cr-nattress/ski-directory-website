# Story 18.1: Migrate DiningVenueCard Component

## Description
Move the DiningVenueCard component from `components/resort-detail/` to `modules/resort-detail/components/dining/`.

## Acceptance Criteria
- [ ] DiningVenueCard copied to `modules/resort-detail/components/dining/DiningVenueCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Dining venue card displays correctly

## Files to Migrate
- `components/resort-detail/DiningVenueCard.tsx` → `modules/resort-detail/components/dining/DiningVenueCard.tsx`

## Tasks

1. Create `modules/resort-detail/components/dining/` directory
2. Copy component to new location
3. Update any internal imports if needed
4. Update old file to re-export
5. Create `modules/resort-detail/components/dining/index.ts` barrel export
6. Update `modules/resort-detail/index.ts` to include dining exports

## Testing
- `npm run build` passes
- Individual dining venue card displays

## Estimated Effort
10 minutes
