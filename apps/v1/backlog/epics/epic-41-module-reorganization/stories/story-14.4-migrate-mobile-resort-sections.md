# Story 14.4: Migrate MobileResortSections Component

## Description
Move the MobileResortSections component from `components/resort-detail/` to `modules/resort-detail/components/`.

## Acceptance Criteria
- [ ] MobileResortSections copied to `modules/resort-detail/components/MobileResortSections.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Mobile accordion sections work

## Files to Migrate
- `components/resort-detail/MobileResortSections.tsx` → `modules/resort-detail/components/MobileResortSections.tsx`

## Tasks

1. Copy `components/resort-detail/MobileResortSections.tsx` to `modules/resort-detail/components/MobileResortSections.tsx`
2. Update any internal imports if needed
3. Update `components/resort-detail/MobileResortSections.tsx` to re-export:
   ```typescript
   export * from '@modules/resort-detail/components/MobileResortSections';
   ```
4. Add to `modules/resort-detail/index.ts` barrel export

## Testing
- `npm run build` passes
- Mobile view shows accordion sections
- Sections expand/collapse correctly

## Estimated Effort
10 minutes
