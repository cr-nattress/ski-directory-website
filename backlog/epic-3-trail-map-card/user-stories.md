# Epic 3: Trail Map Card Implementation

## Overview
Add a dedicated card component on the resort detail page that displays the ski resort's trail map, allowing users to view the mountain's terrain and run layout.

## User Stories

### Story 3.1: Design Trail Map Card Component
**As a** user viewing a resort detail page
**I want** to see a trail map card
**So that** I can view the ski runs and terrain layout

**Acceptance Criteria:**
- [ ] Trail map card follows existing design patterns
- [ ] Card has clear title "Trail Map" or similar
- [ ] Card is responsive on all devices
- [ ] Appropriate placement on the page (after location map)

**Design Notes:**
- Match existing card styling
- Consider full-width or large display for map visibility
- Add expand/fullscreen option for better viewing

---

### Story 3.2: Add Trail Map Data to Resort Model
**As a** developer
**I want** to extend the resort data model to include trail map information
**So that** each resort can have its trail map displayed

**Acceptance Criteria:**
- [ ] Add trailMapUrl field to Resort type
- [ ] Update mock data with trail map image URLs for each resort
- [ ] Trail maps are properly typed in TypeScript

**Technical Notes:**
- Could use placeholder trail map images initially
- Could link to official resort trail map PDFs/images
- Consider using high-resolution images

---

### Story 3.3: Implement Trail Map Display
**As a** user
**I want** to view a clear, zoomable trail map
**So that** I can see the ski runs and plan my skiing

**Acceptance Criteria:**
- [ ] Trail map image displays correctly
- [ ] Image is high quality and readable
- [ ] Optional: Image can be clicked to zoom/expand
- [ ] Optional: Link to download/view full PDF

**Technical Notes:**
- Use Next.js Image component for optimization
- Consider implementing zoom functionality
- Could use a lightbox library for fullscreen view

---

### Story 3.4: Add Trail Map Fallback and Error Handling
**As a** user
**I want** appropriate fallback content if trail map is unavailable
**So that** the page doesn't break when trail map is missing

**Acceptance Criteria:**
- [ ] Show placeholder or message if no trail map available
- [ ] Handle image loading errors gracefully
- [ ] Provide link to resort website if trail map unavailable

**Technical Notes:**
- Implement proper error boundaries
- Use placeholder images or icons
- Add loading states
