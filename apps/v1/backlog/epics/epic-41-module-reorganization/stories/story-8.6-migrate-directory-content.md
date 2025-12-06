# Story 8.6: Migrate DirectoryContent Component

## Description
Move the DirectoryContent component from `components/directory/` to `modules/directory/components/`.

## Acceptance Criteria
- [ ] DirectoryContent copied to `modules/directory/components/DirectoryContent.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Directory page content renders correctly

## Files to Migrate
- `components/directory/DirectoryContent.tsx` → `modules/directory/components/DirectoryContent.tsx`

## Tasks

1. Copy `components/directory/DirectoryContent.tsx` to `modules/directory/components/DirectoryContent.tsx`
2. Update any internal imports to use module-relative paths
3. Update `components/directory/DirectoryContent.tsx` to re-export:
   ```typescript
   export * from '@modules/directory/components/DirectoryContent';
   ```
4. Add to `modules/directory/index.ts` barrel export

## Testing
- `npm run build` passes
- Directory page renders with all sections
- Filtering works end-to-end
- Table/list views toggle works

## Estimated Effort
10 minutes
