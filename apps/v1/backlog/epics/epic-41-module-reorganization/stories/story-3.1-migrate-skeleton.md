# Story 3.1: Migrate Skeleton Component

## Description
Move the Skeleton component from `components/ui/` to `ui/primitives/`.

## Acceptance Criteria
- [ ] Skeleton component copied to `ui/primitives/Skeleton.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Skeleton displays correctly on loading states

## Files to Migrate
- `components/ui/Skeleton.tsx` → `ui/primitives/Skeleton.tsx`

## Tasks

1. Copy `components/ui/Skeleton.tsx` to `ui/primitives/Skeleton.tsx`
2. Update any internal imports if needed
3. Update `components/ui/Skeleton.tsx` to re-export:
   ```typescript
   export * from '@ui/primitives/Skeleton';
   ```
4. Add to `ui/primitives/index.ts` barrel export

## Testing
- `npm run build` passes
- Directory page shows skeletons during loading
- Resort detail page shows skeletons during loading

## Estimated Effort
10 minutes
