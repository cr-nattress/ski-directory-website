# Story 19.1: Migrate SkiShopCard Component

## Description
Move the SkiShopCard component from `components/resort-detail/` to `modules/resort-detail/components/shops/`.

## Acceptance Criteria
- [ ] SkiShopCard copied to `modules/resort-detail/components/shops/SkiShopCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Ski shop card displays correctly

## Files to Migrate
- `components/resort-detail/SkiShopCard.tsx` → `modules/resort-detail/components/shops/SkiShopCard.tsx`

## Tasks

1. Create `modules/resort-detail/components/shops/` directory
2. Copy component to new location
3. Update any internal imports if needed
4. Update old file to re-export
5. Create `modules/resort-detail/components/shops/index.ts` barrel export
6. Update `modules/resort-detail/index.ts` to include shops exports

## Testing
- `npm run build` passes
- Individual ski shop card displays

## Estimated Effort
10 minutes
