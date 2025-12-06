# Story 21.3: Create ResortDetailPageView and Update Route

## Description
Create a ResortDetailPageView component that orchestrates all Resort Detail module components, and update the route to use it.

## Acceptance Criteria
- [ ] ResortDetailPageView created in `modules/resort-detail/components/`
- [ ] Route updated to use ResortDetailPageView
- [ ] Build passes
- [ ] Resort detail page fully functional

## Tasks

1. Create `modules/resort-detail/components/ResortDetailPageView.tsx`:
   ```typescript
   import { ResortDetail } from './ResortDetail';

   interface ResortDetailPageViewProps {
     resort: Resort;
   }

   export function ResortDetailPageView({ resort }: ResortDetailPageViewProps) {
     return <ResortDetail resort={resort} />;
   }
   ```

2. Update `modules/resort-detail/index.ts` with all exports

3. Update `app/[state]/[slug]/page.tsx` to import from module:
   ```typescript
   import { ResortDetailPageView } from '@modules/resort-detail';
   ```

## Testing
- `npm run build` passes
- Navigate to any resort detail page
- All sections render correctly
- Mobile and desktop views work
- Conditions data loads
- Related resorts show

## Estimated Effort
20 minutes
