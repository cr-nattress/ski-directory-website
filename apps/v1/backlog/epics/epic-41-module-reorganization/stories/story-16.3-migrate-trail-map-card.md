# Story 16.3: Migrate TrailMapCard Component

## Description
Move the TrailMapCard component from `components/resort-detail/` to `modules/resort-detail/components/location/`.

## Acceptance Criteria
- [ ] TrailMapCard copied to `modules/resort-detail/components/location/TrailMapCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Trail map displays correctly

## Files to Migrate
- `components/resort-detail/TrailMapCard.tsx` → `modules/resort-detail/components/location/TrailMapCard.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/location/TrailMapCard.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/location/index.ts` barrel export

## Testing
- `npm run build` passes
- Trail map image displays
- Click to enlarge works (if applicable)

## Estimated Effort
10 minutes
