# Story 2.3: Migrate Configuration

## Description
Move configuration files from `lib/config/` to `shared/config/`.

## Acceptance Criteria
- [ ] All config files copied to `shared/config/`
- [ ] Barrel export created in `shared/config/index.ts`
- [ ] Old imports continue to work via re-exports
- [ ] Build passes

## Files to Migrate
- `lib/config/feature-flags.ts` → `shared/config/feature-flags.ts`
- `lib/config/env.ts` → `shared/config/env.ts`
- `lib/config/pagination.ts` → `shared/config/pagination.ts`
- `lib/config/observability.ts` → `shared/config/observability.ts`

## Tasks

1. Copy all config files to `shared/config/`
2. Update internal imports within the files if needed
3. Create `shared/config/index.ts` barrel export
4. Create re-export file at `lib/config/index.ts`:
   ```typescript
   export * from '@shared/config';
   ```

## Testing
- `npm run build` passes
- Feature flags still work on all pages
- Environment variables resolve correctly

## Estimated Effort
15 minutes
