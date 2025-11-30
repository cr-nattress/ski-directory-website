# Epic 18: Interactive Ski Resort Map

## Overview

Add an interactive map view to the landing page as an alternative to the resort card grid. Users can toggle between "Cards" and "Map" views below the hero section. The map displays all resort locations with color-coded markers by pass type and popups with quick resort info.

## Business Value

- Provides visual geographic context for resort locations
- Enables users to discover resorts by region/proximity
- Offers alternative browsing experience for visual learners
- Increases engagement with an interactive UI element
- Leverages existing Leaflet infrastructure (already used in LocationMapCard)

## Technical Context

### Current State
- **Map Library**: Leaflet already installed and used in `LocationMapCard.tsx`
- **Data Source**: Supabase database with resort coordinates
- **Resort Data**: Full resort objects include lat/lng coordinates

### Target State
- **Map View**: Full-page interactive map showing all resort pins
- **View Toggle**: Segmented control to switch between Cards and Map views
- **Pin Popups**: Click pins to see resort summary and navigate to detail page
- **Browser Caching**: Cache map pin data with localStorage

### Architecture Decisions

1. **Map Library: Leaflet (Already Installed)**
   - No additional API keys needed
   - OSS, free, existing patterns in codebase
   - Trade-off: Less fancy styling than Mapbox, but functional

2. **Data Source: Optimized Supabase View**
   - Create `resorts_map_pins` view with minimal fields for fast loading
   - Cache results in browser using custom hook
   - Fallback to mock data when Supabase is disabled

3. **Toggle UX: Segmented Control**
   - Position between Hero and content section
   - Persist preference in localStorage
   - Animate transition between views

---

## Branch

All work for this epic should be done on branch: `epic-18-interactive-map`

```bash
git checkout -b epic-18-interactive-map
```

---

# User Stories

## Phase 1: Data Layer

### Story 18.1: Create Supabase Map Pins View
**As a** developer
**I want** an optimized database view for map pin data
**So that** the map loads quickly with minimal data transfer

**Tasks:**
1. Create `resorts_map_pins` view in Supabase
2. Include only fields needed for map display
3. Filter to active and lost resorts only
4. Test view returns expected data

**Acceptance Criteria:**
- [ ] View created: `resorts_map_pins`
- [ ] Returns minimal fields: id, slug, name, lat, lng, nearest_city, state_code, pass_affiliations, rating, status, is_active, is_lost, terrain_open_percent, snowfall_24h
- [ ] Query performance is acceptable (<100ms)
- [ ] View is accessible via Supabase client

**Migration SQL:**
```sql
CREATE OR REPLACE VIEW resorts_map_pins AS
SELECT
  id,
  slug,
  name,
  ST_Y(location::geometry) as latitude,
  ST_X(location::geometry) as longitude,
  nearest_city,
  state_slug as state_code,
  (SELECT array_agg(pass_slug) FROM resort_passes WHERE resort_id = r.id) as pass_affiliations,
  (stats->>'rating')::numeric as rating,
  status,
  is_active,
  is_lost,
  (stats->>'terrainOpenPercent')::numeric as terrain_open_percent,
  (stats->>'snowfall24h')::numeric as snowfall_24h
FROM resorts r
WHERE is_active = true OR is_lost = true;
```

**Effort:** Small

---

### Story 18.2: Create ResortMapPin TypeScript Type
**As a** developer
**I want** a TypeScript interface for map pin data
**So that** I have type safety when working with map pins

**Tasks:**
1. Add `ResortMapPin` interface to types file
2. Include all fields from the view
3. Export from types index

**Acceptance Criteria:**
- [ ] Interface created in `lib/mock-data/types.ts`
- [ ] All fields from view are represented
- [ ] Interface exported from types

**Implementation:**
```typescript
export interface ResortMapPin {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  nearestCity: string;
  stateCode: string;
  passAffiliations: string[];
  rating: number;
  status: 'open' | 'closed' | 'opening-soon';
  isActive: boolean;
  isLost: boolean;
  terrainOpenPercent?: number;
  snowfall24h?: number;
}
```

**Effort:** Small

