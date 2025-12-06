# Story 9.4: Migrate EventBanner Component

## Description
Move the EventBanner component from `components/` to `modules/dashboard/components/`.

## Acceptance Criteria
- [ ] EventBanner copied to `modules/dashboard/components/EventBanner.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Event banner displays when applicable

## Files to Migrate
- `components/EventBanner.tsx` → `modules/dashboard/components/EventBanner.tsx`

## Tasks

1. Copy `components/EventBanner.tsx` to `modules/dashboard/components/EventBanner.tsx`
2. Update any internal imports if needed
3. Update `components/EventBanner.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/EventBanner';
   ```
4. Add to `modules/dashboard/index.ts` barrel export

## Testing
- `npm run build` passes
- Event banner shows when feature flag is enabled
- Banner styling is correct

## Estimated Effort
10 minutes
