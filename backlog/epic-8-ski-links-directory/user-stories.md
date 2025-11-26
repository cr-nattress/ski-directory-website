# Epic 8: Ski Links Directory Page

## Overview

Create a comprehensive Ski Links Directory page that serves as a curated hub of ski-related websites and external resources. Unlike the Colorado-specific A–Z resort directory, this page focuses on **external resources**: resort sites, snow reports, webcams, trail maps, trip planning, gear reviews, education, communities, and news.

The goal is to become a **one-stop resource directory** for skiers, reusing the clean, data-forward patterns and design language of the existing site.

**Reference:** [Full Implementation Plan](../../apps/v1/LINK_DIR_PLAN.md)

---

## User Goals & Use Cases

1. **Trip Planning** - Find official resort sites, lodging, and planning tools
2. **Daily Conditions Check** - Access snow reports, forecasts, and webcams
3. **Learning & Gear Research** - Discover educational sites and gear review platforms
4. **Community & News** - Centralize ski forums, communities, and news outlets

---

## User Stories

### Story 8.1: Create SkiLink Types and Initial Data File

**As a** developer
**I want** to have typed data structures and initial mock data for ski links
**So that** the application has a consistent data model for the links directory

**Acceptance Criteria:**
- [ ] Create `lib/mock-data/ski-links-types.ts` with TypeScript types:
  - `SkiLinkType`: 'resort' | 'snow-weather' | 'webcam-trailmap' | 'trip-planning' | 'gear-reviews' | 'education' | 'community' | 'news'
  - `SkiLinkRegion`: 'colorado' | 'us' | 'north-america' | 'europe' | 'japan' | 'global'
  - `SkiLinkAudience`: 'beginner' | 'family' | 'backcountry' | 'park'
  - `SkiLink` interface with all required fields
- [ ] Create `lib/mock-data/ski-links.ts` with initial dataset of 150 curated links
- [ ] Links cover diverse categories: blogs, ski shops, magazines, gear reviews, webcams, snow reports, forums, etc.
- [ ] Each link has proper metadata: title, URL, description, type, regions, audience, tags, isOfficial, isPaid, priority
- [ ] Export utility functions: `getSkiLinks()`, `getSkiLinksByType()`, `filterSkiLinks()`

**Technical Notes:**
- Follow existing pattern from `resorts.ts`
- Priority field (1-10) determines display order within categories
- Include a good mix of well-known and niche resources

**Estimated Effort:** Large (due to curating 150 quality links)

---

### Story 8.2: Create Ski Links Page Route and Layout

**As a** user
**I want** to navigate to a dedicated Ski Links Directory page
**So that** I can browse all ski-related websites in one place

**Acceptance Criteria:**
- [ ] Create `/ski-links` route at `app/ski-links/page.tsx`
- [ ] Page uses `PageWrapper` with solid header variant
- [ ] Page has a hero section with title and benefit-focused copy
- [ ] Hero displays stats: "X curated links • Y categories"
- [ ] Page is statically generated at build time
- [ ] Proper SEO metadata: title, description, Open Graph tags

**Technical Notes:**
- Server component for initial data fetch
- Pass data to client components for interactive filtering

**Estimated Effort:** Small

---

### Story 8.3: Build SkiLinksHero Component

**As a** user
**I want** to see an engaging introduction to the links directory
**So that** I understand the value of the page immediately

**Acceptance Criteria:**
- [ ] Create `components/ski-links/SkiLinksHero.tsx`
- [ ] Displays compelling headline (e.g., "Stop googling every trip. Explore the best ski websites in one place.")
- [ ] Shows link count and category count stats
- [ ] Clean, minimal design consistent with existing hero patterns
- [ ] Responsive layout for mobile and desktop

**Technical Notes:**
- Accept props for dynamic stats

**Estimated Effort:** Small

---

### Story 8.4: Build SkiLinkCard Component

**As a** user
**I want** to see link information in a clear, scannable card format
**So that** I can quickly evaluate which links are useful to me

**Acceptance Criteria:**
- [ ] Create `components/ski-links/SkiLinkCard.tsx`
- [ ] Card displays: Title, URL preview (domain only), Short description (1-2 lines)
- [ ] Shows badges for: Resource type, Region(s), Audience tags
- [ ] Shows meta flags: Official/Unofficial, Free/Paid/Freemium
- [ ] "Visit site →" CTA opens link in new tab
- [ ] External link icon indicates opens in new tab
- [ ] Hover state for desktop
- [ ] Proper accessibility: `rel="noopener noreferrer"`, `aria-label` for new tab

**Technical Notes:**
- Compact design inspired by `ResortCard` but simplified
- Use existing badge color patterns

**Estimated Effort:** Medium

