# Story 4.4: Migrate MobileBottomNav Component

## Description
Move the MobileBottomNav component from `components/layout/` to `ui/layout/`.

## Acceptance Criteria
- [ ] MobileBottomNav component copied to `ui/layout/MobileBottomNav.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Mobile bottom navigation works correctly

## Files to Migrate
- `components/layout/MobileBottomNav.tsx` → `ui/layout/MobileBottomNav.tsx`

## Tasks

1. Copy `components/layout/MobileBottomNav.tsx` to `ui/layout/MobileBottomNav.tsx`
2. Update any internal imports if needed
3. Update `components/layout/MobileBottomNav.tsx` to re-export:
   ```typescript
   export * from '@ui/layout/MobileBottomNav';
   ```
4. Add to `ui/layout/index.ts` barrel export

## Testing
- `npm run build` passes
- Mobile bottom nav shows on mobile viewport
- All navigation items work
- Active state highlights correctly

## Estimated Effort
10 minutes
