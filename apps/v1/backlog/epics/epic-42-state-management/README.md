# Epic 42: State Management Modernization

## Overview

Introduce a modern, lightweight state management architecture using TanStack Query for server data and Zustand for client state, replacing ad-hoc useState/useEffect patterns with a more scalable, cacheable approach.

## Current State Analysis

### State Hotspots Identified

| File | State Type | Description |
|------|------------|-------------|
| `lib/hooks/useResorts.ts` | Server | Resort list fetching with manual caching |
| `lib/hooks/useResort.ts` | Server | Single resort fetching |
| `lib/hooks/useMapPins.ts` | Server | Map pins with localStorage cache (5min TTL) |
| `lib/hooks/useViewMode.ts` | Client | View toggle with localStorage persistence |
| `lib/hooks/useEventBanner.ts` | Server | Alert polling with interval |
| `lib/hooks/useResortSearch.ts` | Server | Search with debounce |
| `lib/hooks/useThemedResorts.ts` | Server | Themed sections fetching |
| `lib/hooks/useRankedResorts.ts` | Server | Ranked resorts fetching |
| `lib/hooks/useInfiniteResorts.ts` | Server | Infinite scroll pagination |
| `components/directory/DirectoryContent.tsx` | Local + URL | Filter state synced with URL params |
| `modules/links/components/LinksContent.tsx` | Local + URL | Filter state synced with URL params |
| `components/social-links/SocialLinksContent.tsx` | Local + URL | Filter state synced with URL params |
| `components/Hero.tsx` | Local | Search form state |

### State Categories

| Category | Current Pattern | Target Pattern |
|----------|-----------------|----------------|
| **Server Data** | Custom hooks with useState/useEffect, manual refetch | TanStack Query with automatic caching |
| **UI Prefs** | localStorage in individual hooks | Zustand store with persistence |
| **Filters (URL)** | URL params + useState per page | Keep URL-based (good for SEO/sharing) |
| **Local UI** | useState in components | Keep as-is (appropriate for local state) |

### Current Issues

1. **No shared cache** - Same data fetched multiple times across components
2. **Manual refetch logic** - Each hook implements its own refetch pattern
3. **No stale-while-revalidate** - Users see loading states on every navigation
4. **Duplicated patterns** - Every server hook has nearly identical boilerplate
5. **No global error/loading boundaries** - Error handling scattered

## Target Architecture

### Folder Structure

```
shared/
├── api/
│   ├── queryClient.ts          # TanStack Query client config
│   ├── queryKeys.ts            # Centralized query key factory
│   ├── queries/
│   │   ├── useResortsQuery.ts
│   │   ├── useResortQuery.ts
│   │   ├── useMapPinsQuery.ts
│   │   ├── useSearchQuery.ts
│   │   └── useAlertsQuery.ts
│   └── mutations/              # Future: for user actions
└── state/
    ├── uiStore.ts              # View mode, theme, sidebar
    └── filtersStore.ts         # Optional: cross-page filter sync
```

### Technology Choices

- **TanStack Query v5** - Server state, caching, background refetch
- **Zustand** - Lightweight client state (3kb), simple API, persistence middleware

## Migration Strategy

### Phase 1: Infrastructure (Stories 1.1-1.3)
Set up TanStack Query provider and Zustand stores without changing existing code.

### Phase 2: Server Data Migration (Stories 2.1-2.6)
Replace existing hooks one-by-one with Query-based equivalents, maintaining backwards compatibility.

### Phase 3: Client State Consolidation (Stories 3.1-3.2)
Migrate localStorage-persisted state to Zustand store.

### Phase 4: Cleanup (Stories 4.1-4.2)
Remove deprecated hooks and update imports.

## Stories

### Phase 1: Infrastructure
- [Story 1.1: Install dependencies and configure QueryClient](stories/story-1.1-query-client-setup.md)
- [Story 1.2: Create query key factory](stories/story-1.2-query-keys.md)
- [Story 1.3: Create Zustand UI store](stories/story-1.3-zustand-ui-store.md)

### Phase 2: Server Data Migration
- [Story 2.1: Create useResortsQuery hook](stories/story-2.1-resorts-query.md)
- [Story 2.2: Create useResortQuery hook](stories/story-2.2-resort-query.md)
- [Story 2.3: Create useMapPinsQuery hook](stories/story-2.3-map-pins-query.md)
- [Story 2.4: Create useSearchQuery hook](stories/story-2.4-search-query.md)
- [Story 2.5: Create useAlertsQuery hook](stories/story-2.5-alerts-query.md)
- [Story 2.6: Create useThemedResortsQuery hook](stories/story-2.6-themed-resorts-query.md)

### Phase 3: Client State Consolidation
- [Story 3.1: Migrate view mode to Zustand](stories/story-3.1-view-mode-zustand.md)
- [Story 3.2: Add devtools and persistence middleware](stories/story-3.2-zustand-middleware.md)

### Phase 4: Cleanup
- [Story 4.1: Update consumers to use new hooks](stories/story-4.1-update-consumers.md)
- [Story 4.2: Remove deprecated hooks](stories/story-4.2-remove-deprecated.md)

## Success Metrics

- [ ] Zero regression in existing functionality
- [ ] Build passes with no TypeScript errors
- [ ] Lighthouse performance score maintained or improved
- [ ] Reduced network requests through caching
- [ ] Simplified hook implementations (less boilerplate)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| SSR hydration issues | Use `staleTime: Infinity` for SSR data, handle `isPending` vs `isFetching` |
| Breaking existing consumers | Create new hooks alongside old, deprecate gradually |
| Bundle size increase | TanStack Query ~13kb, Zustand ~3kb - acceptable tradeoff |
| Learning curve | Document patterns, create examples in stories |

## Dependencies

- Epic 41 (Module Reorganization) - Should be completed first for clean imports
