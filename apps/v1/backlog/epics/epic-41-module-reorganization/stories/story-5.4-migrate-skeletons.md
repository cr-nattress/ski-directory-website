# Story 5.4: Migrate Skeleton Components

## Description
Move specialized skeleton components from `components/` to `ui/primitives/skeletons/`.

## Acceptance Criteria
- [ ] ResortCardSkeleton copied to `ui/primitives/skeletons/`
- [ ] Other skeleton components copied to `ui/primitives/skeletons/`
- [ ] Old locations re-export from new location
- [ ] Build passes
- [ ] Skeletons display during loading states

## Files to Migrate
- `components/ResortCardSkeleton.tsx` → `ui/primitives/skeletons/ResortCardSkeleton.tsx`
- Any other skeleton components in `components/`

## Tasks

1. Create `ui/primitives/skeletons/` directory
2. Copy skeleton components to `ui/primitives/skeletons/`
3. Update any internal imports if needed
4. Create `ui/primitives/skeletons/index.ts` barrel export
5. Update old files to re-export from new location
6. Update `ui/primitives/index.ts` to include skeletons

## Testing
- `npm run build` passes
- Resort card skeletons show during loading
- All skeleton components render correctly

## Estimated Effort
15 minutes
