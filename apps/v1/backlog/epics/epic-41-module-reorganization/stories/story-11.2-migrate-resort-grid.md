# Story 11.2: Migrate ResortGrid Component

## Description
Move the ResortGrid component from `components/` to `modules/dashboard/components/cards/`.

## Acceptance Criteria
- [ ] ResortGrid copied to `modules/dashboard/components/cards/ResortGrid.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort grid renders correctly

## Files to Migrate
- `components/ResortGrid.tsx` → `modules/dashboard/components/cards/ResortGrid.tsx`

## Tasks

1. Copy `components/ResortGrid.tsx` to `modules/dashboard/components/cards/ResortGrid.tsx`
2. Update any internal imports if needed
3. Update `components/ResortGrid.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/cards/ResortGrid';
   ```
4. Add to `modules/dashboard/components/cards/index.ts` barrel export

## Testing
- `npm run build` passes
- Grid of resort cards displays
- Responsive columns work
- Infinite scroll/pagination works

## Estimated Effort
10 minutes
