# Story 4.1: Migrate Header Component

## Description
Move the Header component from `components/layout/` to `ui/layout/`.

## Acceptance Criteria
- [ ] Header component copied to `ui/layout/Header.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Header displays correctly on all pages

## Files to Migrate
- `components/layout/Header.tsx` → `ui/layout/Header.tsx`

## Tasks

1. Copy `components/layout/Header.tsx` to `ui/layout/Header.tsx`
2. Update any internal imports if needed
3. Update `components/layout/Header.tsx` to re-export:
   ```typescript
   export * from '@ui/layout/Header';
   ```
4. Add to `ui/layout/index.ts` barrel export

## Testing
- `npm run build` passes
- Header shows on all pages
- Navigation links work
- Mobile menu works

## Estimated Effort
10 minutes
