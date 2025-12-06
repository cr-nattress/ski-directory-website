# Story 14.3: Migrate ResortHeaderStats Component

## Description
Move the ResortHeaderStats component from `components/resort-detail/` to `modules/resort-detail/components/`.

## Acceptance Criteria
- [ ] ResortHeaderStats copied to `modules/resort-detail/components/ResortHeaderStats.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Header stats display correctly

## Files to Migrate
- `components/resort-detail/ResortHeaderStats.tsx` → `modules/resort-detail/components/ResortHeaderStats.tsx`

## Tasks

1. Copy `components/resort-detail/ResortHeaderStats.tsx` to `modules/resort-detail/components/ResortHeaderStats.tsx`
2. Update any internal imports if needed
3. Update `components/resort-detail/ResortHeaderStats.tsx` to re-export:
   ```typescript
   export * from '@modules/resort-detail/components/ResortHeaderStats';
   ```
4. Add to `modules/resort-detail/index.ts` barrel export

## Testing
- `npm run build` passes
- Stats show vertical drop, skiable acres, etc.
- Expandable stats work on mobile

## Estimated Effort
10 minutes
