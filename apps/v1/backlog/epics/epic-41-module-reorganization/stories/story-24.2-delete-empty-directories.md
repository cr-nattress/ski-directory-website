# Story 24.2: Delete Empty Component Directories

## Description
Remove empty directories from the old structure after migration is complete.

## Acceptance Criteria
- [ ] All empty directories identified
- [ ] Empty directories deleted
- [ ] Build passes

## Tasks

1. Check each directory under `components/`:
   - `components/layout/` - Should be empty or deletable
   - `components/directory/` - Should be empty or deletable
   - `components/ski-links/` - Should be empty or deletable
   - `components/social-links/` - Should be empty or deletable
   - `components/resort-detail/` - Should be empty or deletable
   - `components/ui/` - Should be empty or deletable
   - `components/schema/` - Should be empty or deletable

2. Delete empty directories

3. Check `lib/` directories:
   - `lib/types/` - May still be needed for Supabase types
   - `lib/hooks/` - Should be mostly empty
   - `lib/config/` - Should be mostly empty
   - `lib/services/` - Should be mostly empty

## Testing
- `npm run build` passes
- No import errors

## Notes
- Keep any files that are still needed
- Be cautious with `lib/` directories that may have non-migrated files

## Estimated Effort
15 minutes
