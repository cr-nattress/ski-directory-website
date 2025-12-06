# Story 6.4: Migrate LinksList and LinkCard Components

## Description
Move the SkiLinksList and SkiLinkCard components from `components/ski-links/` to `modules/links/components/`.

## Acceptance Criteria
- [ ] SkiLinksList copied to `modules/links/components/LinksList.tsx`
- [ ] SkiLinkCard copied to `modules/links/components/LinkCard.tsx`
- [ ] Old locations re-export from new location
- [ ] Build passes
- [ ] Links list renders with cards

## Files to Migrate
- `components/ski-links/SkiLinksList.tsx` → `modules/links/components/LinksList.tsx`
- `components/ski-links/SkiLinkCard.tsx` → `modules/links/components/LinkCard.tsx`

## Tasks

1. Copy both component files to `modules/links/components/`
2. Update any internal imports if needed
3. Update old files to re-export:
   ```typescript
   // SkiLinksList.tsx
   export * from '@modules/links/components/LinksList';
   export { LinksList as SkiLinksList } from '@modules/links/components/LinksList';

   // SkiLinkCard.tsx
   export * from '@modules/links/components/LinkCard';
   export { LinkCard as SkiLinkCard } from '@modules/links/components/LinkCard';
   ```
4. Add to `modules/links/index.ts` barrel export

## Testing
- `npm run build` passes
- Links list shows all link cards
- Card hover states work
- External links open correctly

## Estimated Effort
15 minutes
