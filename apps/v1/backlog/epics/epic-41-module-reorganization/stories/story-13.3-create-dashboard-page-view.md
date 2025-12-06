# Story 13.3: Create DashboardPageView and Update Route

## Description
Create a DashboardPageView component that orchestrates all Dashboard module components, and update the route to use it.

## Acceptance Criteria
- [ ] DashboardPageView created in `modules/dashboard/components/`
- [ ] Route updated to use DashboardPageView
- [ ] Build passes
- [ ] Homepage fully functional

## Tasks

1. Create `modules/dashboard/components/DashboardPageView.tsx`:
   ```typescript
   'use client';

   import { Hero } from './Hero';
   import { ViewToggle } from './ViewToggle';
   import { CategoryChips } from './CategoryChips';
   import { DiscoverySections } from './discovery/DiscoverySections';
   import { ResortMapViewWrapper } from './map/ResortMapViewWrapper';
   import { ResortGrid } from './cards/ResortGrid';
   // ... other imports

   export function DashboardPageView() {
     // Orchestration logic here
     return (
       <>
         <Hero />
         {/* View toggle and content */}
       </>
     );
   }
   ```

2. Update `modules/dashboard/index.ts` with all exports

3. Update `app/page.tsx` to import from module:
   ```typescript
   import { DashboardPageView } from '@modules/dashboard';
   ```

## Testing
- `npm run build` passes
- Navigate to / - page renders correctly
- Cards/Map toggle works
- All sections load
- Category filtering works

## Estimated Effort
20 minutes
