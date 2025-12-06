# Story 21.2: Migrate ResortDetail Component

## Description
Move the main ResortDetail component from `components/resort-detail/` to `modules/resort-detail/components/`.

## Acceptance Criteria
- [ ] ResortDetail copied to `modules/resort-detail/components/ResortDetail.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort detail page renders correctly

## Files to Migrate
- `components/resort-detail/ResortDetail.tsx` → `modules/resort-detail/components/ResortDetail.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/ResortDetail.tsx`
2. Update internal imports to use module-relative paths
3. Update old file to re-export
4. Add to `modules/resort-detail/index.ts` barrel export

## Testing
- `npm run build` passes
- Resort detail page renders all sections
- Desktop and mobile layouts work

## Estimated Effort
15 minutes
