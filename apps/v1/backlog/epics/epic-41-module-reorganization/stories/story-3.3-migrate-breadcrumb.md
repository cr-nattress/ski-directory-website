# Story 3.3: Migrate Breadcrumb Component

## Description
Move the Breadcrumb component from `components/ui/` to `ui/layout/`.

## Acceptance Criteria
- [ ] Breadcrumb component copied to `ui/layout/Breadcrumb.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Breadcrumbs display correctly on all pages

## Files to Migrate
- `components/ui/Breadcrumb.tsx` → `ui/layout/Breadcrumb.tsx`

## Tasks

1. Copy `components/ui/Breadcrumb.tsx` to `ui/layout/Breadcrumb.tsx`
2. Update any internal imports if needed
3. Update `components/ui/Breadcrumb.tsx` to re-export:
   ```typescript
   export * from '@ui/layout/Breadcrumb';
   ```
4. Add to `ui/layout/index.ts` barrel export

## Testing
- `npm run build` passes
- Breadcrumbs work on directory page
- Breadcrumbs work on resort detail page
- Breadcrumbs work on links and social pages

## Estimated Effort
10 minutes
