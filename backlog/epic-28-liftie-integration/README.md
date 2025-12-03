# Epic 28: Liftie Data Integration

## Overview

Integrate real-time lift status, weather conditions, and webcam data from Liftie.info into the ski resort directory. This data is already being collected and stored in GCS by an existing updater process.

## Business Value

- **Real-time information**: Show users current lift status and weather conditions
- **Better user experience**: Help skiers decide when and where to ski based on live data
- **Competitive advantage**: Most ski directories don't show real-time lift percentages
- **Webcam integration**: Let users visually check conditions before visiting

## Data Source

Liftie data is stored in GCS at `resorts/{country}/{state}/{slug}/liftie/` with the following files:
- `summary.json` - Overview with lift stats and feature flags
- `lifts.json` - Individual lift status (open/closed/hold/scheduled)
- `weather.json` - NOAA weather forecast data
- `webcams.json` - Webcam URLs (when available)

**Current Coverage**: 86 resorts have Liftie data

## Technical Scope

### Database Changes
- Add real-time conditions table or JSONB column for frequently updated data
- Add webcams support to schema
- Add `hasWebcams` feature flag

### Frontend Changes
- Display lift status on resort cards and detail pages
- Show weather conditions with icons
- Integrate webcam viewer component
- Add "Last Updated" timestamps for real-time data

### Backend/API Changes
- Create Liftie data fetcher/updater service
- API endpoints for real-time conditions
- Caching strategy for frequently accessed data

---

## User Stories

### Story 28.1: Database Schema for Real-Time Conditions

**As a** developer
**I want** a separate table for real-time resort conditions
**So that** frequently updated data doesn't bloat the main resorts table

**Acceptance Criteria:**
- [ ] Create `resort_conditions` table with columns:
  - `resort_id` (FK to resorts)
  - `lifts_open` (integer)
  - `lifts_total` (integer)
  - `lifts_percentage` (numeric)
  - `weather_high` (integer, Fahrenheit)
  - `weather_condition` (text, e.g., "Snow Showers")
  - `weather_text` (text, full NOAA forecast)
  - `weather_icon` (text array)
  - `updated_at` (timestamptz)
- [ ] Create view joining resorts with conditions
- [ ] Add RLS policies for public read access
- [ ] Create index on resort_id

**Story Points:** 3

---

### Story 28.2: Liftie Data Types and Schema

**As a** developer
**I want** TypeScript types for Liftie data
**So that** the codebase has type safety when working with lift/weather data

**Acceptance Criteria:**
- [ ] Create `apps/v1/lib/types/liftie.ts` with interfaces:
  - `LiftieSummary`
  - `LiftieLifts`
  - `LiftieWeather`
  - `LiftieWebcams`
- [ ] Create `liftie-mapping.json` documenting field mappings
- [ ] Add helper functions for parsing Liftie data
- [ ] Export types from main types index

**Story Points:** 2

---

### Story 28.3: Conditions Updater Service

**As a** system administrator
**I want** an automated service to sync Liftie data from GCS to Supabase
**So that** resort conditions stay current

**Acceptance Criteria:**
- [ ] Create `apps/updaters/liftie-sync/` project
- [ ] Read Liftie JSON files from GCS for each resort
- [ ] Map Liftie data to `resort_conditions` table
- [ ] Support `--dry-run` mode
- [ ] Support `--filter` for specific resorts
- [ ] Log sync statistics (updated, skipped, errors)
- [ ] Handle missing Liftie data gracefully

**Story Points:** 5

---

### Story 28.4: Resort Card Lift Status Display

**As a** user browsing the resort directory
**I want** to see lift status on resort cards
**So that** I can quickly identify which resorts are operational

**Acceptance Criteria:**
- [ ] Add lift status indicator to `ResortCard.tsx`
- [ ] Show "X/Y lifts open" or "X% open"
- [ ] Color coding: green (>75%), yellow (25-75%), red (<25%)
- [ ] Show "No data" gracefully when conditions unavailable
- [ ] Add feature flag to toggle lift status display
- [ ] Ensure responsive design

**Story Points:** 3

---

### Story 28.5: Resort Detail Live Conditions Section

**As a** user viewing a resort detail page
**I want** to see comprehensive live conditions
**So that** I can make informed decisions about visiting

**Acceptance Criteria:**
- [ ] Create `LiveConditions.tsx` component
- [ ] Display:
  - Lifts open count and percentage with progress bar
  - Weather high temperature with icon
  - Weather condition text (e.g., "Snow Showers")
  - Full NOAA forecast text (expandable)
  - "Last updated" timestamp
- [ ] Link to NOAA forecast page
- [ ] Handle missing data states
- [ ] Mobile-responsive layout

**Story Points:** 5

---

### Story 28.6: Individual Lift Status List

**As a** user planning my ski day
**I want** to see the status of each individual lift
**So that** I know which areas of the mountain are accessible

**Acceptance Criteria:**
- [ ] Create `LiftStatusList.tsx` component
- [ ] Display all lifts with status (open/closed/hold/scheduled)
- [ ] Status icons/colors for each state
- [ ] Collapsible/expandable list for resorts with many lifts
- [ ] Sort by status (open first) or alphabetically
- [ ] Show lift type if available (gondola, express, chair)

