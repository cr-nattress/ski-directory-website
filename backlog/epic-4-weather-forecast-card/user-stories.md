# Epic 4: Weather Forecast Card

## Overview
Create a weather card component that displays current weather conditions and a 7-day forecast for the ski resort location.

## User Stories

### Story 4.1: Design Weather Card Component
**As a** user viewing a resort detail page
**I want** to see current weather and forecast
**So that** I can plan my ski trip based on conditions

**Acceptance Criteria:**
- [ ] Weather card matches existing design patterns
- [ ] Current weather is prominently displayed
- [ ] 7-day forecast is clearly organized
- [ ] Card is responsive on all devices

**Design Requirements:**
- Current weather: temp, conditions, wind, snow depth
- 7-day forecast: date, high/low temps, precipitation, snow forecast
- Weather icons for conditions
- Clean, scannable layout

---

### Story 4.2: Integrate Weather API
**As a** developer
**I want** to integrate a weather API service
**So that** I can fetch real-time weather data for resort locations

**Acceptance Criteria:**
- [ ] Weather API is selected and configured
- [ ] API keys are set up in environment variables
- [ ] API client/service is created
- [ ] Error handling for API failures

**API Options:**
- OpenWeatherMap (free tier available)
- Weather API
- National Weather Service API (free, US only)
- WeatherStack
- Visual Crossing

---

### Story 4.3: Display Current Weather Conditions
**As a** user
**I want** to see current weather at the resort
**So that** I know what conditions are like right now

**Acceptance Criteria:**
- [ ] Current temperature displayed in Fahrenheit
- [ ] Weather condition (sunny, snowy, cloudy, etc.)
- [ ] Weather icon representing conditions
- [ ] Wind speed and direction
- [ ] Current snow depth (from resort conditions data)
- [ ] Last updated timestamp

**Technical Notes:**
- Use resort coordinates to fetch weather data
- Combine API weather with resort snow conditions
- Add refresh functionality
- Cache data appropriately

---

### Story 4.4: Implement 7-Day Forecast Display
**As a** user
**I want** to see the weather forecast for the next 7 days
**So that** I can plan when to visit the resort

**Acceptance Criteria:**
- [ ] 7 days of forecast data displayed
- [ ] Each day shows: date, high/low temp, conditions
- [ ] Snowfall forecast highlighted (if applicable)
- [ ] Weather icons for each day
- [ ] Mobile-friendly scrollable/stackable layout

**Technical Notes:**
- Format dates user-friendly (e.g., "Today", "Tomorrow", "Mon 1/27")
- Highlight snow days
- Consider horizontal scroll on mobile
- Show precipitation probability

---

### Story 4.5: Add Weather Data Caching and Loading States
**As a** developer
**I want** to implement caching and loading states
**So that** the app performs well and provides good UX

**Acceptance Criteria:**
- [ ] Loading skeleton/spinner while fetching data
- [ ] Weather data cached (e.g., 30 minutes)
- [ ] Error state with retry option
- [ ] Graceful degradation if API unavailable

**Technical Notes:**
- Use React Query or SWR for data fetching
- Implement stale-while-revalidate pattern
- Add error boundaries
- Consider showing last cached data on error
