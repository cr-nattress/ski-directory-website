# UI Module Reorganization Plan

## Executive Summary

This document outlines a plan to reorganize the `apps/v1` codebase from a flat component structure into clearly separated feature modules, improving maintainability, discoverability, and scalability.

---

## PHASE 1: Current State Analysis

### 1.1 Current Structure Overview

```
apps/v1/
├── app/                    # Next.js App Router (routing only)
│   ├── page.tsx           # Home/Dashboard
│   ├── directory/         # Resort directory
│   ├── links/             # Ski links
│   ├── social/            # Social media
│   └── [country]/[state]/[slug]/  # Resort detail
├── components/            # ALL UI components (92 files)
│   ├── discovery/         # Netflix-style themed sections
│   ├── directory/         # Directory page components
│   ├── resort-detail/     # Resort detail page (29 files!)
│   ├── ski-links/         # Links page components
│   ├── social-links/      # Social page components
│   ├── ui/                # Shared primitives (7 files)
│   ├── schema/            # SEO/structured data
│   ├── skeletons/         # Loading states
│   └── [root files]       # Layout, utilities (14 files)
├── lib/                   # Shared logic (59 files)
│   ├── api/               # Data services
│   ├── hooks/             # React hooks (16 files)
│   ├── types/             # TypeScript types
│   ├── data/              # Static data
│   ├── config/            # Configuration
│   └── [utilities]        # Various helpers
└── types/                 # Generated Supabase types
```

### 1.2 Current Domain Groupings

| Domain | Location | File Count | Notes |
|--------|----------|------------|-------|
| Dashboard/Home | `components/` root + `discovery/` | ~17 | Mixed with layout components |
| Directory | `components/directory/` | 8 | Well-organized |
| Resort Detail | `components/resort-detail/` | 29 | Largest module, well-organized |
| Links | `components/ski-links/` | 6 | Well-organized |
| Social | `components/social-links/` | 6 | Well-organized |
| Shared UI | `components/ui/` | 7 | Underutilized |
| Layout/Chrome | `components/` root | 5 | Mixed with domain components |
| Skeletons | `components/skeletons/` | 5 | Could merge with ui/ |
| Schema/SEO | `components/schema/` | 6 | Specialized, keep separate |

### 1.3 Identified Anti-Patterns

1. **Mixed Concerns in Root Components**
   - Layout components (Header, Footer, PageWrapper) mixed with domain components (Hero, ResortCard)
   - Utility components (ErrorBoundary, FeatureFlag) alongside UI components

2. **Underutilized UI Primitives**
   - Only 7 files in `ui/` when many more could be extracted
   - StatusBadge, PassBadge in `directory/` but reused elsewhere
   - ResortCard used in multiple contexts but not in `ui/`

3. **Giant Modules**
   - `resort-detail/` has 29 components - could benefit from sub-grouping
   - Some components have desktop/mobile variants that could be consolidated

4. **Inconsistent Naming**
   - Mix of `*Card`, `*Section`, `*Content`, `*View` suffixes
   - Some accordion components named differently (DiningVenuesAccordion vs SkiShopsAccordion)

5. **Hooks Not Co-located**
   - All hooks in `lib/hooks/` rather than with their modules
   - Domain-specific hooks (useResortConditions) separate from components

---

## PHASE 2: Proposed Module Structure

### 2.1 Target Architecture

