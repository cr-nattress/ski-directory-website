# Story 10.2: Migrate ResortRow Component

## Description
Move the ResortRow component from `components/` to `modules/dashboard/components/discovery/`.

## Acceptance Criteria
- [ ] ResortRow copied to `modules/dashboard/components/discovery/ResortRow.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort rows display correctly

## Files to Migrate
- `components/ResortRow.tsx` → `modules/dashboard/components/discovery/ResortRow.tsx`

## Tasks

1. Copy `components/ResortRow.tsx` to `modules/dashboard/components/discovery/ResortRow.tsx`
2. Update any internal imports if needed
3. Update `components/ResortRow.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/discovery/ResortRow';
   ```
4. Add to `modules/dashboard/components/discovery/index.ts` barrel export

## Testing
- `npm run build` passes
- Horizontal scrolling resort rows work
- Cards in rows display correctly

## Estimated Effort
10 minutes
