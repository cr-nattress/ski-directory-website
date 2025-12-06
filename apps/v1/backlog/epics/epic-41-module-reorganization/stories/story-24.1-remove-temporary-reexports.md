# Story 24.1: Remove Temporary Re-export Files

## Description
Remove the temporary re-export files created during migration and update all imports to use new paths directly.

## Acceptance Criteria
- [ ] All re-export files identified
- [ ] All imports updated to use new module paths
- [ ] Re-export files deleted
- [ ] Build passes
- [ ] No broken imports

## Tasks

1. Search for all re-export patterns like `export * from '@modules/`
2. For each re-export file:
   - Find all files that import from the old location
   - Update imports to use new module paths
   - Delete the re-export file
3. Verify no broken imports remain

## Files to Update
- `components/*.tsx` - Update imports
- `lib/types/index.ts` - Remove re-export
- `lib/hooks/*.ts` - Remove re-exports
- `lib/config/*.ts` - Remove re-exports
- `lib/utils.ts` - Remove re-export

## Testing
- `npm run build` passes
- All pages render correctly
- No console errors

## Notes
- Do this phase carefully, one directory at a time
- Run build after each batch of changes

## Estimated Effort
30 minutes
