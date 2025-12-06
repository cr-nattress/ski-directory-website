# Story 19.2: Migrate SkiShopsList Component

## Description
Move the SkiShopsList component from `components/resort-detail/` to `modules/resort-detail/components/shops/`.

## Acceptance Criteria
- [ ] SkiShopsList copied to `modules/resort-detail/components/shops/SkiShopsList.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Ski shops list displays correctly

## Files to Migrate
- `components/resort-detail/SkiShopsList.tsx` → `modules/resort-detail/components/shops/SkiShopsList.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/shops/SkiShopsList.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/shops/index.ts` barrel export

## Testing
- `npm run build` passes
- List of ski shops displays

## Estimated Effort
10 minutes