```
apps/v1/
├── app/                           # Next.js routing ONLY (thin wrappers)
│   ├── layout.tsx
│   ├── page.tsx                   # → <DashboardPageView />
│   ├── directory/page.tsx         # → <DirectoryPageView />
│   ├── links/page.tsx             # → <LinksPageView />
│   ├── social/page.tsx            # → <SocialPageView />
│   ├── [country]/[state]/[slug]/
│   │   └── page.tsx               # → <ResortDetailPageView />
│   └── api/                       # Keep API routes here
│
├── modules/                       # Feature modules
│   ├── dashboard/
│   │   ├── DashboardPageView.tsx  # Main page component
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── ResortSection.tsx
│   │   │   ├── IntelligentResortSection.tsx
│   │   │   ├── ContentSection.tsx
│   │   │   ├── ResortGrid.tsx
│   │   │   ├── ResortMapView.tsx
│   │   │   ├── ResortMapViewWrapper.tsx
│   │   │   ├── ViewToggle.tsx
│   │   │   ├── SearchModal.tsx
│   │   │   ├── CategoryChips.tsx
│   │   │   ├── EventBanner.tsx
│   │   │   └── discovery/
│   │   │       ├── DiscoverySections.tsx
│   │   │       ├── ResortRow.tsx
│   │   │       └── ResortRowCard.tsx
│   │   ├── hooks/
│   │   │   ├── useThemedResorts.ts
│   │   │   ├── useRankedResorts.ts
│   │   │   ├── useInfiniteResorts.ts
│   │   │   └── useViewMode.ts
│   │   └── index.ts
│   │
│   ├── directory/
│   │   ├── DirectoryPageView.tsx
│   │   ├── components/
│   │   │   ├── DirectoryHero.tsx
│   │   │   ├── DirectoryContent.tsx
│   │   │   ├── DirectoryFilters.tsx
│   │   │   ├── DirectoryTable.tsx
│   │   │   └── DirectoryList.tsx
│   │   ├── hooks/
│   │   │   └── useDirectoryFilters.ts  # Extract from DirectoryContent
│   │   └── index.ts
│   │
│   ├── resort-detail/
│   │   ├── ResortDetailPageView.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── ResortHero.tsx
│   │   │   │   ├── ResortHeaderStats.tsx
│   │   │   │   └── MobileResortSections.tsx
│   │   │   ├── conditions/
│   │   │   │   ├── ConditionsSection.tsx
│   │   │   │   ├── LiveConditions.tsx
│   │   │   │   ├── LiftStatusList.tsx
│   │   │   │   └── WeatherForecastCard.tsx
│   │   │   ├── location/
│   │   │   │   ├── LocationCard.tsx
│   │   │   │   ├── LocationMapCard.tsx
│   │   │   │   ├── LocationMapCardWrapper.tsx
│   │   │   │   └── TrailMapCard.tsx
│   │   │   ├── media/
│   │   │   │   ├── PhotoGallery.tsx
│   │   │   │   └── WebcamGallery.tsx
│   │   │   ├── dining/
│   │   │   │   ├── DiningSection.tsx      # Unified desktop/mobile
│   │   │   │   ├── DiningVenueCard.tsx
│   │   │   │   └── DiningVenuesList.tsx
│   │   │   ├── shops/
│   │   │   │   ├── ShopsSection.tsx       # Unified desktop/mobile
│   │   │   │   ├── SkiShopCard.tsx
│   │   │   │   └── SkiShopsList.tsx
│   │   │   ├── related/
│   │   │   │   ├── RelatedResortsSection.tsx
│   │   │   │   ├── RelatedResorts.tsx
│   │   │   │   └── RelatedResortsAccordion.tsx
│   │   │   └── services/
│   │   │       ├── NearbyServicesCard.tsx
│   │   │       └── SocialMediaCard.tsx
│   │   ├── hooks/
│   │   │   ├── useResortConditions.ts
│   │   │   └── useRelatedResorts.ts
│   │   └── index.ts
│   │
│   ├── links/
│   │   ├── LinksPageView.tsx
│   │   ├── components/
│   │   │   ├── LinksHero.tsx
│   │   │   ├── LinksContent.tsx
│   │   │   ├── LinksFilters.tsx
│   │   │   ├── LinksList.tsx
│   │   │   └── LinkCard.tsx
│   │   └── index.ts
│   │
│   └── social/
│       ├── SocialPageView.tsx
│       ├── components/
│       │   ├── SocialHero.tsx
│       │   ├── SocialContent.tsx
│       │   ├── SocialFilters.tsx
│       │   ├── SocialList.tsx
│       │   └── SocialCard.tsx
│       └── index.ts
│
├── ui/                            # Design system primitives
│   ├── primitives/
│   │   ├── Button.tsx             # (future)
│   │   ├── Input.tsx              # (future)
│   │   ├── Badge.tsx              # Consolidate StatusBadge, PassBadge
│   │   ├── Card.tsx               # Base card component
│   │   ├── Skeleton.tsx
│   │   ├── Accordion.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── PageWrapper.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileBottomNav.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── index.ts
│   ├── media/
│   │   ├── ResortImage.tsx
│   │   ├── PlatformIcon.tsx
│   │   └── index.ts
│   ├── feedback/
│   │   ├── LoadingMore.tsx
│   │   ├── PullToRefreshIndicator.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   └── index.ts                   # Barrel export
│
├── shared/                        # Cross-cutting concerns
│   ├── types/                     # Move from lib/types/
│   │   ├── resort.ts
│   │   ├── map.ts
│   │   ├── ski-links.ts
│   │   ├── social-links.ts
│   │   └── index.ts
│   ├── hooks/                     # Truly shared hooks
│   │   ├── useIntersectionObserver.ts
│   │   ├── useFeatureFlag.ts
│   │   ├── usePullToRefresh.ts
│   │   └── index.ts
│   ├── utils/                     # Move from lib/utils
│   │   ├── cn.ts                  # classnames utility
│   │   ├── formatters.ts
│   │   └── index.ts
│   ├── analytics/                 # Move from lib/analytics
│   │   └── index.ts
│   ├── schema/                    # SEO components
│   │   ├── JsonLd.tsx
│   │   ├── BreadcrumbJsonLd.tsx
│   │   └── index.ts
│   └── config/                    # Move from lib/config
│       ├── feature-flags.ts
│       └── index.ts
│
├── services/                      # Data layer (rename from lib/api)
│   ├── resort-service.ts
│   ├── supabase-resort-service.ts
│   ├── supabase-resort-adapter.ts
│   ├── themed-resorts-service.ts
│   └── index.ts
│
└── lib/                           # Keep for Supabase client, etc.
    ├── supabase.ts
    └── gcs-assets.ts
```