---

### Story 8.5: Build SkiLinksFilters Component

**As a** user
**I want** to filter and search the links directory
**So that** I can find specific types of resources quickly

**Acceptance Criteria:**
- [ ] Create `components/ski-links/SkiLinksFilters.tsx`
- [ ] Search input for text search (title, description, tags)
- [ ] Type dropdown: All / Resorts / Snow & Weather / Webcams & Trail Maps / Trip Planning / Gear / Education / Community / News
- [ ] Region dropdown: All / Colorado / US / North America / Europe / Japan / Global
- [ ] Audience dropdown: All / Beginner / Family / Backcountry / Park & Freestyle
- [ ] Shows result count: "Showing N of M links"
- [ ] Responsive layout (stacks on mobile)
- [ ] Filter state persists in URL query params

**Technical Notes:**
- Reuse visual patterns from `DirectoryFilters`
- Use `useSearchParams` and `useRouter` for URL state

**Estimated Effort:** Medium

---

### Story 8.6: Build SkiLinksList Component

**As a** user
**I want** to see links grouped by category with section headings
**So that** I can browse related resources together

**Acceptance Criteria:**
- [ ] Create `components/ski-links/SkiLinksList.tsx`
- [ ] Groups cards by `type` (resource category)
- [ ] Section heading shows category name and count (e.g., "Snow Reports & Weather (12)")
- [ ] Responsive grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile
- [ ] Sections are collapsible (optional enhancement)
- [ ] Empty state if no links match filters

**Technical Notes:**
- Use CSS Grid for responsive layout
- Sections sorted by predefined order, not alphabetically

**Estimated Effort:** Medium

---

### Story 8.7: Build SkiLinksContent Client Component

**As a** developer
**I want** a central client component that manages filter state and data
**So that** filtering and display logic are cleanly organized

**Acceptance Criteria:**
- [ ] Create `components/ski-links/SkiLinksContent.tsx` as client component
- [ ] Manages state for: type, region, audience, search query
- [ ] Uses `useMemo` to compute filtered and sorted links
- [ ] Groups links by type for section display
- [ ] Passes filtered data to `SkiLinksList`
- [ ] Syncs filter state with URL query params
- [ ] Handles empty filter results gracefully

**Technical Notes:**
- Follow pattern from `DirectoryContent.tsx`
- Primary sort by priority, secondary by title A-Z

**Estimated Effort:** Medium

---

### Story 8.8: Add Navigation Links to Header and Footer

**As a** user
**I want** to access the Ski Links Directory from the main navigation
**So that** I can easily find the page

**Acceptance Criteria:**
- [ ] Add "Ski Links" link to Header dropdown menu
- [ ] Position after "Directory" in menu order
- [ ] Link navigates to `/ski-links`
- [ ] Add "Ski Links Directory" to Footer under Resources column
- [ ] Current page indicator when on ski-links page (optional)

**Technical Notes:**
- Update `Header.tsx` dropdown menu items
- Update `Footer.tsx` if applicable

**Estimated Effort:** Small

---

### Story 8.9: Implement Keyboard Navigation and Accessibility

**As a** user who relies on keyboard navigation or screen readers
**I want** the ski links directory to be fully accessible
**So that** I can use it regardless of my abilities

**Acceptance Criteria:**
- [ ] All filter controls are keyboard accessible
- [ ] External links have `aria-label` indicating "opens in new tab"
- [ ] Focus states are visible on all interactive elements
- [ ] Tab order is logical
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader announces filter results count on change
- [ ] Skip link to main content (optional)

**Technical Notes:**
- Test with keyboard-only navigation
- Use `role="status"` and `aria-live` for dynamic content updates

**Estimated Effort:** Small

---

### Story 8.10: SEO and Meta Tags

**As a** search engine
**I want** the ski links page to have proper meta tags
**So that** it ranks well and provides rich previews

**Acceptance Criteria:**
- [ ] Page has unique title: "Skiing Websites & Resources Directory | Ski Colorado"
- [ ] Page has meta description summarizing the directory
- [ ] Open Graph tags for social sharing
- [ ] Canonical URL set correctly
- [ ] Page is included in sitemap (future)

**Technical Notes:**
- Use Next.js `generateMetadata` function

**Estimated Effort:** Small

---

### Story 8.11: Add Visual Category Icons (Enhancement)

**As a** user
**I want** to see icons representing each link category
**So that** I can quickly identify resource types visually

**Acceptance Criteria:**
- [ ] Each category has an associated icon
- [ ] Icons displayed in section headings
- [ ] Icons displayed on link cards as small badge
- [ ] Icons are accessible (decorative, hidden from screen readers)
- [ ] Consistent icon style (Lucide or similar)

