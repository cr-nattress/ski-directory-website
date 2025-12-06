# Story 5.3: Migrate PullToRefreshIndicator Component

## Description
Move the PullToRefreshIndicator component from `components/` to `ui/feedback/`.

## Acceptance Criteria
- [ ] PullToRefreshIndicator component copied to `ui/feedback/PullToRefreshIndicator.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Pull to refresh works on mobile

## Files to Migrate
- `components/PullToRefreshIndicator.tsx` → `ui/feedback/PullToRefreshIndicator.tsx`

## Tasks

1. Copy `components/PullToRefreshIndicator.tsx` to `ui/feedback/PullToRefreshIndicator.tsx`
2. Update any internal imports if needed
3. Update `components/PullToRefreshIndicator.tsx` to re-export:
   ```typescript
   export * from '@ui/feedback/PullToRefreshIndicator';
   ```
4. Add to `ui/feedback/index.ts` barrel export

## Testing
- `npm run build` passes
- Pull to refresh indicator shows on mobile
- Refresh triggers correctly

## Estimated Effort
10 minutes
