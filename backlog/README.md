# Project Backlog

This folder contains the backlog for the Colorado Ski Resort Directory application. Each epic represents a major feature or initiative, broken down into user stories.

## Epic Overview

### Epic 1: Remove List Your Property Button
**Status:** Ready
**Priority:** High
**Effort:** Small

Remove the "List Your Property" button from navigation to streamline the UI for a ski resort directory application.

**User Stories:** 2
📁 [View Epic Details](./epic-1-remove-list-property-button/user-stories.md)

---

### Epic 2: Resort Location Map Integration
**Status:** Ready
**Priority:** High
**Effort:** Medium

Add an interactive map showing the geographic location of each ski resort on the resort detail page.

**User Stories:** 4
📁 [View Epic Details](./epic-2-resort-location-map/user-stories.md)

**Key Decisions Needed:**
- Map library selection (Google Maps, Mapbox, Leaflet, etc.)
- API key setup

---

### Epic 3: Trail Map Card Implementation
**Status:** Ready
**Priority:** High
**Effort:** Medium

Display ski trail maps for each resort in a dedicated card component.

**User Stories:** 4
📁 [View Epic Details](./epic-3-trail-map-card/user-stories.md)

**Dependencies:**
- Need to source trail map images/PDFs for each resort

---

### Epic 4: Weather Forecast Card
**Status:** Ready
**Priority:** High
**Effort:** Large

Integrate real-time weather data showing current conditions and 7-day forecast for each resort.

**User Stories:** 5
📁 [View Epic Details](./epic-4-weather-forecast-card/user-stories.md)

**Key Decisions Needed:**
- Weather API selection and setup
- Caching strategy

**Technical Considerations:**
- API rate limits
- Data refresh intervals
- Error handling

---

### Epic 5: Social Media Links Card
**Status:** Ready
**Priority:** Medium
**Effort:** Small

Add a card displaying social media links for each resort (YouTube, Facebook, Instagram, TikTok, X).

**User Stories:** 5
📁 [View Epic Details](./epic-5-social-media-card/user-stories.md)

**Dependencies:**
- Research and collect social media URLs for all resorts

---

### Epic 6: Global Event Banner System
**Status:** Ready
**Priority:** High
**Effort:** Large

Implement a global event banner system that displays contextual alerts (snow reports, weather warnings, safety notices, system alerts) across all routes, positioned directly below the header with slide animations and dismissible behavior.

**User Stories:** 10
📁 [View Epic Details](./epic-6-global-event-banner/user-stories.md)
📄 [Implementation Blueprint](../apps/v1/docs/GLOBAL-EVENT-BANNER-IMPLEMENTATION-PLAN.md)

**Key Features:**
- 5 alert types: info, snow-report, weather, safety, system
- Priority-based display (critical > high > medium > low)
- Slide-down/up animations
- Dismissible with localStorage persistence
- Resort-specific alert targeting

**Technical Decisions Made:**
- PageWrapper component approach (vs modifying layout.tsx)
- localStorage for dismissal persistence (7-day expiration)
- Mock alert service (real API integration is future work)

---

### Epic 7: A-Z Resort Directory Page
**Status:** Ready
**Priority:** High
**Effort:** Large

Create a comprehensive A-Z Directory page with a hybrid table/card design that provides skiers with a data-dense, scannable view of all Colorado ski resorts for quick comparison.

**User Stories:** 12
📁 [View Epic Details](./epic-7-az-directory-page/user-stories.md)
📄 [Implementation Plan](../apps/v1/A-Z-DIRECTORY-PLAN.md)

**Key Features:**
- Desktop: Sortable data table with all key metrics
- Mobile: Condensed card list optimized for touch
- Sortable by: Name, Snow, Base Depth, Terrain Open, Acres, Vertical, Rating, Distance
- Filterable by: Pass type (Epic/Ikon/Indy), Status (Open/Closed)
- URL-persisted filter/sort state for shareable links

**Data Displayed:**
- Resort name, Status, 24h Snowfall, Base Depth
- Terrain Open %, Skiable Acres, Vertical Drop
- Pass badges, Rating, Distance from Denver

**Technical Approach:**
- Hybrid responsive design (CSS-based view switching)
- Client-side sorting/filtering (small dataset)
- Static generation at build time

---

### Epic 8: Ski Links Directory Page
**Status:** Ready
**Priority:** High
**Effort:** Large

Create a comprehensive Ski Links Directory page serving as a curated hub of 150+ ski-related external resources: resort sites, snow reports, webcams, trail maps, trip planning, gear reviews, education, communities, and news.

**User Stories:** 12
📁 [View Epic Details](./epic-8-ski-links-directory/user-stories.md)
📄 [Implementation Plan](../apps/v1/LINK_DIR_PLAN.md)

**Key Features:**
- 150 curated links covering the entire ski industry
- 8 categories: Resorts, Snow/Weather, Webcams/Maps, Trip Planning, Gear Reviews, Education, Community, News
- Filterable by: Type, Region (Colorado/US/Global/Europe/Japan), Audience (Beginner/Family/Backcountry/Park)
- Search across titles, descriptions, and tags
- Featured and "New" badges for highlighted resources
- URL-persisted filter/search state for shareable links

**Initial Data Coverage:**
- 20 Resort & Mountain Sites (Vail, Ikon, Epic, major destinations)
- 20 Snow Reports & Weather (OpenSnow, avalanche centers, forecasts)
- 15 Webcams & Trail Maps (FATMAP, CalTopo, tracking apps)
- 20 Trip Planning & Lodging (Ski.com, shuttles, rentals)
- 25 Gear & Reviews (Blister, evo, Backcountry.com, used marketplaces)
- 15 Lessons, Safety & Education (PSIA, AIARE, YouTube tutorials)
- 15 Communities & Forums (TGR, Newschoolers, Reddit, regional clubs)
- 20 News & Editorial (SKI Magazine, POWDER, podcasts)

**Technical Approach:**
- In-memory mock data (Phase 1), CMS/database later
- Client-side filtering/sorting
- Static generation at build time
- Reuses design patterns from A-Z Directory

---

## Implementation Order (Recommended)

1. **Epic 1** - Remove List Your Property Button (Quick win, cleanup)
2. **Epic 5** - Social Media Links Card (Small, no external dependencies)
3. **Epic 2** - Resort Location Map Integration (Medium complexity)
4. **Epic 3** - Trail Map Card Implementation (Medium complexity, need assets)
5. **Epic 6** - Global Event Banner System (Large, foundation for future alerts)
6. **Epic 4** - Weather Forecast Card (Most complex, API integration)
7. **Epic 7** - A-Z Resort Directory Page (New page, high user value)
8. **Epic 8** - Ski Links Directory Page (New page, external resources hub)

## Total Effort Estimate
- **Small:** 2 epics (Epics 1, 5)
- **Medium:** 2 epics (Epics 2, 3)
- **Large:** 4 epics (Epics 4, 6, 7, 8)

**Total User Stories:** 54

---

## Notes
- Epics 1-6 enhance the resort detail page
- Epic 7 adds a new directory page for resort comparison
- Epic 8 adds a new external links directory page
- Consider implementing in batches for iterative releases
- Weather API will require API key and cost consideration
- Trail map assets need to be sourced for each resort
- Ski Links data file pre-populated with 150 curated industry links
