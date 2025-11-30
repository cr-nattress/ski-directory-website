# Epic 23: Infinite Scroll for Landing Page Resort Cards

## Overview

Implement infinite scroll functionality on the landing page to progressively load resort cards as users scroll, improving initial page load performance and providing a smooth browsing experience. The number of initially displayed resorts should be configurable.

## Problem Statement

Currently, the landing page uses `useAllResorts()` which loads **all resorts at once** (200+ resorts). This causes:
- Slow initial page load
- Large initial payload
- All DOM nodes rendered at once (performance hit)
- Poor Core Web Vitals (LCP, TTI)

## Solution

Replace bulk loading with paginated infinite scroll:
- Load configurable initial batch (e.g., 12 resorts)
- Detect when user scrolls near bottom
- Load additional batches progressively
- Maintain smooth UX with loading indicators

## Technical Analysis

### Current Architecture

```
ResortSection (CLIENT)
└── useAllResorts() hook
    └── resortService.getAllResorts()
        └── supabaseResortService.getAllResorts()
            └── Supabase query (no pagination)
```

**Problem:** Fetches all resorts in one request, renders entire grid at once.

### Target Architecture

```
ResortSection (CLIENT)
└── useInfiniteResorts() hook (NEW)
    ├── Initial: getResorts({ page: 1, pageSize: CONFIG })
    ├── On scroll: getResorts({ page: N, pageSize: CONFIG })
    └── Accumulates results across pages
```

### Existing Infrastructure (Already Built)

| Component | Status | Notes |
|-----------|--------|-------|
| `supabaseResortService.getResorts()` | Ready | Full pagination support with `page`, `pageSize` |
| `PaginatedResponse` type | Ready | Includes `hasNextPage`, `totalPages`, etc. |
| `useResorts()` hook | Ready | Supports pagination options |
| ResortCard component | Ready | No changes needed |
| Grid layout | Ready | Already responsive |

### New Components Needed

| Component | Purpose |
|-----------|---------|
| `useInfiniteResorts()` hook | Accumulate results across pages, manage loading states |
| `useIntersectionObserver()` hook | Detect when user scrolls to load trigger |
| Pagination config in `lib/config/` | Configurable page sizes |
| Loading more indicator | UI for fetching next page |

---

## Implementation Plan

### Phase 1: Configuration & Types

1. Create `lib/config/pagination.ts` with configurable defaults:
   - `INITIAL_PAGE_SIZE` (landing page first load)
   - `SUBSEQUENT_PAGE_SIZE` (each additional load)
   - `SCROLL_THRESHOLD` (pixels before bottom to trigger load)

2. Add feature flag `infiniteScroll` in `feature-flags.ts`

### Phase 2: Custom Hook Development

1. Create `useInfiniteResorts()` hook:
   - Manages accumulated resort array
   - Tracks current page, loading states
   - Exposes `loadMore()` function
   - Handles filter changes (reset to page 1)

2. Create `useIntersectionObserver()` hook:
   - Generic hook for scroll detection
   - Returns ref to attach to sentinel element
   - Calls callback when element enters viewport

### Phase 3: API Optimization

1. Optimize `getResorts()` query for fast initial load:
   - Ensure proper database indexes on sort columns
   - Select only required fields for cards (not full resort data)
   - Add caching headers for repeat visits

2. Create `getResortsForCards()` lightweight endpoint:
   - Return only fields needed for ResortCard display
   - Reduce payload size significantly

### Phase 4: UI Implementation

1. Update `ResortSection.tsx`:
   - Replace `useAllResorts()` with `useInfiniteResorts()`
   - Add sentinel element at bottom of grid
   - Show loading indicator when fetching more
   - Display "All resorts loaded" when complete

2. Add loading states:
   - Initial load: skeleton grid (existing)
   - Loading more: spinner at bottom
   - All loaded: subtle message
   - Error: retry button

3. Maintain category filter compatibility:
   - Reset pagination when category changes
   - Filter accumulated results locally OR
   - Re-fetch with filter applied server-side

### Phase 5: Performance & Polish

1. Implement `will-change` CSS hints for smooth scrolling
2. Add intersection observer threshold tuning
3. Test on slow networks (throttled dev tools)
4. Verify no duplicate resort loading (edge cases)

---

## User Stories

### Story 1: Configurable Pagination Settings
**As a** developer
**I want** pagination settings in a configuration file
**So that** I can easily adjust page sizes without code changes

**Acceptance Criteria:**
- [ ] Create `lib/config/pagination.ts` with exported constants
- [ ] `LANDING_PAGE_SIZE` (default: 12) - initial resorts shown
- [ ] `LOAD_MORE_SIZE` (default: 12) - resorts per additional load
- [ ] `SCROLL_TRIGGER_THRESHOLD` (default: 200) - pixels before bottom
- [ ] Values can be overridden via environment variables
- [ ] Add to feature-flags: `infiniteScroll: true`

**Tasks:**
- Create pagination config file
- Add environment variable support
- Add infiniteScroll feature flag
- Update documentation

