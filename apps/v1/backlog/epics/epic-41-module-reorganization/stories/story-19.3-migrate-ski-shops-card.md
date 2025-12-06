# Story 19.3: Migrate SkiShopsCard Component

## Description
Move the SkiShopsCard component from `components/resort-detail/` to `modules/resort-detail/components/shops/`.

## Acceptance Criteria
- [ ] SkiShopsCard copied to `modules/resort-detail/components/shops/SkiShopsCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Ski shops card section displays correctly

## Files to Migrate
- `components/resort-detail/SkiShopsCard.tsx` → `modules/resort-detail/components/shops/SkiShopsCard.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/shops/SkiShopsCard.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/shops/index.ts` barrel export

## Testing
- `npm run build` passes
- Shops section card displays on desktop

## Estimated Effort
10 minutes
