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

## Implementation Order (Recommended)

1. **Epic 1** - Remove List Your Property Button (Quick win, cleanup)
2. **Epic 5** - Social Media Links Card (Small, no external dependencies)
3. **Epic 2** - Resort Location Map Integration (Medium complexity)
4. **Epic 3** - Trail Map Card Implementation (Medium complexity, need assets)
5. **Epic 6** - Global Event Banner System (Large, foundation for future alerts)
6. **Epic 4** - Weather Forecast Card (Most complex, API integration)

## Total Effort Estimate
- **Small:** 2 epics (Epics 1, 5)
- **Medium:** 2 epics (Epics 2, 3)
- **Large:** 2 epics (Epics 4, 6)

**Total User Stories:** 30

---

## Notes
- All epics enhance the resort detail page
- Consider implementing in batches for iterative releases
- Weather API will require API key and cost consideration
- Trail map assets need to be sourced for each resort
