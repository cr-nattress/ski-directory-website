# Story 4.2: Remove Deprecated Hooks

## Description
Remove the deprecated hooks after all consumers have been migrated to the new Query-based hooks.

## Acceptance Criteria
- [ ] All consumers verified using new hooks
- [ ] Deprecated hooks removed
- [ ] No TypeScript errors after removal
- [ ] Build passes successfully

## Technical Details

### Pre-requisites
Before removing any hook, verify no imports remain:
```bash
# Check for remaining imports
grep -r "from '@/lib/hooks/useResorts'" apps/v1 --include="*.tsx" --include="*.ts"
grep -r "from '@/lib/hooks/useResort'" apps/v1 --include="*.tsx" --include="*.ts"
grep -r "from '@/lib/hooks/useMapPins'" apps/v1 --include="*.tsx" --include="*.ts"
grep -r "from '@/lib/hooks/useResortSearch'" apps/v1 --include="*.tsx" --include="*.ts"
grep -r "from '@/lib/hooks/useEventBanner'" apps/v1 --include="*.tsx" --include="*.ts"
```

### Files to Remove (or convert to re-exports)

Option A: Remove entirely
- `lib/hooks/useResorts.ts` - if all consumers migrated
- `lib/hooks/useResort.ts` - if all consumers migrated
- `lib/hooks/useMapPins.ts` - if all consumers migrated
- `lib/hooks/useResortSearch.ts` - if all consumers migrated
- `lib/hooks/useEventBanner.ts` - if all consumers migrated

Option B: Convert to re-exports (safer)
```typescript
// lib/hooks/useResorts.ts
/**
 * @deprecated Use hooks from '@shared/api' instead
 */
export {
  useResortsQuery as useResorts,
  useAllResortsQuery as useAllResorts,
  useResortsByPassQuery as useResortsByPass,
} from '@shared/api';
```

### Update lib/hooks/index.ts
Remove or update exports for deprecated hooks.

### Recommended Approach
1. First convert deprecated hooks to re-exports (Option B)
2. Verify build passes
3. In a later cleanup PR, remove the re-export files entirely

## Testing
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No runtime errors
- [ ] All pages function correctly

## Estimate
Small (1-2 hours)
