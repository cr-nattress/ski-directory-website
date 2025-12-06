# Story 7.3: Migrate SocialFilters Component

## Description
Move the SocialLinksFilters component from `components/social-links/` to `modules/social/components/`.

## Acceptance Criteria
- [ ] SocialLinksFilters copied to `modules/social/components/SocialFilters.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Filter dropdowns work correctly

## Files to Migrate
- `components/social-links/SocialLinksFilters.tsx` → `modules/social/components/SocialFilters.tsx`

## Tasks

1. Copy `components/social-links/SocialLinksFilters.tsx` to `modules/social/components/SocialFilters.tsx`
2. Rename component from `SocialLinksFilters` to `SocialFilters` (optional, can keep original name)
3. Update any internal imports if needed
4. Update `components/social-links/SocialLinksFilters.tsx` to re-export:
   ```typescript
   export * from '@modules/social/components/SocialFilters';
   export { SocialFilters as SocialLinksFilters } from '@modules/social/components/SocialFilters';
   ```
5. Add to `modules/social/index.ts` barrel export

## Testing
- `npm run build` passes
- Platform and state filters work
- Mobile layout shows full-width dropdowns

## Estimated Effort
10 minutes
