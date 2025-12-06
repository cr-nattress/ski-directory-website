# Story 3.4: Migrate ResortImage Component

## Description
Move the ResortImage component from `components/` to `ui/media/`.

## Acceptance Criteria
- [ ] ResortImage component copied to `ui/media/ResortImage.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort images display correctly with fallbacks

## Files to Migrate
- `components/ResortImage.tsx` → `ui/media/ResortImage.tsx`

## Tasks

1. Copy `components/ResortImage.tsx` to `ui/media/ResortImage.tsx`
2. Update any internal imports if needed
3. Update `components/ResortImage.tsx` to re-export:
   ```typescript
   export * from '@ui/media/ResortImage';
   ```
4. Add to `ui/media/index.ts` barrel export

## Testing
- `npm run build` passes
- Resort cards show images correctly
- Image fallbacks work when image fails to load

## Estimated Effort
10 minutes
