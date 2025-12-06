# Story 7.4: Migrate SocialList and SocialCard Components

## Description
Move the SocialLinksList and SocialLinkCard components from `components/social-links/` to `modules/social/components/`.

## Acceptance Criteria
- [ ] SocialLinksList copied to `modules/social/components/SocialList.tsx`
- [ ] SocialLinkCard copied to `modules/social/components/SocialCard.tsx`
- [ ] Old locations re-export from new location
- [ ] Build passes
- [ ] Social list renders with cards

## Files to Migrate
- `components/social-links/SocialLinksList.tsx` → `modules/social/components/SocialList.tsx`
- `components/social-links/SocialLinkCard.tsx` → `modules/social/components/SocialCard.tsx`

## Tasks

1. Copy both component files to `modules/social/components/`
2. Update any internal imports if needed
3. Update old files to re-export:
   ```typescript
   // SocialLinksList.tsx
   export * from '@modules/social/components/SocialList';
   export { SocialList as SocialLinksList } from '@modules/social/components/SocialList';

   // SocialLinkCard.tsx
   export * from '@modules/social/components/SocialCard';
   export { SocialCard as SocialLinkCard } from '@modules/social/components/SocialCard';
   ```
4. Add to `modules/social/index.ts` barrel export

## Testing
- `npm run build` passes
- Social list shows all social cards
- Platform icons display correctly
- External links open correctly

## Estimated Effort
15 minutes
