# Story 4.1: Update Consumers to Use New Hooks

## Description
Migrate key components from deprecated hooks to the new Query-based hooks. This is done incrementally, one component at a time.

## Acceptance Criteria
- [ ] Hero component migrated to useAllResortsQuery
- [ ] ResortMapView migrated to useMapPinsQuery
- [ ] SearchModal migrated to useSearchQuery
- [ ] PageWrapper migrated to useAlertsQuery
- [ ] All migrations verified working

## Technical Details

### Components to Migrate

#### 1. Hero.tsx
```tsx
// Before
const { resorts } = useAllResorts();

// After
const { data: resorts = [] } = useAllResortsQuery();
```

#### 2. ResortMapView.tsx (or ResortMapWrapper)
```tsx
// Before
const { pins, isLoading } = useMapPins();

// After
const { data: pins = [], isLoading } = useMapPinsQuery();
```

#### 3. SearchModal.tsx
```tsx
// Before
const { results, isSearching } = useResortSearch(query);

// After
const { data: results = [], isLoading: isSearching } = useSearchQuery(query);
```

#### 4. PageWrapper.tsx (via useEventBanner)
```tsx
// Before
const { activeAlert, dismissAlert } = useEventBanner({ resortSlug });

// After
const { activeAlert, dismissAlert } = useAlertsQuery({ resortSlug });
```

### Migration Strategy
1. Update one component at a time
2. Test thoroughly after each change
3. Commit after each successful migration
4. Keep old hooks available for unmigrated components

## Files to Update
- `components/Hero.tsx`
- `components/ResortMapView.tsx`
- `components/SearchModal.tsx`
- `ui/layout/PageWrapper.tsx`

## Testing
- [ ] Hero dropdown populates correctly
- [ ] Map pins display and update
- [ ] Search returns results with debouncing
- [ ] Alert banner shows and dismisses
- [ ] No console errors or warnings

## Estimate
Medium (3-4 hours)
