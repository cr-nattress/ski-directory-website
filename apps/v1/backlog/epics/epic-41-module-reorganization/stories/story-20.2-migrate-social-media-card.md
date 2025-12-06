# Story 20.2: Migrate SocialMediaCard Component

## Description
Move the SocialMediaCard component from `components/resort-detail/` to `modules/resort-detail/components/`.

## Acceptance Criteria
- [ ] SocialMediaCard copied to `modules/resort-detail/components/SocialMediaCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Social media card displays correctly

## Files to Migrate
- `components/resort-detail/SocialMediaCard.tsx` → `modules/resort-detail/components/SocialMediaCard.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/SocialMediaCard.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/index.ts` barrel export

## Testing
- `npm run build` passes
- Social media links display
- Links open in new tab

## Estimated Effort
10 minutes
