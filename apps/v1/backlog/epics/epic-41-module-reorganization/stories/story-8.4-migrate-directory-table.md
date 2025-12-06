# Story 8.4: Migrate DirectoryTable Component

## Description
Move the DirectoryTable component from `components/directory/` to `modules/directory/components/`.

## Acceptance Criteria
- [ ] DirectoryTable copied to `modules/directory/components/DirectoryTable.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Directory table renders with sortable columns

## Files to Migrate
- `components/directory/DirectoryTable.tsx` → `modules/directory/components/DirectoryTable.tsx`

## Tasks

1. Copy `components/directory/DirectoryTable.tsx` to `modules/directory/components/DirectoryTable.tsx`
2. Update any internal imports if needed
3. Update `components/directory/DirectoryTable.tsx` to re-export:
   ```typescript
   export * from '@modules/directory/components/DirectoryTable';
   ```
4. Add to `modules/directory/index.ts` barrel export

## Testing
- `npm run build` passes
- Table renders all resorts
- Column sorting works
- Row click navigates to resort detail

## Estimated Effort
10 minutes
