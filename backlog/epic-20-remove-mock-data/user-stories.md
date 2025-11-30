# Epic 20: Remove Mock Data and Mock Classes

## Overview

Remove all mock data files, mock resort arrays, and related utility functions from the codebase. Replace with Supabase data sources and clean type exports. This epic ensures the application fully relies on the Supabase database while maintaining all existing functionality.

## Problem Statement

The application currently maintains two parallel data layers:
1. **Mock Data Layer** (`lib/mock-data/`) - Hardcoded resort arrays, articles, categories, ski-links, and social-links
2. **Supabase Data Layer** (`lib/api/`) - Real database with adapters

This dual architecture causes:
- Confusion about which data source is being used
- Duplicated type definitions
- Maintenance burden when updating data models
- Risk of mock data overriding real data
- ~11 files and ~45+ imports that need to be cleaned up

## Solution

1. Move reusable types from `mock-data/types.ts` to `lib/types/`
2. Create Supabase tables for ski-links, social-links, articles, and categories (or remove if unused)
3. Update all component imports to use new type locations
4. Remove all mock data files
5. Update helper functions to use Supabase data
6. Verify all features work with Supabase-only data

---

## Current Mock Data Files

| File | Purpose | Action |
|------|---------|--------|
| `types.ts` | Resort, Category, Article, ResortMapPin types | Move to `lib/types/` |
| `index.ts` | Exports + utility functions (filter, sort, getCardImage) | Move utilities to `lib/api/` |
| `resorts.ts` | Hardcoded Colorado resorts (~30 entries) | Delete |
| `resorts-from-json.ts` | JSON-imported resorts (alternate source) | Delete |
| `resorts_rows.json` | Raw JSON export | Delete |
| `categories.ts` | Filter categories (Epic Pass, Beginner Friendly, etc.) | Migrate to Supabase or keep as static config |
| `articles.ts` | Mock articles array | Delete (feature not used) or migrate |
| `ski-links.ts` | Ski links data + utilities | Migrate to Supabase |
| `ski-links-types.ts` | SkiLink types | Move to `lib/types/` |
| `social-links.ts` | Social links data + utilities | Migrate to Supabase |
| `social-links-types.ts` | SocialLink types | Move to `lib/types/` |

---

## Files Importing from Mock Data

### Type-Only Imports (41 files)
These files import types like `Resort`, `ResortMapPin`, etc. and need import path updates:

**Components (23 files):**
- `components/ResortCard.tsx` - Resort, getCardImage
- `components/ResortGrid.tsx` - mockCategories
- `components/ResortSection.tsx` - mockCategories
- `components/CategoryChips.tsx` - mockCategories
- `components/ContentSection.tsx` - mockArticles
- `components/directory/DirectoryTable.tsx` - Resort
- `components/directory/DirectoryList.tsx` - Resort
- `components/directory/DirectoryContent.tsx` - Resort
- `components/resort-detail/ResortDetail.tsx` - Resort
- `components/resort-detail/ResortHero.tsx` - Resort
- `components/resort-detail/LocationCard.tsx` - Resort
- `components/resort-detail/LocationMapCard.tsx` - Resort
- `components/resort-detail/LocationMapCardWrapper.tsx` - Resort
- `components/resort-detail/TrailMapCard.tsx` - Resort
- `components/resort-detail/WeatherForecastCard.tsx` - Resort
- `components/resort-detail/SocialMediaCard.tsx` - Resort
- `components/resort-detail/PhotoGallery.tsx` - Resort, getSortedImages, ResortImage
- `components/resort-detail/ResortStructuredData.tsx` - Resort
- `components/ski-links/SkiLinksContent.tsx` - SkiLink types + utilities
- `components/ski-links/SkiLinksList.tsx` - SkiLink types
- `components/ski-links/SkiLinkCard.tsx` - SkiLink types
- `components/ski-links/SkiLinksFilters.tsx` - SkiLink types
- `components/social-links/SocialLinksContent.tsx` - SocialLink types + utilities
- `components/social-links/SocialLinksList.tsx` - SocialLink types
- `components/social-links/SocialLinkCard.tsx` - SocialLink types
- `components/social-links/SocialLinksFilters.tsx` - SocialLink types

