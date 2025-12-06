# Story 9.1: Create Dashboard Module Structure

## Description
Create the Dashboard module directory structure in `modules/dashboard/`.

## Acceptance Criteria
- [ ] `modules/dashboard/` directory created
- [ ] `modules/dashboard/components/` directory created
- [ ] `modules/dashboard/hooks/` directory created
- [ ] `modules/dashboard/index.ts` barrel export created
- [ ] Build passes

## Tasks

1. Create directory structure:
   ```
   modules/dashboard/
   ├── components/
   │   ├── discovery/
   │   ├── map/
   │   └── cards/
   ├── hooks/
   └── index.ts
   ```

2. Create empty `modules/dashboard/index.ts`:
   ```typescript
   // Dashboard module exports
   // Components will be added in subsequent stories
   ```

## Testing
- `npm run build` passes
- Directory structure exists

## Estimated Effort
5 minutes
