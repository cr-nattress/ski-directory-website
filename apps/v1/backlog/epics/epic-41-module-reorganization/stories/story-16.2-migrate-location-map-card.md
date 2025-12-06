# Story 16.2: Migrate LocationMapCard Component

## Description
Move the LocationMapCard component from `components/resort-detail/` to `modules/resort-detail/components/location/`.

## Acceptance Criteria
- [ ] LocationMapCard copied to `modules/resort-detail/components/location/LocationMapCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Location map displays correctly

## Files to Migrate
- `components/resort-detail/LocationMapCard.tsx` → `modules/resort-detail/components/location/LocationMapCard.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/location/LocationMapCard.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/location/index.ts` barrel export

## Testing
- `npm run build` passes
- Mini map displays with pin
- Map is interactive

## Notes
- Ensure dynamic import with `ssr: false` is maintained for Leaflet compatibility

## Estimated Effort
10 minutes
