# Story 8.7: Create DirectoryPageView and Update Route

## Description
Create a DirectoryPageView component that orchestrates all Directory module components, and update the route to use it.

## Acceptance Criteria
- [ ] DirectoryPageView created in `modules/directory/components/`
- [ ] Route updated to use DirectoryPageView
- [ ] Build passes
- [ ] Directory page fully functional

## Tasks

1. Create `modules/directory/components/DirectoryPageView.tsx`:
   ```typescript
   import { DirectoryContent } from './DirectoryContent';
   // Add any additional orchestration logic here

   export function DirectoryPageView() {
     return <DirectoryContent />;
   }
   ```

2. Update `modules/directory/index.ts`:
   ```typescript
   export * from './components/DirectoryHero';
   export * from './components/DirectoryFilters';
   export * from './components/DirectoryTable';
   export * from './components/DirectoryList';
   export * from './components/DirectoryContent';
   export * from './components/DirectoryPageView';
   ```

3. Update `app/(pages)/directory/page.tsx` to import from module:
   ```typescript
   import { DirectoryPageView } from '@modules/directory';
   ```

## Testing
- `npm run build` passes
- Navigate to /directory - page renders correctly
- All functionality preserved
- Filters and sorting work

## Estimated Effort
15 minutes
