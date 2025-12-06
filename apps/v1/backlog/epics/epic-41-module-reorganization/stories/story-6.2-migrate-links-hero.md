# Story 6.2: Migrate LinksHero Component

## Description
Move the SkiLinksHero component from `components/ski-links/` to `modules/links/components/`.

## Acceptance Criteria
- [ ] SkiLinksHero copied to `modules/links/components/LinksHero.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Links hero displays correctly

## Files to Migrate
- `components/ski-links/SkiLinksHero.tsx` → `modules/links/components/LinksHero.tsx`

## Tasks

1. Copy `components/ski-links/SkiLinksHero.tsx` to `modules/links/components/LinksHero.tsx`
2. Rename component from `SkiLinksHero` to `LinksHero` (optional, can keep original name)
3. Update any internal imports if needed
4. Update `components/ski-links/SkiLinksHero.tsx` to re-export:
   ```typescript
   export * from '@modules/links/components/LinksHero';
   export { LinksHero as SkiLinksHero } from '@modules/links/components/LinksHero';
   ```
5. Add to `modules/links/index.ts` barrel export

## Testing
- `npm run build` passes
- Links page hero section displays correctly
- Title and description render

## Estimated Effort
10 minutes
