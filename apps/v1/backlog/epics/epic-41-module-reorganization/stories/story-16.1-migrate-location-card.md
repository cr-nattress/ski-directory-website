# Story 16.1: Migrate LocationCard Component

## Description
Move the LocationCard component from `components/resort-detail/` to `modules/resort-detail/components/location/`.

## Acceptance Criteria
- [ ] LocationCard copied to `modules/resort-detail/components/location/LocationCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Location card displays correctly

## Files to Migrate
- `components/resort-detail/LocationCard.tsx` → `modules/resort-detail/components/location/LocationCard.tsx`

## Tasks

1. Create `modules/resort-detail/components/location/` directory
2. Copy component to new location
3. Update any internal imports if needed
4. Update old file to re-export
5. Create `modules/resort-detail/components/location/index.ts` barrel export
6. Update `modules/resort-detail/index.ts` to include location exports

## Testing
- `npm run build` passes
- Location card shows address and distance info

## Estimated Effort
10 minutes
