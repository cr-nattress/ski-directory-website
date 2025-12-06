# Story 10.3: Migrate ResortRowCard Component

## Description
Move the ResortRowCard component from `components/` to `modules/dashboard/components/discovery/`.

## Acceptance Criteria
- [ ] ResortRowCard copied to `modules/dashboard/components/discovery/ResortRowCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort row cards display correctly

## Files to Migrate
- `components/ResortRowCard.tsx` → `modules/dashboard/components/discovery/ResortRowCard.tsx`

## Tasks

1. Copy `components/ResortRowCard.tsx` to `modules/dashboard/components/discovery/ResortRowCard.tsx`
2. Update any internal imports if needed
3. Update `components/ResortRowCard.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/discovery/ResortRowCard';
   ```
4. Add to `modules/dashboard/components/discovery/index.ts` barrel export

## Testing
- `npm run build` passes
- Cards in discovery rows render correctly
- Card click navigates to resort detail

## Estimated Effort
10 minutes
