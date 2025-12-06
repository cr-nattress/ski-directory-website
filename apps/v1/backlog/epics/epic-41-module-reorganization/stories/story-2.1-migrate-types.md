# Story 2.1: Migrate Shared Types

## Description
Move TypeScript type definitions from `lib/types/` to `shared/types/`.

## Acceptance Criteria
- [ ] All type files copied to `shared/types/`
- [ ] Barrel export created in `shared/types/index.ts`
- [ ] Old `lib/types/index.ts` updated to re-export from new location
- [ ] All existing imports continue to work
- [ ] Build passes

## Files to Migrate
- `lib/types/resort.ts` → `shared/types/resort.ts`
- `lib/types/map.ts` → `shared/types/map.ts`
- `lib/types/category.ts` → `shared/types/category.ts`
- `lib/types/article.ts` → `shared/types/article.ts`
- `lib/types/ski-links.ts` → `shared/types/ski-links.ts`
- `lib/types/social-links.ts` → `shared/types/social-links.ts`
- `lib/types/liftie.ts` → `shared/types/liftie.ts`
- `lib/types/dining.ts` → `shared/types/dining.ts`
- `lib/types/ski-shop.ts` → `shared/types/ski-shop.ts`
- `lib/types/wikipedia.ts` → `shared/types/wikipedia.ts`

## Tasks

1. Copy all type files to `shared/types/`
2. Create `shared/types/index.ts` with all exports
3. Update `lib/types/index.ts` to re-export:
   ```typescript
   // Temporary re-export for backwards compatibility
   export * from '@shared/types';
   ```
4. Verify build passes

## Testing
- `npm run build` passes
- Existing imports from `@/lib/types` still work
- New imports from `@shared/types` work

## Estimated Effort
20 minutes
