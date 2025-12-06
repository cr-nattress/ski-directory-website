# Story 20.5: Migrate RelatedResortsAccordion Component

## Description
Move the RelatedResortsAccordion component from `components/resort-detail/` to `modules/resort-detail/components/related/`.

## Acceptance Criteria
- [ ] RelatedResortsAccordion copied to `modules/resort-detail/components/related/RelatedResortsAccordion.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Related resorts accordion displays correctly on mobile

## Files to Migrate
- `components/resort-detail/RelatedResortsAccordion.tsx` → `modules/resort-detail/components/related/RelatedResortsAccordion.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/related/RelatedResortsAccordion.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/related/index.ts` barrel export

## Testing
- `npm run build` passes
- Related resorts accordion expands/collapses on mobile

## Estimated Effort
10 minutes
