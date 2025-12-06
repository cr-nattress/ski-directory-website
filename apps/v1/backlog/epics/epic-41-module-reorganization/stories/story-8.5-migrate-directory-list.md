# Story 8.5: Migrate DirectoryList Component

## Description
Move the DirectoryList component from `components/directory/` to `modules/directory/components/`.

## Acceptance Criteria
- [ ] DirectoryList copied to `modules/directory/components/DirectoryList.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Directory list renders A-Z groups

## Files to Migrate
- `components/directory/DirectoryList.tsx` → `modules/directory/components/DirectoryList.tsx`

## Tasks

1. Copy `components/directory/DirectoryList.tsx` to `modules/directory/components/DirectoryList.tsx`
2. Update any internal imports if needed
3. Update `components/directory/DirectoryList.tsx` to re-export:
   ```typescript
   export * from '@modules/directory/components/DirectoryList';
   ```
4. Add to `modules/directory/index.ts` barrel export

## Testing
- `npm run build` passes
- A-Z grouped list renders correctly
- Resort links work

## Estimated Effort
10 minutes
