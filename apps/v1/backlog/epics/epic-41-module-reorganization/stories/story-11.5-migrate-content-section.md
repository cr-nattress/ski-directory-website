# Story 11.5: Migrate ContentSection Component

## Description
Move the ContentSection component from `components/` to `modules/dashboard/components/`.

## Acceptance Criteria
- [ ] ContentSection copied to `modules/dashboard/components/ContentSection.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Content sections render correctly

## Files to Migrate
- `components/ContentSection.tsx` → `modules/dashboard/components/ContentSection.tsx`

## Tasks

1. Copy `components/ContentSection.tsx` to `modules/dashboard/components/ContentSection.tsx`
2. Update any internal imports if needed
3. Update `components/ContentSection.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/ContentSection';
   ```
4. Add to `modules/dashboard/index.ts` barrel export

## Testing
- `npm run build` passes
- Content sections display
- Section styling correct

## Estimated Effort
10 minutes
