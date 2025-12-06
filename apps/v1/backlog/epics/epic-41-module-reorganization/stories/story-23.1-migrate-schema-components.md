# Story 23.1: Migrate Schema Components

## Description
Move JSON-LD schema components from `components/schema/` to `shared/schema/`.

## Acceptance Criteria
- [ ] Schema components copied to `shared/schema/`
- [ ] Old locations re-export from new location
- [ ] Build passes
- [ ] JSON-LD schema renders in page source

## Files to Migrate
- `components/schema/ResortSchema.tsx` → `shared/schema/ResortSchema.tsx`
- `components/schema/DirectorySchema.tsx` → `shared/schema/DirectorySchema.tsx`
- Any other schema components

## Tasks

1. Create `shared/schema/` directory
2. Copy schema components to new location
3. Update any internal imports if needed
4. Update old files to re-export from new location
5. Create `shared/schema/index.ts` barrel export
6. Update `shared/index.ts` to include schema exports

## Testing
- `npm run build` passes
- View page source - JSON-LD schema present
- Schema validates correctly

## Estimated Effort
15 minutes
