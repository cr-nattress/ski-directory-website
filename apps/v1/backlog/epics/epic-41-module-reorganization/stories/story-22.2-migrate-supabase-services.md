# Story 22.2: Migrate Supabase Services

## Description
Move Supabase-related services from `lib/api/` to `services/`.

## Acceptance Criteria
- [ ] supabase-resort-service.ts copied to `services/`
- [ ] supabase-resort-adapter.ts copied to `services/`
- [ ] Old locations re-export from new location
- [ ] Build passes

## Files to Migrate
- `lib/api/supabase-resort-service.ts` → `services/supabase-resort-service.ts`
- `lib/api/supabase-resort-adapter.ts` → `services/supabase-resort-adapter.ts`

## Tasks

1. Copy Supabase service files to `services/`
2. Update internal imports if needed
3. Update old files to re-export from new location
4. Add to `services/index.ts` barrel export

## Testing
- `npm run build` passes
- Supabase queries work correctly
- Data adapters transform data correctly

## Estimated Effort
15 minutes
