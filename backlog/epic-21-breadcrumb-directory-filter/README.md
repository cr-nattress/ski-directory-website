# Epic 21: Breadcrumb Navigation to Filtered Directory

## Overview

When viewing a resort detail page, the breadcrumb shows: `Country > State > Resort Name`. Currently, clicking on the state or country in the breadcrumb leads to broken/non-existent routes (e.g., `/us/colorado`). This epic fixes these links to navigate to the A-Z Resort Directory with the appropriate state or country filter applied.

## Problem Statement

**Current Behavior:**
- Resort detail breadcrumb: `United States > Colorado > Vail`
- Clicking "Colorado" navigates to `/us/colorado` → 404 error
- Clicking "United States" navigates to `/` → Home page (not broken, but inconsistent)

**Desired Behavior:**
- Clicking "Colorado" navigates to `/directory?state=colorado` → Directory filtered to Colorado resorts
- Clicking "United States" navigates to `/directory?country=us` → Directory filtered to US resorts
- The directory header/description updates to reflect the filter (e.g., "Colorado Ski Resorts" instead of "A-Z Resort Directory")

## User Stories

### Story 21.1: Add State/Country URL Parameters to Directory
**As a** user viewing the resort directory
**I want** to filter resorts by state or country via URL parameters
**So that** I can share filtered views and navigate from breadcrumbs

**Acceptance Criteria:**
- `/directory?state=colorado` shows only Colorado resorts
- `/directory?country=us` shows only US resorts
- `/directory?country=ca` shows only Canadian resorts
- Filters can be combined: `/directory?country=us&state=utah`
- State filter takes precedence if both state and country imply different results

### Story 21.2: Update Directory Header for Filtered Views
**As a** user viewing a filtered directory
**I want** the page header to reflect what I'm viewing
**So that** I understand the context of the results

**Acceptance Criteria:**
- Default: "A-Z Resort Directory" with description mentioning total count
- State filter: "[State Name] Ski Resorts" (e.g., "Colorado Ski Resorts")
- Country filter: "[Country Name] Ski Resorts" (e.g., "United States Ski Resorts")
- Description updates to reflect filtered count
- Breadcrumb in DirectoryHero updates: `Home / Directory / Colorado` (when filtered)

### Story 21.3: Fix Breadcrumb Links in Resort Detail
**As a** user on a resort detail page
**I want** to click the state/country breadcrumb to see other resorts in that region
**So that** I can easily browse related resorts

**Acceptance Criteria:**
- State breadcrumb links to `/directory?state={stateCode}`
- Country breadcrumb links to `/directory?country={countryCode}`
- Links work for all states and countries in the database

### Story 21.4: Update Directory Filters Component
**As a** user
**I want** to see and modify the state/country filter from the directory page
**So that** I can easily change or clear the geographic filter

**Acceptance Criteria:**
- Add state dropdown filter to DirectoryFilters
- Add country dropdown filter to DirectoryFilters (if multiple countries exist)
- Dropdowns populate from available resorts (no empty options)
- Clearing filter returns to full directory
- URL updates when filter changes

## Technical Implementation

### Files to Modify

1. **`components/resort-detail/ResortDetail.tsx`**
   - Update breadcrumb hrefs to use `/directory?state=` and `/directory?country=`

2. **`components/directory/DirectoryContent.tsx`**
   - Add `state` and `country` URL parameter parsing
   - Filter resorts based on state/country params
   - Pass filter info to DirectoryHero

3. **`components/directory/DirectoryHero.tsx`**
   - Accept optional `stateName`, `countryName` props
   - Update title and description based on filter
   - Update breadcrumb to show filter context

4. **`components/directory/DirectoryFilters.tsx`**
   - Add state dropdown
   - Add country dropdown (optional, based on data)
   - Wire up to URL params

5. **`lib/data/states.ts`** (new file)
   - State code to name mapping
   - Country code to name mapping

### URL Parameter Schema

```
/directory
/directory?state=colorado
/directory?country=us
/directory?state=utah&pass=epic&sort=snow
```

### State/Country Mappings

```typescript
// lib/data/geo-mappings.ts
export const STATE_NAMES: Record<string, string> = {
  colorado: 'Colorado',
  utah: 'Utah',
  california: 'California',
  // ... all US states with resorts
  'british-columbia': 'British Columbia',
  alberta: 'Alberta',
  // ... Canadian provinces
};

export const COUNTRY_NAMES: Record<string, string> = {
  us: 'United States',
  ca: 'Canada',
};
```

## Definition of Done

- [ ] Breadcrumb state/country links navigate to filtered directory
- [ ] Directory page accepts `state` and `country` URL parameters
- [ ] Directory header updates based on active filter
- [ ] Directory filters include state/country dropdowns
- [ ] URL is shareable and bookmarkable
- [ ] TypeScript builds without errors
- [ ] No console errors in browser
- [ ] Works on mobile and desktop

## Dependencies

- Epic 20 (Remove Mock Data) - Completed
- Supabase contains resorts with valid `state` and `country` fields

## Estimated Complexity

**Medium** - Primarily involves:
- URL parameter handling (existing pattern in DirectoryContent)
- Component prop updates
- New geo-mapping data file
- Filter UI additions
