# Story 15.3: Migrate LiftStatusList Component

## Description
Move the LiftStatusList component from `components/resort-detail/` to `modules/resort-detail/components/conditions/`.

## Acceptance Criteria
- [ ] LiftStatusList copied to `modules/resort-detail/components/conditions/LiftStatusList.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Lift status list displays correctly

## Files to Migrate
- `components/resort-detail/LiftStatusList.tsx` → `modules/resort-detail/components/conditions/LiftStatusList.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/conditions/LiftStatusList.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/conditions/index.ts` barrel export

## Testing
- `npm run build` passes
- Lift status shows open/closed status
- Status colors display correctly

## Estimated Effort
10 minutes
