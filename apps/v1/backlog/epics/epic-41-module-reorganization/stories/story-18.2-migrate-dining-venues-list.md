# Story 18.2: Migrate DiningVenuesList Component

## Description
Move the DiningVenuesList component from `components/resort-detail/` to `modules/resort-detail/components/dining/`.

## Acceptance Criteria
- [ ] DiningVenuesList copied to `modules/resort-detail/components/dining/DiningVenuesList.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Dining venues list displays correctly

## Files to Migrate
- `components/resort-detail/DiningVenuesList.tsx` → `modules/resort-detail/components/dining/DiningVenuesList.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/dining/DiningVenuesList.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/dining/index.ts` barrel export

## Testing
- `npm run build` passes
- List of dining venues displays

## Estimated Effort
10 minutes
