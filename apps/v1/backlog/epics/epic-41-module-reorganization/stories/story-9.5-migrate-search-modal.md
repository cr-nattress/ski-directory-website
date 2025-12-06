# Story 9.5: Migrate SearchModal Component

## Description
Move the SearchModal component from `components/` to `modules/dashboard/components/`.

## Acceptance Criteria
- [ ] SearchModal copied to `modules/dashboard/components/SearchModal.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Search modal opens and functions correctly

## Files to Migrate
- `components/SearchModal.tsx` → `modules/dashboard/components/SearchModal.tsx`

## Tasks

1. Copy `components/SearchModal.tsx` to `modules/dashboard/components/SearchModal.tsx`
2. Update any internal imports if needed
3. Update `components/SearchModal.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/SearchModal';
   ```
4. Add to `modules/dashboard/index.ts` barrel export

## Testing
- `npm run build` passes
- Search modal opens on click
- Search functionality works
- Modal closes properly

## Estimated Effort
10 minutes
