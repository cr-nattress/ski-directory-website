# Story 9.2: Migrate ViewToggle Component

## Description
Move the ViewToggle component from `components/` to `modules/dashboard/components/`.

## Acceptance Criteria
- [ ] ViewToggle copied to `modules/dashboard/components/ViewToggle.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Cards/Map toggle works

## Files to Migrate
- `components/ViewToggle.tsx` → `modules/dashboard/components/ViewToggle.tsx`

## Tasks

1. Copy `components/ViewToggle.tsx` to `modules/dashboard/components/ViewToggle.tsx`
2. Update any internal imports if needed
3. Update `components/ViewToggle.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/ViewToggle';
   ```
4. Add to `modules/dashboard/index.ts` barrel export

## Testing
- `npm run build` passes
- Toggle switches between card and map views
- Active state highlights correctly

## Estimated Effort
10 minutes