---

### Story 2: Infinite Scroll Hook
**As a** developer
**I want** a reusable `useInfiniteResorts` hook
**So that** I can implement infinite scroll with proper state management

**Acceptance Criteria:**
- [ ] Hook accepts `pageSize` and optional `filters` parameters
- [ ] Returns `{ resorts, isLoading, isLoadingMore, hasMore, error, loadMore, reset }`
- [ ] `resorts` accumulates across pages (not replaces)
- [ ] `isLoading` true only on initial load
- [ ] `isLoadingMore` true when fetching subsequent pages
- [ ] `hasMore` reflects `pagination.hasNextPage`
- [ ] `loadMore()` fetches next page and appends
- [ ] `reset()` clears data and restarts from page 1
- [ ] Handles race conditions (rapid calls)
- [ ] Prevents duplicate fetches for same page

**Tasks:**
- Create `lib/hooks/useInfiniteResorts.ts`
- Implement page accumulation logic
- Add loading state management
- Add duplicate request prevention
- Add filter reset logic
- Write unit tests

---

### Story 3: Intersection Observer Hook
**As a** developer
**I want** a reusable intersection observer hook
**So that** I can detect when elements enter the viewport

**Acceptance Criteria:**
- [ ] Hook returns ref to attach to observed element
- [ ] Accepts callback function for intersection events
- [ ] Supports configurable root margin and threshold
- [ ] Cleans up observer on unmount
- [ ] Works with SSR (no-op on server)

**Tasks:**
- Create `lib/hooks/useIntersectionObserver.ts`
- Handle SSR safety
- Support configurable options
- Ensure proper cleanup

---

### Story 4: Landing Page Integration
**As a** user
**I want** resort cards to load progressively as I scroll
**So that** the initial page loads fast and I can browse smoothly

**Acceptance Criteria:**
- [ ] Initial page shows configurable number of resorts (default: 12)
- [ ] Scrolling near bottom automatically loads more resorts
- [ ] Loading indicator shown while fetching more
- [ ] "All resorts loaded" message when no more to load
- [ ] Category filter resets pagination and works correctly
- [ ] View toggle (cards/map) preserved during pagination
- [ ] No visible jank or layout shift during loading
- [ ] Page loads significantly faster than current implementation

**Tasks:**
- Update `ResortSection.tsx` to use new hooks
- Add sentinel element for scroll detection
- Implement loading more UI
- Handle category filter integration
- Add "all loaded" state UI
- Performance testing

---

### Story 5: Lightweight Card Data Endpoint
**As a** developer
**I want** an optimized endpoint for resort cards
**So that** we fetch only the data needed for display

**Acceptance Criteria:**
- [ ] New function `getResortsForCards()` in resort service
- [ ] Returns only fields used by ResortCard component:
  - `id`, `slug`, `name`, `countryCode`, `stateCode`
  - `heroImage`, `passAffiliations`
  - `rating`, `reviewCount`, `isActive`, `isLost`
  - `nearestCity`, `distanceFromMajorCity`
  - `conditions.snowfall24h`, `conditions.terrainOpen`, `conditions.status`
- [ ] Supabase query uses `.select()` with specific columns
- [ ] Response payload reduced by ~60% vs full Resort object
- [ ] Maintains pagination support

**Tasks:**
- Create `ResortCardData` type with minimal fields
- Add `getResortsForCards()` to supabase service
- Update adapter for lightweight transformation
- Update `useInfiniteResorts` to use new endpoint
- Measure payload size reduction

---

### Story 6: Error Handling & Recovery
**As a** user
**I want** clear error feedback when loading fails
**So that** I can retry or understand what went wrong

**Acceptance Criteria:**
- [ ] Network errors show user-friendly message
- [ ] "Retry" button available on error
- [ ] Partial success preserved (already loaded resorts stay visible)
- [ ] Error clears on successful retry
- [ ] Console logs detailed error for debugging

**Tasks:**
- Add error state UI to ResortSection
- Implement retry functionality
- Preserve partial data on error
- Add error logging

---

### Story 7: Performance Metrics & Validation
**As a** developer
**I want** to measure and validate performance improvements
**So that** I can confirm the optimization goals are met

**Acceptance Criteria:**
- [ ] Document before/after metrics:
  - Initial bundle size
  - Time to First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Time to Interactive (TTI)
  - Initial API response time
- [ ] Lighthouse score improvement of at least 10 points
- [ ] Initial API response < 100ms
- [ ] Each subsequent page load < 150ms

**Tasks:**
- Capture baseline metrics
- Implement changes
- Measure post-implementation metrics
- Document improvements
- Create performance test script

---

## Technical Specifications

### Configuration File Structure

```typescript
// lib/config/pagination.ts
export const paginationConfig = {
  // Landing page settings
  landing: {
    initialPageSize: parseInt(process.env.NEXT_PUBLIC_LANDING_PAGE_SIZE || '12'),
    loadMoreSize: parseInt(process.env.NEXT_PUBLIC_LOAD_MORE_SIZE || '12'),
    scrollThreshold: 200, // pixels before bottom to trigger load
  },

  // Directory page settings (future)
  directory: {
    pageSize: 24,
  },
} as const;
```

