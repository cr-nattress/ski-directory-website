# Story 7.2: Migrate SocialHero Component

## Description
Move the SocialLinksHero component from `components/social-links/` to `modules/social/components/`.

## Acceptance Criteria
- [ ] SocialLinksHero copied to `modules/social/components/SocialHero.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Social hero displays correctly

## Files to Migrate
- `components/social-links/SocialLinksHero.tsx` → `modules/social/components/SocialHero.tsx`

## Tasks

1. Copy `components/social-links/SocialLinksHero.tsx` to `modules/social/components/SocialHero.tsx`
2. Rename component from `SocialLinksHero` to `SocialHero` (optional, can keep original name)
3. Update any internal imports if needed
4. Update `components/social-links/SocialLinksHero.tsx` to re-export:
   ```typescript
   export * from '@modules/social/components/SocialHero';
   export { SocialHero as SocialLinksHero } from '@modules/social/components/SocialHero';
   ```
5. Add to `modules/social/index.ts` barrel export

## Testing
- `npm run build` passes
- Social page hero section displays correctly
- Title and description render

## Estimated Effort
10 minutes
