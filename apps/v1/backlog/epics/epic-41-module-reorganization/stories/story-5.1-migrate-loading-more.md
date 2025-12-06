# Story 5.1: Migrate LoadingMore Component

## Description
Move the LoadingMore component from `components/` to `ui/feedback/`.

## Acceptance Criteria
- [ ] LoadingMore component copied to `ui/feedback/LoadingMore.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Loading indicator displays during pagination

## Files to Migrate
- `components/LoadingMore.tsx` → `ui/feedback/LoadingMore.tsx`

## Tasks

1. Copy `components/LoadingMore.tsx` to `ui/feedback/LoadingMore.tsx`
2. Update any internal imports if needed
3. Update `components/LoadingMore.tsx` to re-export:
   ```typescript
   export * from '@ui/feedback/LoadingMore';
   ```
4. Add to `ui/feedback/index.ts` barrel export

## Testing
- `npm run build` passes
- Loading indicator shows when loading more items
- Animation works correctly

## Estimated Effort
10 minutes