### 2.2 Component Migration Mapping

#### Dashboard Module
| Current Path | New Path |
|--------------|----------|
| `components/Hero.tsx` | `modules/dashboard/components/Hero.tsx` |
| `components/ResortSection.tsx` | `modules/dashboard/components/ResortSection.tsx` |
| `components/IntelligentResortSection.tsx` | `modules/dashboard/components/IntelligentResortSection.tsx` |
| `components/ContentSection.tsx` | `modules/dashboard/components/ContentSection.tsx` |
| `components/ResortGrid.tsx` | `modules/dashboard/components/ResortGrid.tsx` |
| `components/ResortCard.tsx` | `modules/dashboard/components/ResortCard.tsx` |
| `components/ResortMapView.tsx` | `modules/dashboard/components/ResortMapView.tsx` |
| `components/ResortMapViewWrapper.tsx` | `modules/dashboard/components/ResortMapViewWrapper.tsx` |
| `components/ViewToggle.tsx` | `modules/dashboard/components/ViewToggle.tsx` |
| `components/SearchModal.tsx` | `modules/dashboard/components/SearchModal.tsx` |
| `components/CategoryChips.tsx` | `modules/dashboard/components/CategoryChips.tsx` |
| `components/EventBanner.tsx` | `modules/dashboard/components/EventBanner.tsx` |
| `components/discovery/*` | `modules/dashboard/components/discovery/*` |
| `lib/hooks/useThemedResorts.ts` | `modules/dashboard/hooks/useThemedResorts.ts` |
| `lib/hooks/useRankedResorts.ts` | `modules/dashboard/hooks/useRankedResorts.ts` |
| `lib/hooks/useViewMode.ts` | `modules/dashboard/hooks/useViewMode.ts` |

#### Directory Module
| Current Path | New Path |
|--------------|----------|
| `components/directory/DirectoryContent.tsx` | `modules/directory/components/DirectoryContent.tsx` |
| `components/directory/DirectoryHero.tsx` | `modules/directory/components/DirectoryHero.tsx` |
| `components/directory/DirectoryFilters.tsx` | `modules/directory/components/DirectoryFilters.tsx` |
| `components/directory/DirectoryTable.tsx` | `modules/directory/components/DirectoryTable.tsx` |
| `components/directory/DirectoryList.tsx` | `modules/directory/components/DirectoryList.tsx` |
| `components/directory/StatusBadge.tsx` | `ui/primitives/Badge.tsx` (consolidate) |
| `components/directory/PassBadge.tsx` | `ui/primitives/Badge.tsx` (consolidate) |

