# Story 20.3: Migrate RelatedResorts Component

## Description
Move the RelatedResorts component from `components/resort-detail/` to `modules/resort-detail/components/related/`.

## Acceptance Criteria
- [ ] RelatedResorts copied to `modules/resort-detail/components/related/RelatedResorts.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Related resorts display correctly

## Files to Migrate
- `components/resort-detail/RelatedResorts.tsx` → `modules/resort-detail/components/related/RelatedResorts.tsx`

## Tasks

1. Create `modules/resort-detail/components/related/` directory
2. Copy component to new location
3. Update any internal imports if needed
4. Update old file to re-export
5. Create `modules/resort-detail/components/related/index.ts` barrel export
6. Update `modules/resort-detail/index.ts` to include related exports

## Testing
- `npm run build` passes
- Related resorts show nearby resorts

## Estimated Effort
10 minutes
