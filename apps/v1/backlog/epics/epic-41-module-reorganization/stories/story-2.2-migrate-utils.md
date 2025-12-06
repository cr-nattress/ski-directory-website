# Story 2.2: Migrate Utility Functions

## Description
Move utility functions from `lib/utils.ts` and `lib/utils/` to `shared/utils/`.

## Acceptance Criteria
- [ ] `cn()` function moved to `shared/utils/cn.ts`
- [ ] Formatter functions moved to `shared/utils/formatters.ts`
- [ ] Barrel export created in `shared/utils/index.ts`
- [ ] Old `lib/utils.ts` updated to re-export from new location
- [ ] Build passes

## Files to Migrate
- `lib/utils.ts` (cn, formatDistance, etc.) → `shared/utils/`
- `lib/utils/resort-images.ts` → `shared/utils/resort-images.ts`
- `lib/utils/related-resorts.ts` → `shared/utils/related-resorts.ts`
- `lib/utils/generate-resort-faqs.ts` → `shared/utils/generate-resort-faqs.ts`

## Tasks

1. Create `shared/utils/cn.ts`:
   ```typescript
   import { type ClassValue, clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

2. Create `shared/utils/formatters.ts` with other utility functions

3. Copy remaining util files to `shared/utils/`

4. Create `shared/utils/index.ts` barrel export

5. Update `lib/utils.ts` to re-export:
   ```typescript
   export * from '@shared/utils';
   ```

## Testing
- `npm run build` passes
- All pages render correctly
- Check console for errors

## Estimated Effort
20 minutes
