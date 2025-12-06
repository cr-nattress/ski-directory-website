# Story 21.1: Migrate Resort Detail Hooks

## Description
Move resort-detail-specific hooks from `lib/hooks/` to `modules/resort-detail/hooks/`.

## Acceptance Criteria
- [ ] useResort moved to `modules/resort-detail/hooks/`
- [ ] useResortConditions moved to `modules/resort-detail/hooks/`
- [ ] Old locations re-export from new location
- [ ] Build passes

## Hooks to Migrate
- `lib/hooks/useResort.ts` → `modules/resort-detail/hooks/useResort.ts`
- `lib/hooks/useResortConditions.ts` → `modules/resort-detail/hooks/useResortConditions.ts`

## Tasks

1. Copy hooks to `modules/resort-detail/hooks/`
2. Update internal imports if needed
3. Create `modules/resort-detail/hooks/index.ts` barrel export
4. Update old files to re-export from new location
5. Update `modules/resort-detail/index.ts` to include hooks

## Testing
- `npm run build` passes
- Resort detail page loads data correctly
- Conditions data fetches correctly

## Estimated Effort
15 minutes
