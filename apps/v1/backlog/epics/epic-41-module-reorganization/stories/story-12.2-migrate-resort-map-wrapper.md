# Story 12.2: Migrate ResortMapViewWrapper Component

## Description
Move the ResortMapViewWrapper component from `components/` to `modules/dashboard/components/map/`.

## Acceptance Criteria
- [ ] ResortMapViewWrapper copied to `modules/dashboard/components/map/ResortMapViewWrapper.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Map wrapper correctly lazy loads map component

## Files to Migrate
- `components/ResortMapViewWrapper.tsx` → `modules/dashboard/components/map/ResortMapViewWrapper.tsx`

## Tasks

1. Copy `components/ResortMapViewWrapper.tsx` to `modules/dashboard/components/map/ResortMapViewWrapper.tsx`
2. Update any internal imports if needed
3. Update `components/ResortMapViewWrapper.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/map/ResortMapViewWrapper';
   ```
4. Add to `modules/dashboard/components/map/index.ts` barrel export

## Testing
- `npm run build` passes
- Map view toggle works
- SSR doesn't break (dynamic import working)
- Loading state shows correctly

## Estimated Effort
10 minutes
