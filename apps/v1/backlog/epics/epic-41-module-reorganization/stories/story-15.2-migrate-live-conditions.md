# Story 15.2: Migrate LiveConditions Component

## Description
Move the LiveConditions component from `components/resort-detail/` to `modules/resort-detail/components/conditions/`.

## Acceptance Criteria
- [ ] LiveConditions copied to `modules/resort-detail/components/conditions/LiveConditions.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Live conditions display correctly

## Files to Migrate
- `components/resort-detail/LiveConditions.tsx` → `modules/resort-detail/components/conditions/LiveConditions.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/conditions/LiveConditions.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/conditions/index.ts` barrel export

## Testing
- `npm run build` passes
- Snow conditions, base depth, etc. display
- Real-time data updates work

## Estimated Effort
10 minutes
