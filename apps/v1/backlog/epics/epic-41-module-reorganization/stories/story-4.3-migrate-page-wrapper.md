# Story 4.3: Migrate PageWrapper Component

## Description
Move the PageWrapper component from `components/layout/` to `ui/layout/`.

## Acceptance Criteria
- [ ] PageWrapper component copied to `ui/layout/PageWrapper.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Page layout structure maintained

## Files to Migrate
- `components/layout/PageWrapper.tsx` → `ui/layout/PageWrapper.tsx`

## Tasks

1. Copy `components/layout/PageWrapper.tsx` to `ui/layout/PageWrapper.tsx`
2. Update any internal imports if needed
3. Update `components/layout/PageWrapper.tsx` to re-export:
   ```typescript
   export * from '@ui/layout/PageWrapper';
   ```
4. Add to `ui/layout/index.ts` barrel export

## Testing
- `npm run build` passes
- All pages maintain correct layout structure
- Header/Footer positioning correct

## Estimated Effort
10 minutes
