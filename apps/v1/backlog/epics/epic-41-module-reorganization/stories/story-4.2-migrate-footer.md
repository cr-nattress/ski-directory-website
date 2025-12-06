# Story 4.2: Migrate Footer Component

## Description
Move the Footer component from `components/layout/` to `ui/layout/`.

## Acceptance Criteria
- [ ] Footer component copied to `ui/layout/Footer.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Footer displays correctly on all pages

## Files to Migrate
- `components/layout/Footer.tsx` → `ui/layout/Footer.tsx`

## Tasks

1. Copy `components/layout/Footer.tsx` to `ui/layout/Footer.tsx`
2. Update any internal imports if needed
3. Update `components/layout/Footer.tsx` to re-export:
   ```typescript
   export * from '@ui/layout/Footer';
   ```
4. Add to `ui/layout/index.ts` barrel export

## Testing
- `npm run build` passes
- Footer shows at bottom of all pages
- Footer links work correctly

## Estimated Effort
10 minutes