**Pages (4 files):**
- `app/directory/page.tsx` - mockResorts
- `app/sitemap.ts` - mockResorts, getSkiLinks, getSocialLinks
- `app/ski-links/page.tsx` - getSkiLinks, getSkiLinkStats
- `app/social-links/page.tsx` - getSocialLinks, getUniquePlatformCount

**Hooks (1 file):**
- `lib/hooks/useMapPins.ts` - ResortMapPin

**Services (1 file):**
- `lib/api/supabase-resort-adapter.ts` - Resort, ResortImage, PassAffiliation

---

## User Stories

### Phase 1: Type Relocation

#### Story 20.1: Create Centralized Types Directory
**Priority:** High | **Effort:** Small

**As a** developer
**I want** all shared types in a central `lib/types/` directory
**So that** types are not coupled to mock data implementations

**Acceptance Criteria:**
- [ ] Create `apps/v1/lib/types/` directory
- [ ] Create `apps/v1/lib/types/resort.ts` with Resort, ResortImage, PassAffiliation types
- [ ] Create `apps/v1/lib/types/category.ts` with Category type
- [ ] Create `apps/v1/lib/types/article.ts` with Article type
- [ ] Create `apps/v1/lib/types/map.ts` with ResortMapPin type
- [ ] Create `apps/v1/lib/types/index.ts` to re-export all types
- [ ] Ensure types match current definitions exactly

**Files to Create:**
- `apps/v1/lib/types/index.ts`
- `apps/v1/lib/types/resort.ts`
- `apps/v1/lib/types/category.ts`
- `apps/v1/lib/types/article.ts`
- `apps/v1/lib/types/map.ts`

---

#### Story 20.2: Create Ski Links Types File
**Priority:** High | **Effort:** Small

**As a** developer
**I want** ski-links types in the centralized types directory
**So that** they can be used without mock data dependencies

**Acceptance Criteria:**
- [ ] Create `apps/v1/lib/types/ski-links.ts`
- [ ] Move all types from `mock-data/ski-links-types.ts`:
  - `SkiLinkType` enum/union
  - `SkiLink` interface
  - `SKI_LINK_TYPE_LABELS` constant
- [ ] Export from `lib/types/index.ts`

---

#### Story 20.3: Create Social Links Types File
**Priority:** High | **Effort:** Small

**As a** developer
**I want** social-links types in the centralized types directory
**So that** they can be used without mock data dependencies

**Acceptance Criteria:**
- [ ] Create `apps/v1/lib/types/social-links.ts`
- [ ] Move all types from `mock-data/social-links-types.ts`:
  - `SocialPlatform` enum/union
  - `SocialTopic` enum/union
  - `SocialLink` interface
  - `SOCIAL_TOPIC_LABELS` constant
  - `SOCIAL_PLATFORM_LABELS` constant
- [ ] Export from `lib/types/index.ts`

---

### Phase 2: Update Imports (Components)

#### Story 20.4: Update Resort Detail Components
**Priority:** High | **Effort:** Medium

**As a** developer
**I want** resort detail components to import types from `lib/types`
**So that** they don't depend on mock data

