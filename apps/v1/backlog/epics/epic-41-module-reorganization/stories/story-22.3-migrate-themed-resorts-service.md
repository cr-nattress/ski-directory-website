# Story 22.3: Migrate Themed Resorts Service

## Description
Move the themed-resorts-service from `lib/services/` to `services/`.

## Acceptance Criteria
- [ ] themed-resorts-service.ts copied to `services/`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Themed resort sections work

## Files to Migrate
- `lib/services/themed-resorts-service.ts` → `services/themed-resorts-service.ts`

## Tasks

1. Copy `lib/services/themed-resorts-service.ts` to `services/themed-resorts-service.ts`
2. Update any internal imports if needed
3. Update `lib/services/themed-resorts-service.ts` to re-export:
   ```typescript
   export * from '@services/themed-resorts-service';
   ```
4. Add to `services/index.ts` barrel export

## Testing
- `npm run build` passes
- Homepage themed sections load
- Resort rankings work

## Estimated Effort
10 minutes
