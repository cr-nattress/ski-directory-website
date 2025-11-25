# Epic 7: A-Z Resort Directory Page

## Overview

Create a comprehensive A-Z Directory page that provides skiers with a data-dense, scannable view of all Colorado ski resorts. Unlike the homepage grid view which emphasizes visual discovery, this page prioritizes **information density** and **quick comparison** — enabling users to rapidly assess resort conditions, stats, and make informed decisions.

**Approach:** Hybrid Table + Cards
- Desktop: Enhanced sortable data table
- Mobile: Condensed list cards optimized for touch

**Reference:** [Full Implementation Plan](../../apps/v1/A-Z-DIRECTORY-PLAN.md)

---

## User Stories

### Story 7.1: Create Directory Page Route and Layout

**As a** user
**I want** to navigate to a dedicated A-Z Directory page
**So that** I can see all resorts in a structured, comparable format

**Acceptance Criteria:**
- [ ] Create `/directory` route at `app/directory/page.tsx`
- [ ] Page uses `PageWrapper` with solid header variant
- [ ] Page has a hero section with title "A-Z Resort Directory" and subtitle
- [ ] Page displays count of resorts shown (e.g., "Showing 12 resorts")
- [ ] Footer is included at the bottom
- [ ] Page is statically generated at build time
- [ ] Breadcrumb shows: Home > Directory

**Technical Notes:**
- Server component for initial data fetch
- Client components for interactive filtering/sorting

**Estimated Effort:** Small

---

### Story 7.2: Build Desktop Table Component

**As a** desktop user
**I want** to see all resorts in a sortable data table
**So that** I can quickly scan and compare resort conditions

