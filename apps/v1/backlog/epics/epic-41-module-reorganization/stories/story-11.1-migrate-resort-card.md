# Story 11.1: Migrate ResortCard Component

## Description
Move the ResortCard component from `components/` to `modules/dashboard/components/cards/`.

## Acceptance Criteria
- [ ] ResortCard copied to `modules/dashboard/components/cards/ResortCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort cards display correctly

## Files to Migrate
- `components/ResortCard.tsx` → `modules/dashboard/components/cards/ResortCard.tsx`

## Tasks

1. Create `modules/dashboard/components/cards/` directory
2. Copy `components/ResortCard.tsx` to new location
3. Update any internal imports if needed
4. Update `components/ResortCard.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/cards/ResortCard';
   ```
5. Create `modules/dashboard/components/cards/index.ts` barrel export
6. Update `modules/dashboard/index.ts` to include cards exports

## Testing
- `npm run build` passes
- Resort cards show image, name, stats
- Card hover effects work
- Card click navigates to resort

## Estimated Effort
10 minutes
