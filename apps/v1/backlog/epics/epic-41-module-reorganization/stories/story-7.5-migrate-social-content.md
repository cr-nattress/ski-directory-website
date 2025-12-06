# Story 7.5: Migrate SocialContent Component

## Description
Move the SocialLinksContent component from `components/social-links/` to `modules/social/components/`.

## Acceptance Criteria
- [ ] SocialLinksContent copied to `modules/social/components/SocialContent.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Social page content renders correctly

## Files to Migrate
- `components/social-links/SocialLinksContent.tsx` → `modules/social/components/SocialContent.tsx`

## Tasks

1. Copy `components/social-links/SocialLinksContent.tsx` to `modules/social/components/SocialContent.tsx`
2. Update any internal imports to use module-relative paths
3. Update `components/social-links/SocialLinksContent.tsx` to re-export:
   ```typescript
   export * from '@modules/social/components/SocialContent';
   export { SocialContent as SocialLinksContent } from '@modules/social/components/SocialContent';
   ```
4. Add to `modules/social/index.ts` barrel export

## Testing
- `npm run build` passes
- Social page renders with all sections
- Filtering works end-to-end

## Estimated Effort
10 minutes