**Icon Mapping:**
- Resort: Mountain icon
- Snow & Weather: Snowflake/Cloud icon
- Webcams & Trail Maps: Camera/Map icon
- Trip Planning: Calendar/Plane icon
- Gear & Reviews: Shopping bag/Star icon
- Education: Graduation cap/Book icon
- Community: Users/Chat icon
- News: Newspaper icon

**Technical Notes:**
- Use Lucide React icons (already in project)

**Estimated Effort:** Small

---

### Story 8.12: Add "Featured" and "New" Badges (Enhancement)

**As a** user
**I want** to see which links are featured or recently added
**So that** I can discover recommended and fresh resources

**Acceptance Criteria:**
- [ ] Add `isFeatured` and `dateAdded` fields to SkiLink type
- [ ] Featured links display a "Featured" badge
- [ ] Links added in last 30 days display a "New" badge
- [ ] Featured links can be promoted to top of their section
- [ ] Badges have distinct colors (gold for featured, green for new)

**Technical Notes:**
- Update type definition
- Add fields to initial dataset for select links

**Estimated Effort:** Small

---

## Story Summary

| Story | Title | Effort | Priority |
|-------|-------|--------|----------|
| 8.1 | Create SkiLink Types and Initial Data File | Large | P0 |
| 8.2 | Create Ski Links Page Route and Layout | Small | P0 |
| 8.3 | Build SkiLinksHero Component | Small | P0 |
| 8.4 | Build SkiLinkCard Component | Medium | P0 |
| 8.5 | Build SkiLinksFilters Component | Medium | P0 |
| 8.6 | Build SkiLinksList Component | Medium | P0 |
| 8.7 | Build SkiLinksContent Client Component | Medium | P0 |
| 8.8 | Add Navigation Links to Header and Footer | Small | P0 |
| 8.9 | Implement Keyboard Navigation and Accessibility | Small | P1 |
| 8.10 | SEO and Meta Tags | Small | P1 |
| 8.11 | Add Visual Category Icons | Small | P2 |
| 8.12 | Add Featured and New Badges | Small | P2 |

**Total Stories:** 12
**Effort Breakdown:** Small: 7, Medium: 4, Large: 1

---

## Implementation Order

### Phase 1: Foundation (Stories 8.1, 8.2, 8.3)
Create data model, initial dataset of 150 links, and basic page structure.

### Phase 2: Core Components (Stories 8.4, 8.5, 8.6, 8.7)
Build the main UI components for displaying and filtering links.

### Phase 3: Integration (Story 8.8)
Add navigation links to make the page discoverable.

### Phase 4: Polish (Stories 8.9, 8.10)
Accessibility improvements and SEO optimization.

### Phase 5: Enhancements (Stories 8.11, 8.12)
Optional visual and feature improvements.

---

## Dependencies

- Existing design system (colors, fonts, spacing)
- Existing PageWrapper, Header, Footer components
- Existing filter patterns from A-Z Directory
- Lucide React icons

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data storage | In-memory mock data | Phase 1; CMS/DB later |
| State management | URL query params | Shareable links, browser back works |
| Data fetching | Static generation | No real-time data yet |
| Filtering/sorting | Client-side | Moderate dataset (~150 links) |

---

## Initial Link Categories (150 Links)

The initial dataset should include diverse resources across all categories:

### Resort & Mountain Sites (~20 links)
- Major resort chains (Vail Resorts, Alterra)
- Individual resort official sites
- Resort review aggregators

### Snow Reports & Weather (~20 links)
- OpenSnow, OnTheSnow, Snowforecast
- NOAA mountain weather
- Avalanche centers

### Webcams & Trail Maps (~15 links)
- Resort webcam aggregators
- Interactive trail map tools
- Satellite imagery sites

### Trip Planning & Lodging (~20 links)
- Ski trip booking platforms
- Lodging aggregators
- Transportation services
- Resort comparison tools

### Gear & Reviews (~25 links)
- Ski gear review sites (Blister, Ski Magazine)
- Online retailers (Evo, Backcountry.com)
- Used gear marketplaces
- Boot fitting resources

### Lessons, Safety & Education (~15 links)
- Ski instruction resources
- Avalanche safety (AIARE, etc.)
- First aid and safety guides
- Technique videos

### Communities & Forums (~15 links)
- Reddit skiing communities
- TGR, Newschoolers
- Regional ski clubs
- Facebook groups

### News & Editorial (~20 links)
- Ski magazines online
- Ski industry news
- Athlete/pro skier content
- Podcasts

---

## Out of Scope (Future Epics)

- User-submitted links
- Link rating/voting system
- Personalized recommendations
- Admin interface for managing links
- Integration with resort detail pages
- Analytics on link clicks