#### Resort Detail Module
| Current Path | New Path |
|--------------|----------|
| `components/resort-detail/ResortDetail.tsx` | `modules/resort-detail/ResortDetailPageView.tsx` |
| `components/resort-detail/ResortHero.tsx` | `modules/resort-detail/components/layout/ResortHero.tsx` |
| `components/resort-detail/ResortHeaderStats.tsx` | `modules/resort-detail/components/layout/ResortHeaderStats.tsx` |
| `components/resort-detail/MobileResortSections.tsx` | `modules/resort-detail/components/layout/MobileResortSections.tsx` |
| `components/resort-detail/ConditionsSection.tsx` | `modules/resort-detail/components/conditions/ConditionsSection.tsx` |
| `components/resort-detail/LiveConditions.tsx` | `modules/resort-detail/components/conditions/LiveConditions.tsx` |
| `components/resort-detail/LiftStatusList.tsx` | `modules/resort-detail/components/conditions/LiftStatusList.tsx` |
| `components/resort-detail/WeatherForecastCard.tsx` | `modules/resort-detail/components/conditions/WeatherForecastCard.tsx` |
| `components/resort-detail/LocationCard.tsx` | `modules/resort-detail/components/location/LocationCard.tsx` |
| `components/resort-detail/LocationMapCard.tsx` | `modules/resort-detail/components/location/LocationMapCard.tsx` |
| `components/resort-detail/TrailMapCard.tsx` | `modules/resort-detail/components/location/TrailMapCard.tsx` |
| `components/resort-detail/PhotoGallery.tsx` | `modules/resort-detail/components/media/PhotoGallery.tsx` |
| `components/resort-detail/WebcamGallery.tsx` | `modules/resort-detail/components/media/WebcamGallery.tsx` |
| `components/resort-detail/DiningVenues*.tsx` | `modules/resort-detail/components/dining/*` |
| `components/resort-detail/SkiShops*.tsx` | `modules/resort-detail/components/shops/*` |
| `components/resort-detail/RelatedResorts*.tsx` | `modules/resort-detail/components/related/*` |
| `lib/hooks/useResortConditions.ts` | `modules/resort-detail/hooks/useResortConditions.ts` |

#### Links Module
| Current Path | New Path |
|--------------|----------|
| `components/ski-links/SkiLinksHero.tsx` | `modules/links/components/LinksHero.tsx` |
| `components/ski-links/SkiLinksContent.tsx` | `modules/links/components/LinksContent.tsx` |
| `components/ski-links/SkiLinksFilters.tsx` | `modules/links/components/LinksFilters.tsx` |
| `components/ski-links/SkiLinksList.tsx` | `modules/links/components/LinksList.tsx` |
| `components/ski-links/SkiLinkCard.tsx` | `modules/links/components/LinkCard.tsx` |

#### Social Module
| Current Path | New Path |
|--------------|----------|
| `components/social-links/SocialLinksHero.tsx` | `modules/social/components/SocialHero.tsx` |
| `components/social-links/SocialLinksContent.tsx` | `modules/social/components/SocialContent.tsx` |
| `components/social-links/SocialLinksFilters.tsx` | `modules/social/components/SocialFilters.tsx` |
| `components/social-links/SocialLinksList.tsx` | `modules/social/components/SocialList.tsx` |
| `components/social-links/SocialLinkCard.tsx` | `modules/social/components/SocialCard.tsx` |

#### UI Primitives
| Current Path | New Path |
|--------------|----------|
| `components/ui/Accordion.tsx` | `ui/primitives/Accordion.tsx` |
| `components/ui/Breadcrumb.tsx` | `ui/layout/Breadcrumb.tsx` |
| `components/ui/Skeleton.tsx` | `ui/primitives/Skeleton.tsx` |
| `components/ui/HorizontalScrollChips.tsx` | `ui/primitives/HorizontalScrollChips.tsx` |
| `components/ui/PlatformIcon.tsx` | `ui/media/PlatformIcon.tsx` |
| `components/ui/PullToRefreshIndicator.tsx` | `ui/feedback/PullToRefreshIndicator.tsx` |
| `components/ui/resort-image.tsx` | `ui/media/ResortImage.tsx` |
| `components/Header.tsx` | `ui/layout/Header.tsx` |
| `components/Footer.tsx` | `ui/layout/Footer.tsx` |
| `components/PageWrapper.tsx` | `ui/layout/PageWrapper.tsx` |
| `components/MobileBottomNav.tsx` | `ui/layout/MobileBottomNav.tsx` |
| `components/LoadingMore.tsx` | `ui/feedback/LoadingMore.tsx` |
| `components/ErrorBoundary.tsx` | `ui/feedback/ErrorBoundary.tsx` |
| `components/skeletons/*` | `ui/primitives/skeletons/*` |

