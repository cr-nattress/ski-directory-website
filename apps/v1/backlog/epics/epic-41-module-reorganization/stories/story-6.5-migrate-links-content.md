# Story 6.5: Migrate LinksContent Component

## Description
Move the SkiLinksContent component from `components/ski-links/` to `modules/links/components/`.

## Acceptance Criteria
- [ ] SkiLinksContent copied to `modules/links/components/LinksContent.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Links page content renders correctly

## Files to Migrate
- `components/ski-links/SkiLinksContent.tsx` → `modules/links/components/LinksContent.tsx`

## Tasks

1. Copy `components/ski-links/SkiLinksContent.tsx` to `modules/links/components/LinksContent.tsx`
2. Update any internal imports to use module-relative paths
3. Update `components/ski-links/SkiLinksContent.tsx` to re-export:
   ```typescript
   export * from '@modules/links/components/LinksContent';
   export { LinksContent as SkiLinksContent } from '@modules/links/components/LinksContent';
   ```
4. Add to `modules/links/index.ts` barrel export

## Testing
- `npm run build` passes
- Links page renders with all sections
- Filtering works end-to-end

## Estimated Effort
10 minutes
