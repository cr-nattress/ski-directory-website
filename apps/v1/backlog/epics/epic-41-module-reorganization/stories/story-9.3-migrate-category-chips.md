# Story 9.3: Migrate CategoryChips Component

## Description
Move the CategoryChips component from `components/` to `modules/dashboard/components/`.

## Acceptance Criteria
- [ ] CategoryChips copied to `modules/dashboard/components/CategoryChips.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Category chips filter correctly

## Files to Migrate
- `components/CategoryChips.tsx` → `modules/dashboard/components/CategoryChips.tsx`

## Tasks

1. Copy `components/CategoryChips.tsx` to `modules/dashboard/components/CategoryChips.tsx`
2. Update any internal imports if needed
3. Update `components/CategoryChips.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/CategoryChips';
   ```
4. Add to `modules/dashboard/index.ts` barrel export

## Testing
- `npm run build` passes
- Category chips display correctly
- Clicking chips filters resorts
- Active state styling works

## Estimated Effort
10 minutes