### Hook API Design

```typescript
// useInfiniteResorts hook signature
interface UseInfiniteResortsOptions {
  pageSize?: number;
  filters?: ResortFilters;
  sortBy?: ResortSortBy;
  sortOrder?: SortOrder;
}

interface UseInfiniteResortsResult {
  resorts: Resort[];
  isLoading: boolean;      // Initial load
  isLoadingMore: boolean;  // Subsequent loads
  hasMore: boolean;        // More pages available
  error: Error | null;
  totalCount: number;
  loadMore: () => Promise<void>;
  reset: () => void;
}

function useInfiniteResorts(
  options?: UseInfiniteResortsOptions
): UseInfiniteResortsResult;
```

### Intersection Observer Hook

```typescript
// useIntersectionObserver hook signature
interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  enabled?: boolean;
}

function useIntersectionObserver<T extends HTMLElement>(
  callback: (isIntersecting: boolean) => void,
  options?: UseIntersectionObserverOptions
): RefObject<T>;
```

### ResortCard Data Type (Lightweight)

```typescript
// Minimal data for card display
interface ResortCardData {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  stateCode: string;
  heroImage: string;
  passAffiliations: PassAffiliation[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isLost: boolean;
  nearestCity: string;
  distanceFromMajorCity: number;
  snowfall24h: number;
  terrainOpen: number;
  status: 'open' | 'closed' | 'opening-soon';
}
```

---

## Database Considerations

### Recommended Indexes

Ensure these indexes exist in Supabase for fast pagination:

```sql
-- For default name-sorted pagination
CREATE INDEX IF NOT EXISTS idx_resorts_name ON resorts(name);

-- For rating-sorted pagination
CREATE INDEX IF NOT EXISTS idx_resorts_rating ON resorts(rating DESC);

-- For distance-sorted pagination (requires location)
CREATE INDEX IF NOT EXISTS idx_resorts_active ON resorts(is_active);

-- Composite index for active resorts sorted by name
CREATE INDEX IF NOT EXISTS idx_resorts_active_name ON resorts(is_active, name);
```

---

## UI/UX Mockups

### Loading More State
```
[ResortCard] [ResortCard] [ResortCard] [ResortCard]
[ResortCard] [ResortCard] [ResortCard] [ResortCard]
[ResortCard] [ResortCard] [ResortCard] [ResortCard]

         [Spinner] Loading more resorts...
```

### All Loaded State
```
[ResortCard] [ResortCard] [ResortCard] [ResortCard]
[ResortCard] [ResortCard] [ResortCard] [ResortCard]
[ResortCard] [ResortCard] [ResortCard] [ResortCard]
[ResortCard] [ResortCard]

      You've viewed all 200 resorts
```

### Error State (Mid-scroll)
```
[ResortCard] [ResortCard] [ResortCard] [ResortCard]
[ResortCard] [ResortCard] [ResortCard] [ResortCard]

   Failed to load more resorts. [Retry Button]
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `lib/config/pagination.ts` | Create | Pagination configuration |
| `lib/config/feature-flags.ts` | Modify | Add `infiniteScroll` flag |
| `lib/hooks/useInfiniteResorts.ts` | Create | Infinite scroll hook |
| `lib/hooks/useIntersectionObserver.ts` | Create | Scroll detection hook |
| `lib/api/types.ts` | Modify | Add `ResortCardData` type |
| `lib/api/supabase-resort-service.ts` | Modify | Add `getResortsForCards()` |
| `components/ResortSection.tsx` | Modify | Integrate infinite scroll |
| `components/LoadingMore.tsx` | Create | Loading indicator component |

---

## Rollback Plan

If issues arise:
1. Feature flag `infiniteScroll: false` reverts to `useAllResorts()` behavior
2. No database schema changes required
3. All new code is additive (no destructive changes)

---

## Success Metrics

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| Initial Load Time | ~800ms | <200ms | Lighthouse |
| Initial Payload | ~150KB | <30KB | Network tab |
| LCP | ~2.5s | <1.5s | Lighthouse |
| Resorts Initially Shown | All (200+) | 12 | Configurable |

---

## Dependencies

- No external library dependencies
- Uses native IntersectionObserver API
- Leverages existing Supabase pagination

---

## Related Epics

- Epic 22: Feature Flags (provides toggle mechanism)
- Epic 20: Remove Mock Data (ensures real data flow)

---

## Estimated Effort

| Story | Complexity | Estimate |
|-------|------------|----------|
| Story 1: Configuration | Low | Small |
| Story 2: Infinite Scroll Hook | Medium | Medium |
| Story 3: Intersection Observer | Low | Small |
| Story 4: Landing Page Integration | Medium | Medium |
| Story 5: Lightweight Endpoint | Medium | Medium |
| Story 6: Error Handling | Low | Small |
| Story 7: Performance Validation | Low | Small |

**Total: 7 stories**
