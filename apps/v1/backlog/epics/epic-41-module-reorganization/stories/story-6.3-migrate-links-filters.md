# Story 6.3: Migrate LinksFilters Component

## Description
Move the SkiLinksFilters component from `components/ski-links/` to `modules/links/components/`.

## Acceptance Criteria
- [ ] SkiLinksFilters copied to `modules/links/components/LinksFilters.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Filter dropdowns work correctly

## Files to Migrate
- `components/ski-links/SkiLinksFilters.tsx` → `modules/links/components/LinksFilters.tsx`

## Tasks

1. Copy `components/ski-links/SkiLinksFilters.tsx` to `modules/links/components/LinksFilters.tsx`
2. Rename component from `SkiLinksFilters` to `LinksFilters` (optional, can keep original name)
3. Update any internal imports if needed
4. Update `components/ski-links/SkiLinksFilters.tsx` to re-export:
   ```typescript
   export * from '@modules/links/components/LinksFilters';
   export { LinksFilters as SkiLinksFilters } from '@modules/links/components/LinksFilters';
   ```
5. Add to `modules/links/index.ts` barrel export

## Testing
- `npm run build` passes
- Category and type filters work
- Mobile layout shows full-width dropdowns

## Estimated Effort
10 minutes
