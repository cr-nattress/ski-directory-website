# Story 13.1: Migrate Hero Component

## Description
Move the Hero component from `components/` to `modules/dashboard/components/`.

## Acceptance Criteria
- [ ] Hero copied to `modules/dashboard/components/Hero.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Hero displays correctly on homepage

## Files to Migrate
- `components/Hero.tsx` → `modules/dashboard/components/Hero.tsx`

## Tasks

1. Copy `components/Hero.tsx` to `modules/dashboard/components/Hero.tsx`
2. Update any internal imports if needed
3. Update `components/Hero.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/Hero';
   ```
4. Add to `modules/dashboard/index.ts` barrel export

## Testing
- `npm run build` passes
- Hero renders on homepage
- Hero image and text display
- Search/CTA buttons work

## Estimated Effort
10 minutes
