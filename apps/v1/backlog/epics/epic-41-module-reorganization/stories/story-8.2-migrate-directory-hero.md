# Story 8.2: Migrate DirectoryHero Component

## Description
Move the DirectoryHero component from `components/directory/` to `modules/directory/components/`.

## Acceptance Criteria
- [ ] DirectoryHero copied to `modules/directory/components/DirectoryHero.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Directory hero displays correctly

## Files to Migrate
- `components/directory/DirectoryHero.tsx` → `modules/directory/components/DirectoryHero.tsx`

## Tasks

1. Copy `components/directory/DirectoryHero.tsx` to `modules/directory/components/DirectoryHero.tsx`
2. Update any internal imports if needed
3. Update `components/directory/DirectoryHero.tsx` to re-export:
   ```typescript
   export * from '@modules/directory/components/DirectoryHero';
   ```
4. Add to `modules/directory/index.ts` barrel export

## Testing
- `npm run build` passes
- Directory page hero section displays correctly
- Title and description render

## Estimated Effort
10 minutes
