# Story 3.2: Migrate Accordion Component

## Description
Move the Accordion component from `components/ui/` to `ui/primitives/`.

## Acceptance Criteria
- [ ] Accordion component copied to `ui/primitives/Accordion.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Accordion functionality works on mobile resort sections

## Files to Migrate
- `components/ui/Accordion.tsx` → `ui/primitives/Accordion.tsx`

## Tasks

1. Copy `components/ui/Accordion.tsx` to `ui/primitives/Accordion.tsx`
2. Update any internal imports if needed
3. Update `components/ui/Accordion.tsx` to re-export:
   ```typescript
   export * from '@ui/primitives/Accordion';
   ```
4. Add to `ui/primitives/index.ts` barrel export

## Testing
- `npm run build` passes
- Mobile resort detail accordions expand/collapse
- Mobile dashboard sections expand/collapse

## Estimated Effort
10 minutes
