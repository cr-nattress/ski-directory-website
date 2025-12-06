# Story 22.1: Migrate Resort Service

## Description
Move the resort-service from `lib/services/` to `services/`.

## Acceptance Criteria
- [ ] resort-service.ts copied to `services/resort-service.ts`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Resort data fetching works

## Files to Migrate
- `lib/services/resort-service.ts` → `services/resort-service.ts`

## Tasks

1. Create `services/` directory in the root of apps/v1
2. Copy `lib/services/resort-service.ts` to `services/resort-service.ts`
3. Update any internal imports if needed
4. Update `lib/services/resort-service.ts` to re-export:
   ```typescript
   export * from '@services/resort-service';
   ```
5. Create `services/index.ts` barrel export

## Testing
- `npm run build` passes
- Resort data loads on all pages
- API routes work correctly

## Estimated Effort
15 minutes
