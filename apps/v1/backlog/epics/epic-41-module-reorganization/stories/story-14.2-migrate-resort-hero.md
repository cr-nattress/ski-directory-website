# Story 14.2: Migrate ResortHero Component

## Description
Move the ResortHero component from `components/resort-detail/` to `modules/resort-detail/components/`.

## Acceptance Criteria
- [ ] ResortHero copied to `modules/resort-detail/components/ResortHero.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort hero displays correctly

## Files to Migrate
- `components/resort-detail/ResortHero.tsx` → `modules/resort-detail/components/ResortHero.tsx`

## Tasks

1. Copy `components/resort-detail/ResortHero.tsx` to `modules/resort-detail/components/ResortHero.tsx`
2. Update any internal imports if needed
3. Update `components/resort-detail/ResortHero.tsx` to re-export:
   ```typescript
   export * from '@modules/resort-detail/components/ResortHero';
   ```
4. Add to `modules/resort-detail/index.ts` barrel export

## Testing
- `npm run build` passes
- Resort detail hero shows name, badges, image
- Pass type chips display correctly

## Estimated Effort
10 minutes
