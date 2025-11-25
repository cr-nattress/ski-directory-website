# Epic 2: Resort Location Map Integration

## Overview
Add an interactive map component to the resort detail page showing the geographic location of the ski resort, positioned under the resort info card.

## User Stories

### Story 2.1: Design Map Component Layout
**As a** user viewing a resort detail page
**I want** to see a map showing where the resort is located
**So that** I can understand the resort's geographic location and proximity to other areas

**Acceptance Criteria:**
- [ ] Map card is designed to match existing card styles
- [ ] Map is positioned under the resort info card
- [ ] Map is responsive and works on mobile devices
- [ ] Map card has appropriate title/heading

**Design Notes:**
- Follow existing card design patterns
- Ensure consistent spacing and styling
- Consider map height for optimal viewing

---

### Story 2.2: Integrate Map Library
**As a** developer
**I want** to integrate a mapping library (Google Maps, Mapbox, or Leaflet)
**So that** I can display interactive maps on the resort pages

**Acceptance Criteria:**
- [ ] Map library is selected and installed
- [ ] API keys are configured (if required)
- [ ] Map component is created
- [ ] Basic map rendering works

**Technical Options:**
- Option 1: Google Maps API
- Option 2: Mapbox
- Option 3: Leaflet (OpenStreetMap) - Free option
- Option 4: React Simple Maps

---

### Story 2.3: Display Resort Location on Map
**As a** user
**I want** to see a marker on the map indicating the exact resort location
**So that** I can pinpoint where the resort is

**Acceptance Criteria:**
- [ ] Map centers on resort coordinates (lat/lng from resort data)
- [ ] Resort marker is clearly visible
- [ ] Map has appropriate zoom level
- [ ] Resort name appears in marker/popup

**Technical Notes:**
- Use resort.location.lat and resort.location.lng from mock data
- Add custom marker icon if desired
- Set zoom level to show surrounding area context

---

### Story 2.4: Add Map Controls and Features
**As a** user
**I want** to interact with the map (zoom, pan)
**So that** I can explore the surrounding area

**Acceptance Criteria:**
- [ ] Zoom controls are available
- [ ] Map can be panned/dragged
- [ ] Optional: Show nearby cities or landmarks
- [ ] Optional: Show driving distance from Denver

**Technical Notes:**
- Enable standard map controls
- Consider adding distance/direction information
- Could show nearestCity data point