---

### Story 18.3: Add Supabase Service Method for Map Pins
**As a** developer
**I want** a service method to fetch map pin data from Supabase
**So that** the map component can retrieve optimized data

**Tasks:**
1. Add `getMapPins()` method to supabase-resort-service
2. Query the `resorts_map_pins` view
3. Transform snake_case to camelCase
4. Handle errors appropriately

**Acceptance Criteria:**
- [ ] Method added to `lib/api/supabase-resort-service.ts`
- [ ] Queries `resorts_map_pins` view
- [ ] Returns `ApiResponse<ResortMapPin[]>`
- [ ] Data is properly transformed

**Effort:** Small

---

### Story 18.4: Add Resort Service Method with Mock Fallback
**As a** developer
**I want** a service method with mock data fallback
**So that** the map works without Supabase connection

**Tasks:**
1. Add `getMapPins()` to resort-service
2. Call Supabase service when enabled
3. Provide mock fallback when disabled
4. Extract minimal fields from full resort objects for mock

**Acceptance Criteria:**
- [ ] Method added to `lib/api/resort-service.ts`
- [ ] Uses Supabase when `USE_SUPABASE` is true
- [ ] Falls back to mock data extraction when false
- [ ] Returns consistent data format

**Effort:** Small

---

## Phase 2: Browser Caching

### Story 18.5: Create useMapPins Hook with Caching
**As a** developer
**I want** a custom hook that caches map pin data
**So that** the map doesn't refetch data unnecessarily

**Tasks:**
1. Create `useMapPins` hook in `lib/hooks/`
2. Implement localStorage caching with 5-minute TTL
3. Provide loading, error, and refetch states
4. Check cache before fetching
5. Export from hooks index

**Acceptance Criteria:**
- [ ] Hook created: `lib/hooks/useMapPins.ts`
- [ ] Caches data in localStorage with key `ski-map-pins`
- [ ] Cache expires after 5 minutes
- [ ] Returns `{ pins, isLoading, error, refetch }`
- [ ] Exported from `lib/hooks/index.ts`

**Effort:** Medium

---

## Phase 3: Map Component

### Story 18.6: Create ResortMapView Component
**As a** user
**I want** an interactive map showing all ski resorts
**So that** I can explore resorts visually by location

**Tasks:**
1. Create `ResortMapView.tsx` component
2. Initialize Leaflet MapContainer centered on Colorado
3. Add TileLayer with OpenStreetMap tiles
4. Create custom marker icons by pass type
5. Add markers for all pins from useMapPins hook
6. Handle click events on markers

