# Story 20.1: Migrate NearbyServicesCard Component

## Description
Move the NearbyServicesCard component from `components/resort-detail/` to `modules/resort-detail/components/`.

## Acceptance Criteria
- [ ] NearbyServicesCard copied to `modules/resort-detail/components/NearbyServicesCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Nearby services card displays correctly

## Files to Migrate
- `components/resort-detail/NearbyServicesCard.tsx` → `modules/resort-detail/components/NearbyServicesCard.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/NearbyServicesCard.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/index.ts` barrel export

## Testing
- `npm run build` passes
- Nearby services section displays

## Estimated Effort
10 minutes
