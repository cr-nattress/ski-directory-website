# Story 20.4: Migrate RelatedResortsSection Component

## Description
Move the RelatedResortsSection component from `components/resort-detail/` to `modules/resort-detail/components/related/`.

## Acceptance Criteria
- [ ] RelatedResortsSection copied to `modules/resort-detail/components/related/RelatedResortsSection.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Related resorts section displays correctly

## Files to Migrate
- `components/resort-detail/RelatedResortsSection.tsx` → `modules/resort-detail/components/related/RelatedResortsSection.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/related/RelatedResortsSection.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/related/index.ts` barrel export

## Testing
- `npm run build` passes
- Related resorts section displays on desktop

## Estimated Effort
10 minutes