**Acceptance Criteria:**
- [ ] Component created: `components/ResortMapView.tsx`
- [ ] Map renders centered on Colorado (39.0, -105.5)
- [ ] All resort pins display at correct coordinates
- [ ] Markers have different colors by pass type:
  - Epic: Red (#dc2626)
  - Ikon: Orange (#f97316)
  - Local/Indy: Blue (#3b82f6)
  - Lost: Gray (#6b7280)
- [ ] Map is responsive (500px mobile, 600px desktop)

**Effort:** Large

---

### Story 18.7: Add Resort Popup to Map Markers
**As a** user
**I want** to see resort info when I click a marker
**So that** I can quickly learn about a resort

**Tasks:**
1. Add Popup component to each marker
2. Display resort name, city, rating, status
3. Show 24h snowfall when available
4. Display pass affiliation badges
5. Add "View Details" button linking to resort page

**Acceptance Criteria:**
- [ ] Popup appears on marker click
- [ ] Shows resort name, nearest city, rating
- [ ] Status badge (Open/Closed) displays
- [ ] Snowfall shows when > 0
- [ ] Pass badges render with correct colors
- [ ] "View Details" button navigates to `/colorado/{slug}`
- [ ] Popup closes when clicking elsewhere

**Effort:** Medium

---

### Story 18.8: Add Map Legend
**As a** user
**I want** a legend explaining marker colors
**So that** I understand what the colors mean

**Tasks:**
1. Add legend overlay in bottom-left corner
2. Show color key for Epic, Ikon, Local/Indy, Lost
3. Style with backdrop blur for readability
4. Ensure legend doesn't interfere with map controls

**Acceptance Criteria:**
- [ ] Legend displays in bottom-left corner
- [ ] Shows 4 color entries with labels
- [ ] Has semi-transparent white background
- [ ] z-index above map tiles
- [ ] Readable on all backgrounds

**Effort:** Small

---

### Story 18.9: Create Dynamic Import Wrapper
**As a** developer
**I want** a wrapper that dynamically imports the map
**So that** Leaflet doesn't break SSR

**Tasks:**
1. Create `ResortMapViewWrapper.tsx`
2. Use Next.js `dynamic` import with `ssr: false`
3. Show loading placeholder while importing
4. Export for use in parent components

**Acceptance Criteria:**
- [ ] Wrapper created: `components/ResortMapViewWrapper.tsx`
- [ ] Uses `dynamic()` with `ssr: false`
- [ ] Shows loading skeleton while map loads
- [ ] No "window is not defined" errors
- [ ] Map renders correctly after hydration

**Effort:** Small

---

## Phase 4: View Toggle

### Story 18.10: Create ViewToggle Component
**As a** user
**I want** a toggle to switch between Cards and Map views
**So that** I can choose my preferred browsing method

**Tasks:**
1. Create `ViewToggle.tsx` component
2. Implement segmented control with two buttons
3. Use lucide-react icons (Grid3X3, Map)
4. Style active/inactive states
5. Accept value and onChange props

**Acceptance Criteria:**
- [ ] Component created: `components/ViewToggle.tsx`
- [ ] Two buttons: "Cards" and "Map"
- [ ] Icons display correctly
- [ ] Active button has white background with shadow
- [ ] Inactive button has transparent background
- [ ] Smooth transition on toggle

**Effort:** Small

---

### Story 18.11: Create useViewMode Hook with Persistence
**As a** user
**I want** my view preference to be remembered
**So that** I see my preferred view on return visits

**Tasks:**
1. Create `useViewMode` hook
2. Store preference in localStorage
3. Handle hydration to prevent mismatch
4. Return mode, setMode, and isHydrated

**Acceptance Criteria:**
- [ ] Hook created: `lib/hooks/useViewMode.ts`
- [ ] Stores mode in localStorage key `ski-directory-view-mode`
- [ ] Defaults to 'cards' if no stored value
- [ ] `isHydrated` prevents flash of wrong content
- [ ] Exported from `lib/hooks/index.ts`

**Effort:** Small

---

## Phase 5: Page Integration

### Story 18.12: Create ResortSection Container Component
**As a** developer
**I want** a container component that manages the view toggle
**So that** the landing page stays clean

**Tasks:**
1. Create `ResortSection.tsx` component
2. Include section header with toggle
3. Conditionally render ResortGrid or ResortMapViewWrapper
4. Handle loading state during hydration

**Acceptance Criteria:**
- [ ] Component created: `components/ResortSection.tsx`
- [ ] Section header with "Colorado Ski Resorts" title
- [ ] ViewToggle aligned to the right
- [ ] Cards view shows ResortGrid
- [ ] Map view shows ResortMapViewWrapper
- [ ] Transition animation between views

**Effort:** Medium

---

### Story 18.13: Update Landing Page
**As a** user
**I want** to see the view toggle on the landing page
**So that** I can choose between Cards and Map views

**Tasks:**
1. Import ResortSection in page.tsx
2. Replace ResortGrid with ResortSection
3. Verify both views render correctly
4. Test toggle functionality

**Acceptance Criteria:**
- [ ] Landing page uses ResortSection
- [ ] Toggle is visible and functional
- [ ] Cards view matches current behavior
- [ ] Map view displays all resorts
- [ ] URL doesn't change when toggling
- [ ] Works on mobile and desktop

**Effort:** Small

---

## Phase 6: Styling

### Story 18.14: Add Leaflet CSS and Custom Styles
**As a** developer
**I want** proper Leaflet styling
**So that** the map looks polished

**Tasks:**
1. Import Leaflet CSS in globals.css
2. Add custom marker styles
3. Style popup content wrapper
4. Ensure styles don't conflict with existing CSS

**Acceptance Criteria:**
- [ ] Leaflet CSS imported in `app/globals.css`
- [ ] Custom marker class styled correctly
- [ ] Popup has rounded corners (12px)
- [ ] Popup padding is appropriate
- [ ] No style conflicts with existing components

**CSS to add:**
```css
@import 'leaflet/dist/leaflet.css';

.custom-marker {
  background: transparent !important;
  border: none !important;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px;
  padding: 0;
}

.leaflet-popup-content {
  margin: 12px;
}
```

**Effort:** Small

---

## Summary

| Story | Title | Phase | Effort |
|-------|-------|-------|--------|
| 18.1 | Create Supabase Map Pins View | 1: Data Layer | Small |
| 18.2 | Create ResortMapPin TypeScript Type | 1: Data Layer | Small |
| 18.3 | Add Supabase Service Method for Map Pins | 1: Data Layer | Small |
| 18.4 | Add Resort Service Method with Mock Fallback | 1: Data Layer | Small |
| 18.5 | Create useMapPins Hook with Caching | 2: Caching | Medium |
| 18.6 | Create ResortMapView Component | 3: Map Component | Large |
| 18.7 | Add Resort Popup to Map Markers | 3: Map Component | Medium |
| 18.8 | Add Map Legend | 3: Map Component | Small |
| 18.9 | Create Dynamic Import Wrapper | 3: Map Component | Small |
| 18.10 | Create ViewToggle Component | 4: View Toggle | Small |
| 18.11 | Create useViewMode Hook with Persistence | 4: View Toggle | Small |
| 18.12 | Create ResortSection Container Component | 5: Page Integration | Medium |
| 18.13 | Update Landing Page | 5: Page Integration | Small |
| 18.14 | Add Leaflet CSS and Custom Styles | 6: Styling | Small |

**Total Stories:** 14
**Overall Effort:** Medium

---

## Testing Checklist

- [ ] Map loads without SSR errors
- [ ] All resort pins display at correct locations
- [ ] Clicking pin opens popup with correct data
- [ ] "View Details" navigates to correct resort page
- [ ] Pass colors display correctly (Epic=red, Ikon=orange, etc.)
- [ ] Lost resorts show gray markers
- [ ] Toggle switches between cards and map smoothly
- [ ] View preference persists after page refresh
- [ ] Map works on mobile (touch zoom, tap markers)
- [ ] Cache expires and refreshes after 5 minutes
- [ ] Works with both Supabase and mock data

---

## Future Enhancements

1. **Marker Clustering** - Group nearby pins at low zoom levels
2. **Filter Integration** - Apply category filters to map markers
3. **Current Location** - "Resorts near me" button
4. **Route Planning** - Show driving routes from Denver
5. **Weather Overlay** - Snow forecast layer
6. **State Boundaries** - Highlight Colorado border
7. **Search on Map** - Pan/zoom to searched resort

---

## Dependencies

- Leaflet (already installed)
- react-leaflet (already installed)
- lucide-react (already installed)
- Supabase client (already configured)

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `migration/xxx_create_map_pins_view.sql` | Create | Supabase view for optimized map data |
| `lib/mock-data/types.ts` | Edit | Add `ResortMapPin` interface |
| `lib/api/supabase-resort-service.ts` | Edit | Add `getMapPins()` method |
| `lib/api/resort-service.ts` | Edit | Add `getMapPins()` with mock fallback |
| `lib/hooks/useMapPins.ts` | Create | Hook with localStorage caching |
| `lib/hooks/useViewMode.ts` | Create | View preference persistence |
| `lib/hooks/index.ts` | Edit | Export new hooks |
| `components/ResortMapView.tsx` | Create | Main map component |
| `components/ResortMapViewWrapper.tsx` | Create | SSR-safe wrapper |
| `components/ViewToggle.tsx` | Create | Cards/Map toggle UI |
| `components/ResortSection.tsx` | Create | Container with toggle |
| `app/page.tsx` | Edit | Use ResortSection |
| `app/globals.css` | Edit | Leaflet CSS imports |
