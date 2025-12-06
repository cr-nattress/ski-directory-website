# Story 3.5: Migrate PlatformIcon Component

## Description
Move the PlatformIcon component from `components/` to `ui/media/`.

## Acceptance Criteria
- [ ] PlatformIcon component copied to `ui/media/PlatformIcon.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Platform icons display correctly for social links

## Files to Migrate
- `components/PlatformIcon.tsx` → `ui/media/PlatformIcon.tsx`

## Tasks

1. Copy `components/PlatformIcon.tsx` to `ui/media/PlatformIcon.tsx`
2. Update any internal imports if needed
3. Update `components/PlatformIcon.tsx` to re-export:
   ```typescript
   export * from '@ui/media/PlatformIcon';
   ```
4. Add to `ui/media/index.ts` barrel export

## Testing
- `npm run build` passes
- Social links page shows platform icons
- Resort detail social media section shows icons

## Estimated Effort
10 minutes