#### Shared
| Current Path | New Path |
|--------------|----------|
| `lib/types/*` | `shared/types/*` |
| `lib/hooks/useIntersectionObserver.ts` | `shared/hooks/useIntersectionObserver.ts` |
| `lib/hooks/useFeatureFlag.ts` | `shared/hooks/useFeatureFlag.ts` |
| `lib/hooks/usePullToRefresh.ts` | `shared/hooks/usePullToRefresh.ts` |
| `lib/utils.ts` | `shared/utils/index.ts` |
| `lib/config/*` | `shared/config/*` |
| `lib/analytics/*` | `shared/analytics/*` |
| `components/schema/*` | `shared/schema/*` |
| `components/FeatureFlag.tsx` | `shared/components/FeatureFlag.tsx` |
| `components/GoogleAnalytics.tsx` | `shared/components/GoogleAnalytics.tsx` |
| `components/WebVitals.tsx` | `shared/components/WebVitals.tsx` |

---

## PHASE 3: Step-by-Step Migration Plan

### Step 1: Setup New Directory Structure (Low Risk)

```bash
# Create module directories
mkdir -p modules/{dashboard,directory,resort-detail,links,social}/{components,hooks}
mkdir -p modules/resort-detail/components/{layout,conditions,location,media,dining,shops,related,services}
mkdir -p modules/dashboard/components/discovery

# Create UI directories
mkdir -p ui/{primitives,layout,media,feedback}

# Create shared directories
mkdir -p shared/{types,hooks,utils,analytics,schema,config,components}

# Create services directory
mkdir -p services
```

