# Story 15.1: Migrate ConditionsSection Component

## Description
Move the ConditionsSection component from `components/resort-detail/` to `modules/resort-detail/components/conditions/`.

## Acceptance Criteria
- [ ] ConditionsSection copied to `modules/resort-detail/components/conditions/ConditionsSection.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Conditions section displays correctly

## Files to Migrate
- `components/resort-detail/ConditionsSection.tsx` → `modules/resort-detail/components/conditions/ConditionsSection.tsx`

## Tasks

1. Create `modules/resort-detail/components/conditions/` directory
2. Copy component to new location
3. Update any internal imports if needed
4. Update old file to re-export
5. Create `modules/resort-detail/components/conditions/index.ts` barrel export
6. Update `modules/resort-detail/index.ts` to include conditions exports

## Testing
- `npm run build` passes
- Conditions section shows on resort detail

## Estimated Effort
10 minutes