**Story Points:** 3

---

### Story 28.7: Webcam Integration

**As a** user checking conditions
**I want** to view resort webcams
**So that** I can visually assess snow and weather conditions

**Acceptance Criteria:**
- [ ] Add `webcams` field to Resort type
- [ ] Create `WebcamGallery.tsx` component
- [ ] Display webcam thumbnails with names
- [ ] Click to view larger image or open source URL
- [ ] Handle image loading errors gracefully
- [ ] Add `hasWebcams` feature flag
- [ ] Only show section for resorts with webcam data

**Story Points:** 5

---

### Story 28.8: Conditions API Endpoint

**As a** frontend developer
**I want** API endpoints for resort conditions
**So that** I can fetch real-time data efficiently

**Acceptance Criteria:**
- [ ] Create `/api/resorts/[slug]/conditions` endpoint
- [ ] Return combined conditions data (lifts, weather, webcams)
- [ ] Include cache headers for appropriate TTL
- [ ] Handle 404 for resorts without conditions
- [ ] Add to existing resort detail data fetch

**Story Points:** 3

---

### Story 28.9: Map Popup Conditions

**As a** user using the interactive map
**I want** to see basic conditions in map popups
**So that** I can compare resorts at a glance

**Acceptance Criteria:**
- [ ] Add lift percentage to map pin popup
- [ ] Add weather condition icon
- [ ] Keep popup lightweight (no full forecast)
- [ ] Update `ResortMapPin` type with conditions fields
- [ ] Ensure map performance isn't impacted

**Story Points:** 3

---

### Story 28.10: Conditions Data Freshness Indicator

**As a** user viewing conditions data
**I want** to know how recent the data is
**So that** I can trust the information

**Acceptance Criteria:**
- [ ] Display "Updated X minutes ago" on conditions
- [ ] Show warning if data is stale (>2 hours old)
- [ ] Different styling for stale vs fresh data
- [ ] Tooltip with exact timestamp
- [ ] Handle timezone appropriately

**Story Points:** 2

---

## Technical Notes

### Liftie Data Structure

**summary.json:**
```json
{
  "id": "vail",
  "name": "Vail",
  "hasLifts": true,
  "hasWeather": true,
  "hasWebcams": false,
  "liftStats": {
    "open": 6,
    "hold": 0,
    "scheduled": 0,
    "closed": 0,
    "percentage": { "open": 100, "hold": 0, "scheduled": 0, "closed": 0 }
  },
  "timestamp": "2025-12-03T21:41:26.635Z"
}
```

**lifts.json:**
```json
{
  "status": {
    "Eagle Bahn Gondola #19": "open",
    "Chair 7": "closed"
  },
  "stats": { "open": 6, "hold": 0, "scheduled": 0, "closed": 0 }
}
```

**weather.json:**
```json
{
  "date": "2025-12-03",
  "icon": ["basecloud", "icon-snowy"],
  "text": "Snow showers. High near 17...",
  "conditions": "Snow Showers",
  "temperature": { "max": 17 }
}
```

**webcams.json:**
```json
{
  "webcams": [
    { "name": "Lodge", "source": "https://...", "image": "https://..." }
  ]
}
```

### Mapping to Resort.ts

| Liftie Field | Resort.ts Field | Action |
|--------------|-----------------|--------|
| `liftStats.open` | `conditions.liftsOpen` | Direct map |
| `liftStats.percentage.open` | NEW: `conditions.liftsPercentage` | Add field |
| `weather.temperature.max` | `weather.current.temp` | Direct map |
| `weather.conditions` | `weather.current.condition` | Direct map |
| `weather.text` | NEW: `weather.forecastText` | Add field |
| `webcams` | NEW: `webcams[]` | Add array |

---

## Dependencies

- GCS access for reading Liftie data
- Supabase for storing conditions
- Existing resort data in database

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Liftie data may be stale | Show "last updated" timestamps, warn on stale data |
| Not all resorts have Liftie data | Graceful fallback UI for missing data |
| Frequent updates may strain database | Use separate conditions table, appropriate caching |
| Webcam images may be unavailable | Handle image loading errors, show placeholder |

## Success Metrics

- 86+ resorts showing live conditions
- Page load time < 2 seconds with conditions
- User engagement with conditions section
- Reduced bounce rate on resort detail pages

## Total Story Points: 34

## Priority Order

1. Story 28.1 - Database Schema (foundation)
2. Story 28.2 - Types and Schema (foundation)
3. Story 28.3 - Updater Service (data flow)
4. Story 28.5 - Resort Detail Display (primary value)
5. Story 28.4 - Resort Card Display (secondary value)
6. Story 28.8 - API Endpoint (enables frontend)
7. Story 28.6 - Lift Status List (enhanced detail)
8. Story 28.9 - Map Popup (enhanced map)
9. Story 28.10 - Freshness Indicator (trust)
10. Story 28.7 - Webcam Integration (nice to have)
