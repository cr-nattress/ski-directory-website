# Story 13.2: Migrate Dashboard-Specific Hooks

## Description
Move dashboard-specific hooks from `lib/hooks/` to `modules/dashboard/hooks/`.

## Acceptance Criteria
- [ ] useMapPins moved to `modules/dashboard/hooks/`
- [ ] useViewMode moved to `modules/dashboard/hooks/`
- [ ] useThemedResorts moved to `modules/dashboard/hooks/`
- [ ] useRankedResorts moved to `modules/dashboard/hooks/`
- [ ] Old locations re-export from new location
- [ ] Build passes

## Hooks to Migrate
- `lib/hooks/useMapPins.ts` → `modules/dashboard/hooks/useMapPins.ts`
- `lib/hooks/useViewMode.ts` → `modules/dashboard/hooks/useViewMode.ts`
- `lib/hooks/useThemedResorts.ts` → `modules/dashboard/hooks/useThemedResorts.ts`
- `lib/hooks/useRankedResorts.ts` → `modules/dashboard/hooks/useRankedResorts.ts`

## Tasks

1. Copy dashboard hooks to `modules/dashboard/hooks/`
2. Update internal imports if needed
3. Create `modules/dashboard/hooks/index.ts` barrel export
4. Update old files to re-export from new location
5. Update `modules/dashboard/index.ts` to include hooks

## Testing
- `npm run build` passes
- Map view loads pins correctly
- View toggle state persists
- Themed resort sections work
- Ranking works correctly

## Estimated Effort
20 minutes
