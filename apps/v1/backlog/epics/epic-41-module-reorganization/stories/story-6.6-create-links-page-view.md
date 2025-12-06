# Story 6.6: Create LinksPageView and Update Route

## Description
Create a LinksPageView component that orchestrates all Links module components, and update the route to use it.

## Acceptance Criteria
- [ ] LinksPageView created in `modules/links/components/`
- [ ] Route updated to use LinksPageView
- [ ] Build passes
- [ ] Links page fully functional

## Tasks

1. Create `modules/links/components/LinksPageView.tsx`:
   ```typescript
   import { LinksContent } from './LinksContent';
   // Add any additional orchestration logic here

   export function LinksPageView() {
     return <LinksContent />;
   }
   ```

2. Update `modules/links/index.ts`:
   ```typescript
   export * from './components/LinksHero';
   export * from './components/LinksFilters';
   export * from './components/LinksList';
   export * from './components/LinkCard';
   export * from './components/LinksContent';
   export * from './components/LinksPageView';
   ```

3. Update `app/(pages)/links/page.tsx` to import from module:
   ```typescript
   import { LinksPageView } from '@modules/links';
   ```

## Testing
- `npm run build` passes
- Navigate to /links - page renders correctly
- All functionality preserved

## Estimated Effort
15 minutes
