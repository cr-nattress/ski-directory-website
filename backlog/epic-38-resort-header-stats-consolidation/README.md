# Epic 38: Resort Header Stats Consolidation

## Overview

Consolidate all resort facts and figures (currently in the separate "Mountain Stats" section) into the resort header area, providing users with key information immediately visible at the top of the resort detail page. This improves the user experience by reducing scroll and presenting the most important data upfront.

## Problem Statement

Currently, the resort detail page has:
1. **ResortHero** component with basic info (name, location, pass badges, photos)
2. **Mountain Stats** section further down the page with key stats (vertical drop, summit/base elevation, acres, snowfall, runs, lifts, terrain breakdown)

Users must scroll past the hero and overview sections to find critical decision-making data. This is suboptimal UX for skiers who want quick access to elevation, terrain difficulty, and resort size.

## Goals

- Surface key resort metrics immediately in the header area
- Remove the separate Mountain Stats section to reduce redundancy
- Create a clean, scannable UI that works on both desktop and mobile
- Maintain visual hierarchy with hero imagery while adding data visibility
- Add a feature flag to control the new layout

## Scope

### In Scope
- Research UI/UX patterns from competitor ski sites (OnTheSnow, SkiResort.info, etc.)
- Design new header stats component with trail difficulty, elevation, key metrics
- Implement the consolidated header stats UI
- Add feature flag `resortHeaderStats`
- Disable/remove Mountain Stats section when new component is enabled
- Update mobile accordion to match new structure

### Out of Scope
- Changes to the sidebar/action rail components
- New data fields (use existing resort stats)
- Live conditions data (handled by ConditionsSection)

## User Stories

### Story 38.1: Research & Design UI/UX Approach
**As a** product owner
**I want** to research how other ski websites display resort stats in their headers
**So that** we can implement an industry-standard, user-friendly design

**Acceptance Criteria:**
- [ ] Document UI patterns from 5+ competitor sites (OnTheSnow, SkiResort.info, Liftopia, EpicPass, Ikon Pass)
- [ ] Identify common elements displayed in resort headers
- [ ] Propose 2-3 design options for the consolidated header
- [ ] Document mobile vs desktop considerations
- [ ] Create wireframes or mockups for preferred approach

**Research Focus Areas:**
- Trail difficulty breakdown visualization (colored bars, percentages)
- Elevation display (summit/base/vertical)
- Key stats prioritization (which 5-8 stats appear "above the fold")
- Icon usage and visual hierarchy
- Mobile-first considerations

---

### Story 38.2: Add Feature Flag for Header Stats
**As a** developer
**I want** a feature flag to control the new header stats component
**So that** we can safely test and roll out the new layout

**Acceptance Criteria:**
- [ ] Add `resortHeaderStats` flag to `feature-flags.ts` (default: false)
- [ ] Add `mountainStatsSection` flag to control legacy section visibility
- [ ] Document the flags in feature-flags.ts comments

---

### Story 38.3: Implement ResortHeaderStats Component
**As a** skier viewing a resort page
**I want** to see key resort stats immediately in the header
**So that** I can quickly assess if the resort fits my skill level and preferences

**Acceptance Criteria:**
- [ ] Create `ResortHeaderStats` component with:
  - Trail difficulty breakdown (green/blue/black/double-black with percentages)
  - Summit elevation
  - Base elevation
  - Vertical drop
  - Skiable acres
  - Total runs
  - Total lifts
  - Annual snowfall
- [ ] Component renders below resort name, above photo gallery
- [ ] Responsive design for mobile and desktop
- [ ] Uses existing resort data (no new API calls)
- [ ] Accessible with proper ARIA labels
- [ ] Clean visual design matching site theme

---

### Story 38.4: Integrate Header Stats into ResortHero
**As a** developer
**I want** to integrate the new stats component into the resort hero section
**So that** users see stats immediately without scrolling

**Acceptance Criteria:**
- [ ] Add `ResortHeaderStats` to `ResortHero.tsx`
- [ ] Position stats strip below resort title/location
- [ ] Ensure proper spacing with photo gallery
- [ ] Feature flag controls visibility
- [ ] Works correctly on both desktop and mobile

---

### Story 38.5: Disable Mountain Stats Section
**As a** developer
**I want** to disable the legacy Mountain Stats section when header stats are enabled
**So that** we don't show duplicate information

**Acceptance Criteria:**
- [ ] Wrap Mountain Stats section with feature flag check
- [ ] When `resortHeaderStats: true`, hide Mountain Stats section
- [ ] Update `MobileResortSections.tsx` to hide "Mountain Stats" accordion item
- [ ] Ensure no visual gaps when section is hidden
- [ ] Keep legacy section functional for fallback

---

### Story 38.6: Mobile Optimization
**As a** mobile user
**I want** the header stats to display correctly on my phone
**So that** I get the same quick access to resort data

**Acceptance Criteria:**
- [ ] Stats grid reflows properly on small screens
- [ ] Trail difficulty visualization works on mobile
- [ ] Text remains readable at mobile sizes
- [ ] Touch targets are appropriately sized
- [ ] No horizontal scroll on stats section

---

## Technical Notes

### Current Components Affected
- `apps/v1/components/resort-detail/ResortHero.tsx`
- `apps/v1/components/resort-detail/ResortDetail.tsx` (Mountain Stats section)
- `apps/v1/components/resort-detail/MobileResortSections.tsx` (Mountain Stats accordion)
- `apps/v1/lib/config/feature-flags.ts`

### Data Available (from Resort type)
```typescript
resort.stats.verticalDrop      // number (feet)
resort.stats.summitElevation   // number (feet)
resort.stats.baseElevation     // number (feet)
resort.stats.skiableAcres      // number
resort.stats.avgAnnualSnowfall // number (inches)
resort.stats.runsCount         // number
resort.stats.liftsCount        // number

resort.terrain.beginner        // percentage
resort.terrain.intermediate    // percentage
resort.terrain.advanced        // percentage
resort.terrain.expert          // percentage
```

### Design Considerations
- Trail difficulty: Use industry-standard colors (green, blue, black, double-black)
- Consider horizontal bar chart vs. circular chart vs. simple percentages
- Icon usage for elevation, snowfall, lifts
- Compact display that doesn't overwhelm the hero

## Definition of Done
- [ ] Research documented with competitor analysis
- [ ] Feature flags implemented
- [ ] New `ResortHeaderStats` component created
- [ ] Component integrated into ResortHero
- [ ] Mountain Stats section disabled when flag enabled
- [ ] Mobile responsive design verified
- [ ] No regression in existing functionality
- [ ] Code reviewed and merged

## Priority
Medium - Improves UX but not blocking other work

## Dependencies
None - uses existing data

## Story Breakdown Summary

| Story | Title | Priority | Effort |
|-------|-------|----------|--------|
| 38.1 | Research & Design UI/UX Approach | P1 | M |
| 38.2 | Add Feature Flag for Header Stats | P1 | S |
| 38.3 | Implement ResortHeaderStats Component | P1 | L |
| 38.4 | Integrate Header Stats into ResortHero | P2 | M |
| 38.5 | Disable Mountain Stats Section | P2 | S |
| 38.6 | Mobile Optimization | P2 | M |