**Acceptance Criteria:**
- [ ] Update `ResortDetail.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `ResortHero.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `LocationCard.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `LocationMapCard.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `LocationMapCardWrapper.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `TrailMapCard.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `WeatherForecastCard.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `SocialMediaCard.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `PhotoGallery.tsx`: imports for Resort, ResortImage, getSortedImages
- [ ] Update `ResortStructuredData.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Run build to verify no import errors

**Files:** `apps/v1/components/resort-detail/*.tsx` (10 files)

---

#### Story 20.5: Update Directory Components
**Priority:** High | **Effort:** Small

**As a** developer
**I want** directory components to import types from `lib/types`
**So that** they don't depend on mock data

**Acceptance Criteria:**
- [ ] Update `DirectoryTable.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `DirectoryList.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Update `DirectoryContent.tsx`: `import { Resort } from '@/lib/types'`
- [ ] Run build to verify no import errors

**Files:** `apps/v1/components/directory/*.tsx` (3 files)

---

#### Story 20.6: Update Ski Links Components
**Priority:** High | **Effort:** Small

**As a** developer
**I want** ski-links components to import types from `lib/types`
**So that** types are decoupled from data

**Acceptance Criteria:**
- [ ] Update `SkiLinksContent.tsx`: import types from `@/lib/types/ski-links`
- [ ] Update `SkiLinksList.tsx`: import types from `@/lib/types/ski-links`
- [ ] Update `SkiLinkCard.tsx`: import types from `@/lib/types/ski-links`
- [ ] Update `SkiLinksFilters.tsx`: import types from `@/lib/types/ski-links`
- [ ] Run build to verify no import errors

**Files:** `apps/v1/components/ski-links/*.tsx` (4 files)

---

#### Story 20.7: Update Social Links Components
**Priority:** High | **Effort:** Small

**As a** developer
**I want** social-links components to import types from `lib/types`
**So that** types are decoupled from data

**Acceptance Criteria:**
- [ ] Update `SocialLinksContent.tsx`: import types from `@/lib/types/social-links`
- [ ] Update `SocialLinksList.tsx`: import types from `@/lib/types/social-links`
- [ ] Update `SocialLinkCard.tsx`: import types from `@/lib/types/social-links`
- [ ] Update `SocialLinksFilters.tsx`: import types from `@/lib/types/social-links`
- [ ] Run build to verify no import errors

**Files:** `apps/v1/components/social-links/*.tsx` (4 files)

---

#### Story 20.8: Update Core Components
**Priority:** High | **Effort:** Small

**As a** developer
**I want** core components to import types from `lib/types`
**So that** they don't depend on mock data

**Acceptance Criteria:**
- [ ] Update `ResortCard.tsx`: import Resort from `@/lib/types`, move getCardImage to utility
- [ ] Update `ResortGrid.tsx`: remove mockCategories, use Supabase or static config
- [ ] Update `ResortSection.tsx`: remove mockCategories dependency
- [ ] Update `CategoryChips.tsx`: remove mockCategories dependency
- [ ] Update `ContentSection.tsx`: remove mockArticles (or delete if unused)
- [ ] Run build to verify no import errors

**Files:** 5 core components

---

### Phase 3: Move Utility Functions

#### Story 20.9: Move Image Helper Functions
**Priority:** High | **Effort:** Small

**As a** developer
**I want** image helper functions moved to `lib/api/` or `lib/utils/`
**So that** they don't depend on mock data module

**Acceptance Criteria:**
- [ ] Create `apps/v1/lib/utils/resort-images.ts`
- [ ] Move functions from `mock-data/index.ts`:
  - `getCardImage(resort: Resort): ResortImage | undefined`
  - `getHeroImage(resort: Resort): ResortImage | undefined`
  - `getSortedImages(resort: Resort): ResortImage[]`
- [ ] Update all imports to use new location
- [ ] Verify PhotoGallery and ResortCard still work

**Files to Create:**
- `apps/v1/lib/utils/resort-images.ts`

**Files to Update:**
- `apps/v1/components/ResortCard.tsx`
- `apps/v1/components/resort-detail/PhotoGallery.tsx`

---

#### Story 20.10: Move Ski Links Utility Functions
**Priority:** Medium | **Effort:** Small

**As a** developer
**I want** ski-links utility functions moved to a service file
**So that** they work with Supabase data

**Acceptance Criteria:**
- [ ] Create `apps/v1/lib/api/ski-links-service.ts`
- [ ] Move functions from `mock-data/ski-links.ts`:
  - `getSkiLinks()` - update to fetch from Supabase
  - `getSkiLinkStats()` - update to use Supabase
  - `filterSkiLinks()`
  - `sortSkiLinks()`
  - `groupSkiLinksByType()`
  - `getDisplayDomain()`
- [ ] Update all imports to use new location

**Note:** This may require creating a `ski_links` table in Supabase (see Story 20.16)

---

#### Story 20.11: Move Social Links Utility Functions
**Priority:** Medium | **Effort:** Small

**As a** developer
**I want** social-links utility functions moved to a service file
**So that** they work with Supabase data

**Acceptance Criteria:**
- [ ] Create `apps/v1/lib/api/social-links-service.ts`
- [ ] Move functions from `mock-data/social-links.ts`:
  - `getSocialLinks()` - update to fetch from Supabase
  - `getUniquePlatformCount()` - update to use Supabase
  - `filterSocialLinks()`
  - `sortSocialLinks()`
  - `groupSocialLinksByTopic()`
- [ ] Update all imports to use new location

**Note:** This may require creating a `social_links` table in Supabase (see Story 20.17)

---

### Phase 4: Update Pages and Services

#### Story 20.12: Update Directory Page
**Priority:** High | **Effort:** Small

**As a** developer
**I want** the directory page to use Supabase data exclusively
**So that** it doesn't import mock resorts

**Acceptance Criteria:**
- [ ] Update `app/directory/page.tsx`
- [ ] Remove `import { mockResorts } from '@/lib/mock-data'`
- [ ] Use `supabaseResortService.getAllResorts()` instead
- [ ] Verify filtering and sorting still work
- [ ] Test with Supabase enabled

**File:** `apps/v1/app/directory/page.tsx`

---

#### Story 20.13: Update Sitemap Generation
**Priority:** Medium | **Effort:** Small

**As a** developer
**I want** sitemap generation to use Supabase data
**So that** it reflects real database content

**Acceptance Criteria:**
- [ ] Update `app/sitemap.ts`
- [ ] Remove `import { mockResorts } from '@/lib/mock-data'`
- [ ] Use Supabase query for resort URLs
- [ ] Update ski-links and social-links URL generation
- [ ] Verify sitemap generates correctly

**File:** `apps/v1/app/sitemap.ts`

---

#### Story 20.14: Update Ski Links Page
**Priority:** Medium | **Effort:** Small

**As a** developer
**I want** the ski-links page to use Supabase data
**So that** it doesn't depend on mock data

**Acceptance Criteria:**
- [ ] Update `app/ski-links/page.tsx`
- [ ] Import from new service location
- [ ] Verify page renders correctly

**File:** `apps/v1/app/ski-links/page.tsx`

---

#### Story 20.15: Update Social Links Page
**Priority:** Medium | **Effort:** Small

**As a** developer
**I want** the social-links page to use Supabase data
**So that** it doesn't depend on mock data

**Acceptance Criteria:**
- [ ] Update `app/social-links/page.tsx`
- [ ] Import from new service location
- [ ] Verify page renders correctly

**File:** `apps/v1/app/social-links/page.tsx`

---

### Phase 5: Database Migrations (Optional)

#### Story 20.16: Create Ski Links Supabase Table
**Priority:** Medium | **Effort:** Medium

**As a** developer
**I want** ski links stored in Supabase
**So that** the data is centralized and manageable

**Acceptance Criteria:**
- [ ] Create migration `20251130_005_ski_links_table.sql`
- [ ] Create `ski_links` table with columns:
  - `id` (UUID, primary key)
  - `name` (TEXT)
  - `url` (TEXT)
  - `description` (TEXT)
  - `type` (TEXT) - matches SkiLinkType
  - `is_official` (BOOLEAN)
  - `created_at`, `updated_at`
- [ ] Migrate existing ski-links data
- [ ] Update service to fetch from Supabase

**Decision Point:** May decide to keep ski-links as static data if it rarely changes

---

#### Story 20.17: Create Social Links Supabase Table
**Priority:** Medium | **Effort:** Medium

**As a** developer
**I want** social links stored in Supabase
**So that** the data is centralized and manageable

**Acceptance Criteria:**
- [ ] Create migration `20251130_006_social_links_table.sql`
- [ ] Create `social_links` table with columns:
  - `id` (UUID, primary key)
  - `name` (TEXT)
  - `platform` (TEXT) - matches SocialPlatform
  - `handle` (TEXT)
  - `url` (TEXT)
  - `topic` (TEXT) - matches SocialTopic
  - `description` (TEXT)
  - `followers_count` (INTEGER)
  - `is_verified` (BOOLEAN)
  - `created_at`, `updated_at`
- [ ] Migrate existing social-links data
- [ ] Update service to fetch from Supabase

**Decision Point:** May decide to keep social-links as static data if it rarely changes

---

### Phase 6: Cleanup

#### Story 20.18: Update Supabase Adapter Imports
**Priority:** High | **Effort:** Small

**As a** developer
**I want** the Supabase adapter to import types from `lib/types`
**So that** it doesn't depend on mock data

**Acceptance Criteria:**
- [ ] Update `lib/api/supabase-resort-adapter.ts`
- [ ] Change `import type { Resort, ResortImage, PassAffiliation } from "../mock-data/types"`
- [ ] To `import type { Resort, ResortImage, PassAffiliation } from "@/lib/types"`
- [ ] Verify adapter still works correctly

**File:** `apps/v1/lib/api/supabase-resort-adapter.ts`

---

#### Story 20.19: Update Hooks Imports
**Priority:** High | **Effort:** Small

**As a** developer
**I want** hooks to import types from `lib/types`
**So that** they don't depend on mock data

**Acceptance Criteria:**
- [ ] Update `lib/hooks/useMapPins.ts`
- [ ] Change `import { ResortMapPin } from '@/lib/mock-data/types'`
- [ ] To `import { ResortMapPin } from '@/lib/types'`
- [ ] Verify hook still works correctly

**File:** `apps/v1/lib/hooks/useMapPins.ts`

---

#### Story 20.20: Delete Mock Data Files
**Priority:** High | **Effort:** Small

**As a** developer
**I want** all mock data files removed
**So that** the codebase is clean and there's only one data source

**Acceptance Criteria:**
- [ ] Delete `apps/v1/lib/mock-data/resorts.ts`
- [ ] Delete `apps/v1/lib/mock-data/resorts-from-json.ts`
- [ ] Delete `apps/v1/lib/mock-data/resorts_rows.json`
- [ ] Delete `apps/v1/lib/mock-data/index.ts`
- [ ] Delete `apps/v1/lib/mock-data/types.ts`
- [ ] Delete `apps/v1/lib/mock-data/categories.ts` (if migrated)
- [ ] Delete `apps/v1/lib/mock-data/articles.ts` (if unused)
- [ ] Delete `apps/v1/lib/mock-data/ski-links.ts`
- [ ] Delete `apps/v1/lib/mock-data/ski-links-types.ts`
- [ ] Delete `apps/v1/lib/mock-data/social-links.ts`
- [ ] Delete `apps/v1/lib/mock-data/social-links-types.ts`
- [ ] Delete `apps/v1/lib/mock-data/` directory
- [ ] Run `npm run build` to ensure no broken imports

**Prerequisites:** All other stories completed

---

### Phase 7: Verification

#### Story 20.21: Full Application Verification
**Priority:** Critical | **Effort:** Medium

**As a** developer
**I want** to verify all features work after mock data removal
**So that** the application is production-ready

**Acceptance Criteria:**
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - no errors
- [ ] Test landing page with interactive map
- [ ] Test directory page with filtering and sorting
- [ ] Test resort detail pages (navigate from map and directory)
- [ ] Test ski-links page
- [ ] Test social-links page
- [ ] Test sitemap generation
- [ ] Verify all images load from GCS
- [ ] Test with NEXT_PUBLIC_USE_SUPABASE=true
- [ ] Document any issues found

**Checklist:**
- [ ] Map pins load from Supabase
- [ ] Resort cards display correct data
- [ ] Resort detail pages show all information
- [ ] Filtering by pass type works
- [ ] Sorting by distance/rating/name works
- [ ] Search functionality works
- [ ] Ski links display and filter correctly
- [ ] Social links display and filter correctly

---

#### Story 20.22: Update CLAUDE.md Documentation
**Priority:** Low | **Effort:** Small

**As a** developer
**I want** CLAUDE.md updated to remove mock data references
**So that** documentation is accurate

**Acceptance Criteria:**
- [ ] Remove "Data Layer Architecture" section about mock data
- [ ] Update "Resort Data Model" to reference `lib/types/`
- [ ] Remove "Common Gotchas" item about mock data imports
- [ ] Update "Adding New Resort Features" section
- [ ] Document new `lib/types/` structure

**File:** `CLAUDE.md`

---

## Summary

| Phase | Stories | Effort |
|-------|---------|--------|
| Phase 1: Type Relocation | 20.1-20.3 | Small |
| Phase 2: Update Imports | 20.4-20.8 | Medium |
| Phase 3: Move Utilities | 20.9-20.11 | Small |
| Phase 4: Update Pages | 20.12-20.15 | Small |
| Phase 5: Database (Optional) | 20.16-20.17 | Medium |
| Phase 6: Cleanup | 20.18-20.20 | Small |
| Phase 7: Verification | 20.21-20.22 | Medium |

**Total Stories:** 22
**Estimated Total Effort:** Medium-Large

## Dependencies

- Epic 17: Supabase Migration (completed)
- Epic 18: Interactive Map (completed)
- All resort data must be in Supabase before starting

## Decision Points

1. **Ski Links Storage:** Keep as static TypeScript file or migrate to Supabase?
2. **Social Links Storage:** Keep as static TypeScript file or migrate to Supabase?
3. **Categories:** Keep as static config or create database table?
4. **Articles:** Delete entirely (feature unused) or migrate to Supabase?

## Files to Delete

```
apps/v1/lib/mock-data/
├── resorts.ts           # Delete
├── resorts-from-json.ts # Delete
├── resorts_rows.json    # Delete
├── index.ts             # Delete
├── types.ts             # Delete (after moving types)
├── categories.ts        # Delete or keep as static config
├── articles.ts          # Delete (unused feature)
├── ski-links.ts         # Delete (after moving utilities)
├── ski-links-types.ts   # Delete (after moving types)
├── social-links.ts      # Delete (after moving utilities)
└── social-links-types.ts # Delete (after moving types)
```

## Files to Create

```
apps/v1/lib/types/
├── index.ts             # Re-export all types
├── resort.ts            # Resort, ResortImage, PassAffiliation
├── category.ts          # Category
├── article.ts           # Article
├── map.ts               # ResortMapPin
├── ski-links.ts         # SkiLink types
└── social-links.ts      # SocialLink types

apps/v1/lib/utils/
└── resort-images.ts     # getCardImage, getHeroImage, getSortedImages

apps/v1/lib/api/
├── ski-links-service.ts # Ski links data + utilities
└── social-links-service.ts # Social links data + utilities
```

## Risk Mitigation

1. **Incremental Migration:** Complete one phase at a time, verify builds pass
2. **Feature Flag:** Keep `NEXT_PUBLIC_USE_SUPABASE` flag during migration
3. **Type Safety:** TypeScript will catch most import errors at build time
4. **Testing:** Manual testing of all pages after each phase
