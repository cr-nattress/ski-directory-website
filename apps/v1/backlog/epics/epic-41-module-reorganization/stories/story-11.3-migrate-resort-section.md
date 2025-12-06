# Story 11.3: Migrate ResortSection Component

## Description
Move the ResortSection component from `components/` to `modules/dashboard/components/`.

## Acceptance Criteria
- [ ] ResortSection copied to `modules/dashboard/components/ResortSection.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort sections render correctly

## Files to Migrate
- `components/ResortSection.tsx` → `modules/dashboard/components/ResortSection.tsx`

## Tasks

1. Copy `components/ResortSection.tsx` to `modules/dashboard/components/ResortSection.tsx`
2. Update any internal imports if needed
3. Update `components/ResortSection.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/ResortSection';
   ```
4. Add to `modules/dashboard/index.ts` barrel export

## Testing
- `npm run build` passes
- Sections with titles render
- "See All" links work

## Estimated Effort
10 minutes
