# Story 23.3: Migrate System Components

## Description
Move system-level components (FeatureFlag, etc.) to `shared/`.

## Acceptance Criteria
- [ ] FeatureFlag component moved to `shared/`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Feature flags work correctly

## Files to Migrate
- `components/FeatureFlag.tsx` → `shared/FeatureFlag.tsx`
- Any other system-level components

## Tasks

1. Copy system components to `shared/`
2. Update any internal imports if needed
3. Update old files to re-export from new location
4. Add to `shared/index.ts` barrel export

## Testing
- `npm run build` passes
- Feature-flagged components show/hide correctly
- No console errors

## Estimated Effort
10 minutes
