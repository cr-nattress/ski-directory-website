# Story 10.1: Migrate DiscoverySections Component

## Description
Move the DiscoverySections component from `components/` to `modules/dashboard/components/discovery/`.

## Acceptance Criteria
- [ ] DiscoverySections copied to `modules/dashboard/components/discovery/DiscoverySections.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Discovery sections render on homepage

## Files to Migrate
- `components/DiscoverySections.tsx` → `modules/dashboard/components/discovery/DiscoverySections.tsx`

## Tasks

1. Create `modules/dashboard/components/discovery/` directory
2. Copy `components/DiscoverySections.tsx` to new location
3. Update any internal imports if needed
4. Update `components/DiscoverySections.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/discovery/DiscoverySections';
   ```
5. Create `modules/dashboard/components/discovery/index.ts` barrel export
6. Update `modules/dashboard/index.ts` to include discovery exports

## Testing
- `npm run build` passes
- Discovery sections render with themed rows
- "See All" links work

## Estimated Effort
10 minutes