### Step 2: Add TypeScript Path Aliases

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@modules/*": ["./modules/*"],
      "@ui/*": ["./ui/*"],
      "@shared/*": ["./shared/*"],
      "@services/*": ["./services/*"]
    }
  }
}
```

### Step 3: Migrate Shared Infrastructure First (Medium Risk)

**Order of operations:**
1. `shared/types/` - Move type definitions (no component dependencies)
2. `shared/utils/` - Move utility functions
3. `shared/config/` - Move configuration
4. `ui/primitives/Skeleton.tsx` - Foundation loading component
5. `ui/primitives/Accordion.tsx` - Used by multiple modules

**For each file:**
1. Copy to new location
2. Update imports in the file
3. Create barrel export in `index.ts`
4. Update all consumers to use new path
5. Delete old file
6. Run `npm run build` to verify

### Step 4: Migrate UI Layout Components (Medium Risk)

**Files (in order):**
1. `ui/layout/Header.tsx`
2. `ui/layout/Footer.tsx`
3. `ui/layout/PageWrapper.tsx`
4. `ui/layout/MobileBottomNav.tsx`
5. `ui/layout/Breadcrumb.tsx`

**These are high-import files.** Strategy:
- Keep old files as re-exports temporarily
- Example: `components/Header.tsx` becomes:
  ```tsx
  export { Header } from '@ui/layout';
  ```
- Once all consumers updated, delete re-export files

### Step 5: Migrate Simplest Module - Links (Low Risk)

This module has the fewest dependencies and is self-contained.

**Files:**
1. Create `modules/links/LinksPageView.tsx`
2. Move `components/ski-links/*.tsx` → `modules/links/components/`
3. Rename files (remove "Ski" prefix)
4. Create `modules/links/index.ts` barrel
5. Update `app/links/page.tsx` to import from module

**Verification:**
- Build passes
- Links page renders correctly
- All filters work

### Step 6: Migrate Social Module (Low Risk)

Same pattern as Links module.

### Step 7: Migrate Directory Module (Medium Risk)

**Additional considerations:**
- Extract StatusBadge/PassBadge to `ui/primitives/Badge.tsx`
- Create unified Badge component with variants

### Step 8: Migrate Dashboard Module (High Risk)

**This is the most complex module.** Strategy:

1. Start with leaf components (no dependencies):
   - ViewToggle, CategoryChips, EventBanner

2. Move discovery components as a group

3. Move ResortCard (used in multiple places)
   - May need to stay in `ui/` or be duplicated

4. Move ResortMapView with wrapper
   - Test SSR behavior carefully

5. Move remaining components

6. Create `DashboardPageView.tsx`

7. Move associated hooks

### Step 9: Migrate Resort Detail Module (High Risk)

**This is the largest module (29 files).** Strategy:

1. Create sub-directory structure first

2. Move components by sub-group:
   - `layout/` first (ResortHero, ResortHeaderStats)
   - `conditions/` (self-contained)
   - `location/` (includes map - test SSR)
   - `media/` (PhotoGallery, WebcamGallery)
   - `dining/` (consolidate accordion variants)
   - `shops/` (consolidate accordion variants)
   - `related/`
   - `services/`

3. Move hooks

4. Create `ResortDetailPageView.tsx`

5. Update dynamic route page

### Step 10: Move Services Layer

```
lib/api/* → services/*
```

Update all imports across modules.

### Step 11: Cleanup

1. Delete empty `components/` directories
2. Remove temporary re-export files
3. Update documentation
4. Run full test suite
5. Run lighthouse audit

---

## Risk Assessment

### High-Risk Files (Most Imported)

| File | Import Count | Strategy |
|------|--------------|----------|
| `components/Header.tsx` | ~10+ | Temporary re-export |
| `components/Footer.tsx` | ~10+ | Temporary re-export |
| `components/PageWrapper.tsx` | ~10+ | Temporary re-export |
| `components/ResortCard.tsx` | ~5 | Move to dashboard, import from there |
| `lib/utils.ts` | ~50+ | Move to shared, update path alias |
| `lib/types/index.ts` | ~30+ | Move to shared, update path alias |

### Medium-Risk Files

| File | Notes |
|------|-------|
| `ResortMapView.tsx` | SSR-sensitive, test thoroughly |
| `LocationMapCard.tsx` | SSR-sensitive, test thoroughly |
| `DirectoryContent.tsx` | Complex state management |
| `ResortDetail.tsx` | Complex layout logic |

### Low-Risk Files

- All files in `ski-links/`, `social-links/`
- Schema components
- Skeleton components
- Most resort-detail sub-components

---

## Naming Conventions

### Components
- `*PageView.tsx` - Top-level page components
- `*Section.tsx` - Major page sections
- `*Card.tsx` - Card-style containers
- `*List.tsx` - List renderers
- `*Filters.tsx` - Filter controls
- `*Hero.tsx` - Hero/banner sections

### Hooks
- `use*.ts` - Standard React hook naming
- Co-located with module when domain-specific
- In `shared/hooks/` when truly cross-cutting

### Barrel Exports
Every directory should have an `index.ts`:
```tsx
// modules/links/index.ts
export { LinksPageView } from './LinksPageView';
export * from './components';
```

---

## Estimated Effort

| Phase | Effort | Risk |
|-------|--------|------|
| Step 1-2: Setup | 1 hour | Low |
| Step 3: Shared infra | 2-3 hours | Medium |
| Step 4: UI layout | 2-3 hours | Medium |
| Step 5-6: Links + Social | 2-3 hours | Low |
| Step 7: Directory | 2-3 hours | Medium |
| Step 8: Dashboard | 4-6 hours | High |
| Step 9: Resort Detail | 6-8 hours | High |
| Step 10: Services | 1-2 hours | Low |
| Step 11: Cleanup | 1-2 hours | Low |

**Total: 20-30 hours** (spread across multiple sessions)

---

## Success Criteria

1. All pages render correctly
2. `npm run build` passes with no errors
3. No circular dependencies
4. All tests pass
5. Lighthouse scores unchanged or improved
6. Clear module boundaries (no cross-module imports except through shared/)
7. Each module can be reasoned about independently

---

## Future Considerations

1. **Storybook Integration** - Each `ui/` component gets a story
2. **Module-level Testing** - Test files co-located with modules
3. **Code Splitting** - Dynamic imports at module boundaries
4. **Design Tokens** - Extract colors, spacing to `ui/tokens/`
5. **Component Documentation** - JSDoc or MDX for each component
