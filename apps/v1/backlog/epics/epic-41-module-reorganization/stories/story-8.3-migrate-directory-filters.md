# Story 8.3: Migrate DirectoryFilters Component

## Description
Move the DirectoryFilters component from `components/directory/` to `modules/directory/components/`.

## Acceptance Criteria
- [ ] DirectoryFilters copied to `modules/directory/components/DirectoryFilters.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Filter dropdowns work correctly

## Files to Migrate
- `components/directory/DirectoryFilters.tsx` → `modules/directory/components/DirectoryFilters.tsx`

## Tasks

1. Copy `components/directory/DirectoryFilters.tsx` to `modules/directory/components/DirectoryFilters.tsx`
2. Update any internal imports if needed
3. Update `components/directory/DirectoryFilters.tsx` to re-export:
   ```typescript
   export * from '@modules/directory/components/DirectoryFilters';
   ```
4. Add to `modules/directory/index.ts` barrel export

## Testing
- `npm run build` passes
- State and pass type filters work
- Clear filters button works

## Estimated Effort
10 minutes
