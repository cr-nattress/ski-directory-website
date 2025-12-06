# Story 7.6: Create SocialPageView and Update Route

## Description
Create a SocialPageView component that orchestrates all Social module components, and update the route to use it.

## Acceptance Criteria
- [ ] SocialPageView created in `modules/social/components/`
- [ ] Route updated to use SocialPageView
- [ ] Build passes
- [ ] Social page fully functional

## Tasks

1. Create `modules/social/components/SocialPageView.tsx`:
   ```typescript
   import { SocialContent } from './SocialContent';
   // Add any additional orchestration logic here

   export function SocialPageView() {
     return <SocialContent />;
   }
   ```

2. Update `modules/social/index.ts`:
   ```typescript
   export * from './components/SocialHero';
   export * from './components/SocialFilters';
   export * from './components/SocialList';
   export * from './components/SocialCard';
   export * from './components/SocialContent';
   export * from './components/SocialPageView';
   ```

3. Update `app/(pages)/social/page.tsx` to import from module:
   ```typescript
   import { SocialPageView } from '@modules/social';
   ```

## Testing
- `npm run build` passes
- Navigate to /social - page renders correctly
- All functionality preserved

## Estimated Effort
15 minutes
