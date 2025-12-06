# Story 17.2: Migrate WebcamGallery Component

## Description
Move the WebcamGallery component from `components/resort-detail/` to `modules/resort-detail/components/media/`.

## Acceptance Criteria
- [ ] WebcamGallery copied to `modules/resort-detail/components/media/WebcamGallery.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Webcam gallery displays correctly

## Files to Migrate
- `components/resort-detail/WebcamGallery.tsx` → `modules/resort-detail/components/media/WebcamGallery.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/media/WebcamGallery.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/media/index.ts` barrel export

## Testing
- `npm run build` passes
- Webcam feeds display
- Webcam thumbnails work

## Estimated Effort
10 minutes
