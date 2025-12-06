# Story 2.4: Migrate Cross-Cutting Hooks

## Description
Move truly cross-cutting hooks (used by multiple modules) from `lib/hooks/` to `shared/hooks/`.

## Acceptance Criteria
- [ ] Cross-cutting hooks copied to `shared/hooks/`
- [ ] Barrel export created in `shared/hooks/index.ts`
- [ ] Old imports continue to work via re-exports
- [ ] Build passes

## Hooks to Migrate (Cross-Cutting Only)
- `lib/hooks/useIntersectionObserver.ts` → `shared/hooks/`
- `lib/hooks/useFeatureFlag.ts` → `shared/hooks/`
- `lib/hooks/usePullToRefresh.ts` → `shared/hooks/`
- `lib/hooks/useLogger.ts` → `shared/hooks/`
- `lib/hooks/useImpressionTracking.ts` → `shared/hooks/`

## Hooks NOT to Migrate Yet (Domain-Specific)
These will be moved to their respective modules later:
- `useResort`, `useResorts`, `useResortSearch` → modules/directory or modules/resort-detail
- `useMapPins`, `useViewMode` → modules/dashboard
- `useThemedResorts`, `useRankedResorts` → modules/dashboard
- `useResortConditions` → modules/resort-detail

## Tasks

1. Copy cross-cutting hooks to `shared/hooks/`
2. Update internal imports within the hooks if needed
3. Create `shared/hooks/index.ts` barrel export
4. Update `lib/hooks/index.ts` to include re-exports

## Testing
- `npm run build` passes
- Feature flags work on all pages
- Intersection observer still triggers lazy loading
- Pull to refresh works on mobile

## Estimated Effort
20 minutes
