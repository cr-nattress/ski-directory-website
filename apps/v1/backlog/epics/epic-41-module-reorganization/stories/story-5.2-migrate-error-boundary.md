# Story 5.2: Migrate ErrorBoundary Component

## Description
Move the ErrorBoundary component from `components/` to `ui/feedback/`.

## Acceptance Criteria
- [ ] ErrorBoundary component copied to `ui/feedback/ErrorBoundary.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Error boundary catches and displays errors

## Files to Migrate
- `components/ErrorBoundary.tsx` → `ui/feedback/ErrorBoundary.tsx`

## Tasks

1. Copy `components/ErrorBoundary.tsx` to `ui/feedback/ErrorBoundary.tsx`
2. Update any internal imports if needed
3. Update `components/ErrorBoundary.tsx` to re-export:
   ```typescript
   export * from '@ui/feedback/ErrorBoundary';
   ```
4. Add to `ui/feedback/index.ts` barrel export

## Testing
- `npm run build` passes
- Error boundary wraps components correctly
- Error UI displays when error occurs

## Estimated Effort
10 minutes