**Acceptance Criteria:**
- [ ] Create `DirectoryTable.tsx` component
- [ ] Table displays columns: Resort Name, Status, 24h Snow, Base Depth, Terrain Open %, Skiable Acres, Vertical Drop, Pass
- [ ] Resort name is a clickable link to detail page
- [ ] Status shows colored indicator (green=Open, red=Closed, yellow=Opening Soon)
- [ ] Terrain Open shows mini progress bar
- [ ] Pass badges use existing color scheme (Epic=red, Ikon=orange, Indy=purple)
- [ ] Table has proper semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<th scope>`)
- [ ] Rows have hover state for better scanning
- [ ] Hidden on mobile (`hidden lg:block`)

**Technical Notes:**
- Use `tabular-nums` for numeric columns for alignment
- Row height: 56px for comfortable scanning
- Alternating row colors optional

**Estimated Effort:** Medium

---

### Story 7.3: Build Mobile List Component

**As a** mobile user
**I want** to see resorts in a card-based list format
**So that** I can easily browse and compare on my phone

**Acceptance Criteria:**
- [ ] Create `DirectoryList.tsx` component
- [ ] Each resort displays as a horizontal card with key info
- [ ] Card shows: Resort name, Status badge, Pass badge, Rating
- [ ] Card shows stats row: 24h Snow, Base Depth, Terrain Open %, Acres
- [ ] Card shows distance from Denver
- [ ] Card is tappable, links to detail page
- [ ] Cards stack vertically with consistent gap
- [ ] Visible only on mobile (`lg:hidden`)

**Technical Notes:**
- Consider expandable cards for secondary info (future enhancement)
- Ensure touch targets are at least 44x44px

**Estimated Effort:** Medium

---

### Story 7.4: Implement Sorting Functionality

**As a** user
**I want** to sort the directory by different criteria
**So that** I can find resorts that match my priorities

**Acceptance Criteria:**
- [ ] Create `DirectoryFilters.tsx` component with sort dropdown
- [ ] Sort options: A-Z (default), Z-A, Most Snow (24h), Deepest Base, Most Terrain Open, Largest Resort, Most Vertical, Highest Rated, Nearest to Denver
- [ ] Sorting happens client-side (no page reload)
- [ ] Current sort option is visually indicated
- [ ] Table column headers are clickable for sorting (desktop)
- [ ] Sort direction indicator (arrow) shown on active column
- [ ] Sort state persists in URL query params (`?sort=snow`)

**Technical Notes:**
- Use `useMemo` for sorted resort list
- Extend existing `sortResorts` utility or create new one
- Use `useSearchParams` and `useRouter` for URL state

**Estimated Effort:** Medium

---

### Story 7.5: Implement Pass Type Filtering

**As a** user with an Epic/Ikon/Indy pass
**I want** to filter resorts by pass type
**So that** I can see only resorts my pass covers

**Acceptance Criteria:**
- [ ] Add pass filter dropdown to `DirectoryFilters`
- [ ] Filter options: All Passes, Epic Pass, Ikon Pass, Indy Pass, Local/Independent
- [ ] Filtering happens client-side
- [ ] Filtered count updates (e.g., "Showing 5 of 12 resorts")
- [ ] Filter state persists in URL query params (`?pass=epic`)
- [ ] Can combine with sort (e.g., `?pass=epic&sort=snow`)

**Technical Notes:**
- Extend existing `filterResorts` utility
- Multiple passes can be selected in future enhancement

**Estimated Effort:** Small

---

### Story 7.6: Implement Status Filtering

**As a** user planning a ski day
**I want** to filter resorts by open/closed status
**So that** I only see resorts I can actually ski at today

**Acceptance Criteria:**
- [ ] Add status filter dropdown to `DirectoryFilters`
- [ ] Filter options: All, Open Only, Closed Only
- [ ] Filtering happens client-side
- [ ] Works in combination with pass filter and sort
- [ ] Filter state persists in URL query params (`?status=open`)

**Technical Notes:**
- Filter on `conditions.status` field

**Estimated Effort:** Small

---

### Story 7.7: Add Visual Status Indicators

**As a** user
**I want** clear visual indicators for resort status and conditions
**So that** I can quickly identify the best skiing options

**Acceptance Criteria:**
- [ ] Create `StatusBadge.tsx` component
  - Open: Green dot + "Open" text
  - Closed: Red dot + "Closed" text
  - Opening Soon: Yellow dot + "Opening Soon" text
- [ ] Highlight rows/cards with significant fresh snow (>6" in 24h) with subtle blue background
- [ ] Show snowflake icon next to 24h snowfall values
- [ ] Terrain open percentage shows color-coded progress bar
  - 90%+: Green
  - 70-89%: Blue
  - 50-69%: Yellow
  - <50%: Gray

**Technical Notes:**
- Reuse existing color tokens from design system
- Consider accessibility (don't rely on color alone)

**Estimated Effort:** Small

---

### Story 7.8: Add Navigation Link in Header

**As a** user
**I want** to access the A-Z Directory from the main navigation
**So that** I can easily find the directory page

**Acceptance Criteria:**
- [ ] Add "Directory" link to Header dropdown menu
- [ ] Position after "Weather" in the menu order
- [ ] Link navigates to `/directory`
- [ ] Update Footer "A-Z Directory" link to point to `/directory`
- [ ] Current page indicator when on directory page (optional)

**Technical Notes:**
- Update `Header.tsx` dropdown menu items

**Estimated Effort:** Small

---

### Story 7.9: Implement Responsive View Switching

**As a** user
**I want** the page to automatically show the appropriate view for my device
**So that** I have the best experience on any screen size

**Acceptance Criteria:**
- [ ] Desktop (lg+): Show `DirectoryTable`
- [ ] Mobile/Tablet (<lg): Show `DirectoryList`
- [ ] Views use CSS display switching (not JS detection)
- [ ] Both views share the same data and filter state
- [ ] Smooth experience when resizing browser window
- [ ] Filters component is responsive (stacks on mobile)

**Technical Notes:**
- Use Tailwind responsive classes: `hidden lg:block` and `lg:hidden`
- Single `DirectoryContent` client component manages shared state

**Estimated Effort:** Small

---

### Story 7.10: Add Keyboard Navigation and Accessibility

**As a** user who relies on keyboard navigation or screen readers
**I want** the directory to be fully accessible
**So that** I can use it regardless of my abilities

**Acceptance Criteria:**
- [ ] Table uses proper ARIA attributes
- [ ] Sort controls are keyboard accessible
- [ ] Filter dropdowns work with keyboard
- [ ] Status badges have `aria-label` for screen readers
- [ ] Focus states are visible on all interactive elements
- [ ] Tab order is logical
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Sort direction announced to screen readers

**Technical Notes:**
- Test with keyboard-only navigation
- Test with screen reader (VoiceOver/NVDA)

**Estimated Effort:** Small

---

### Story 7.11: Add Secondary Data Expansion (Optional Enhancement)

**As a** user
**I want** to see additional resort details without leaving the page
**So that** I can get more information quickly

**Acceptance Criteria:**
- [ ] Desktop: Hover on row shows tooltip/popover with secondary stats
- [ ] Mobile: Tap card to expand and show additional info
- [ ] Secondary info includes: 72h snowfall, Lifts open (X/Y), Runs count, Summit/Base elevation, Terrain breakdown, Annual avg snowfall
- [ ] Expand/collapse is animated (300ms)
- [ ] Only one card expanded at a time (mobile)

**Technical Notes:**
- Use Radix UI or Headless UI for accessible tooltip/popover
- Consider performance with many expanded rows

**Estimated Effort:** Medium

---

### Story 7.12: SEO and Meta Tags

**As a** search engine
**I want** the directory page to have proper meta tags and structured data
**So that** it ranks well and shows rich results

**Acceptance Criteria:**
- [ ] Page has unique title: "Colorado Ski Resorts A-Z Directory | SkiColorado"
- [ ] Page has meta description summarizing the directory
- [ ] Open Graph tags for social sharing
- [ ] JSON-LD structured data for ItemList of ski resorts
- [ ] Canonical URL set correctly
- [ ] Page is included in sitemap

**Technical Notes:**
- Use Next.js `generateMetadata` function
- ItemList schema: https://schema.org/ItemList

**Estimated Effort:** Small

---

## Story Summary

| Story | Title | Effort | Priority |
|-------|-------|--------|----------|
| 7.1 | Create Directory Page Route and Layout | Small | P0 |
| 7.2 | Build Desktop Table Component | Medium | P0 |
| 7.3 | Build Mobile List Component | Medium | P0 |
| 7.4 | Implement Sorting Functionality | Medium | P0 |
| 7.5 | Implement Pass Type Filtering | Small | P1 |
| 7.6 | Implement Status Filtering | Small | P1 |
| 7.7 | Add Visual Status Indicators | Small | P0 |
| 7.8 | Add Navigation Link in Header | Small | P0 |
| 7.9 | Implement Responsive View Switching | Small | P0 |
| 7.10 | Add Keyboard Navigation and Accessibility | Small | P1 |
| 7.11 | Add Secondary Data Expansion (Optional) | Medium | P2 |
| 7.12 | SEO and Meta Tags | Small | P1 |

**Total Stories:** 12
**Effort Breakdown:** Small: 8, Medium: 4

---

## Implementation Order

### Phase 1: Core Page (Stories 7.1, 7.2, 7.3, 7.7, 7.8, 7.9)
Get the basic page working with table and list views.

### Phase 2: Interactivity (Stories 7.4, 7.5, 7.6)
Add sorting and filtering functionality.

### Phase 3: Polish (Stories 7.10, 7.12)
Accessibility and SEO improvements.

### Phase 4: Enhancement (Story 7.11)
Optional secondary data expansion.

---

## Dependencies

- Existing resort data model and mock data
- Existing design system (colors, fonts, spacing)
- Existing PageWrapper, Header, Footer components

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| View switching | CSS-based | Simpler, no JS flash, better performance |
| State management | URL query params | Shareable links, browser back works |
| Data fetching | Static generation | No real-time data yet, fast loads |
| Sorting/filtering | Client-side | Small dataset (12 resorts), instant response |

---

## Out of Scope (Future Epics)

- Comparison mode (select 2-3 resorts to compare)
- Column visibility toggle
- Export to CSV/PDF
- Real-time data updates
- Historical snow data sparklines
- Integration with trip planner
