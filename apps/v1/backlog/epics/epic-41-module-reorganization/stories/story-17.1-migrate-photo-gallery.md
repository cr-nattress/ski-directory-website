# Story 17.1: Migrate PhotoGallery Component

## Description
Move the PhotoGallery component from `components/resort-detail/` to `modules/resort-detail/components/media/`.

## Acceptance Criteria
- [ ] PhotoGallery copied to `modules/resort-detail/components/media/PhotoGallery.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Photo gallery displays correctly

## Files to Migrate
- `components/resort-detail/PhotoGallery.tsx` → `modules/resort-detail/components/media/PhotoGallery.tsx`

## Tasks

1. Create `modules/resort-detail/components/media/` directory
2. Copy component to new location
3. Update any internal imports if needed
4. Update old file to re-export
5. Create `modules/resort-detail/components/media/index.ts` barrel export
6. Update `modules/resort-detail/index.ts` to include media exports

## Testing
- `npm run build` passes
- Photo gallery displays resort images
- Gallery navigation works

## Estimated Effort
10 minutes
