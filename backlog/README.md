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

### Epic 9: Social Media Links Directory Page
**Status:** Ready
**Priority:** High
**Effort:** Large

Create a comprehensive Social Media Links Directory page serving as a curated hub of 100+ ski-related social media profiles, channels, and communities across YouTube, Instagram, TikTok, Facebook, Reddit, Twitter/X, Discord, and forums.

**User Stories:** 12
📁 [View Epic Details](./epic-9-social-links-directory/user-stories.md)
📄 [Implementation Plan](../apps/v1/SOCIAL_LINK_DIR_PLAN.md)

**Key Features:**
- 100+ curated social accounts across 8 platforms
- 7 topic categories: Instruction, Trip Vlogs, Gear, Resort Official, Backcountry, News, Communities
- Filterable by: Platform, Topic, Region, Skill Level
- Search across names, handles, and descriptions
- Platform-specific styling with brand colors and icons
- Official/Community badges for account types
- URL-persisted filter/search state for shareable links

**Initial Data Coverage:**
- 20 Instruction & Technique accounts (Stomp It Tutorials, PSIA, coaches)
- 20 Trip Reports & Vlogs (Cody Townsend, TGR, travel vloggers)
- 15 Gear & Reviews (Blister, Ski Essentials, boot fitters)
- 15 Resort & Region Feeds (official resort accounts, local photographers)
- 10 Backcountry & Safety (avalanche centers, guides)
- 10 News, Commentary & Culture (ski news, memes)
- 15 Communities & Groups (Reddit, Facebook groups, Discord)

**Technical Approach:**
- In-memory mock data (Phase 1), CMS/database later
- Client-side filtering/sorting
- Static generation at build time
- Reuses design patterns from Ski Links Directory

---

### Epic 10: SEO Optimization & Structured Data
**Status:** Ready
**Priority:** High
**Effort:** Medium

Implement comprehensive SEO improvements based on Next.js 14 best practices for directory websites. Addresses critical gaps including missing sitemaps, robots.txt, structured data enhancements, canonical URLs, and dynamic OG images.

**User Stories:** 12
📁 [View Epic Details](./epic-10-seo-optimization/user-stories.md)
📄 [SEO Recommendations](../apps/v1/SEO-RECOMMENDATIONS.md)

**Key Features:**
- Dynamic sitemap.xml and robots.txt generation
- metadataBase configuration with title templates
- Canonical URLs on all pages
- BreadcrumbList and WebSite JSON-LD schemas
- Enhanced SkiResort structured data
- Dynamic OG image generation for resort pages
- Incremental Static Regeneration (ISR)
- Core Web Vitals monitoring

**Sprint Breakdown:**
- Sprint 1: Critical Foundation (sitemap, robots, metadataBase, canonicals)
- Sprint 2: Structured Data (JSON-LD components, schema enhancements)
- Sprint 3: Enhancements (OG images, ISR, Web Vitals)

**Technical Approach:**
- Next.js 14 Metadata API
- App Router sitemap.ts and robots.ts conventions
- ImageResponse API for dynamic OG images
- useReportWebVitals for performance monitoring

---

### Epic 11: Colorado Ski Resort Data Population
**Status:** Ready
**Priority:** Critical
**Effort:** X-Large

Populate complete data models for all 76 Colorado ski resorts and areas: 33 currently operating resorts and 43 former/lost ski areas.

**User Stories:** 76
📁 [View Epic Details](./epic-11-resort-data-population/user-stories.md)

**Key Features:**
- Complete data for all 33 active Colorado ski resorts
- Historical data for 43 former/lost ski areas
- isLost flag distinguishes operating vs closed areas
- Comprehensive stats, locations, pass affiliations, and features

**Currently Operating (33):**
- Major destinations: Vail, Aspen (4 mountains), Breckenridge, Telluride, Steamboat
- Summit County: Keystone, Copper, A-Basin, Loveland
- Western Slope: Crested Butte, Monarch, Powderhorn, Sunlight
- Southern Colorado: Purgatory, Wolf Creek, Silverton, Ski Cooper
- Small/Community: Howelsen Hill, Kendall Mountain, Chapman Hill, and more

**Former/Lost Ski Areas (43):**
- Historic areas: Berthoud Pass, Geneva Basin, Hidden Valley
- Recently closed: Bluebird Backcountry, Cuchara Valley
- Absorbed areas: Arrowhead (now Beaver Creek)
- Community hills that no longer operate

**Data Sources:**
- Official resort websites
- Colorado Ski Country USA
- OnTheSnow.com
- Wikipedia
- Colorado Ski History archives

---

## Implementation Order (Recommended)

1. **Epic 1** - Remove List Your Property Button (Quick win, cleanup)
2. **Epic 5** - Social Media Links Card (Small, no external dependencies)
3. **Epic 10** - SEO Optimization & Structured Data (Critical for discoverability)
4. **Epic 11** - Colorado Ski Resort Data Population (Critical, enables all resort features)
5. **Epic 2** - Resort Location Map Integration (Medium complexity)
6. **Epic 3** - Trail Map Card Implementation (Medium complexity, need assets)
7. **Epic 6** - Global Event Banner System (Large, foundation for future alerts)
8. **Epic 4** - Weather Forecast Card (Most complex, API integration)
9. **Epic 7** - A-Z Resort Directory Page (New page, high user value)
10. **Epic 8** - Ski Links Directory Page (New page, external resources hub)
11. **Epic 9** - Social Media Links Directory Page (New page, social accounts hub)

## Total Effort Estimate
- **Small:** 2 epics (Epics 1, 5)
- **Medium:** 3 epics (Epics 2, 3, 10)
- **Large:** 5 epics (Epics 4, 6, 7, 8, 9)
- **X-Large:** 1 epic (Epic 11)

**Total User Stories:** 154

---

## Notes
- Epics 1-6 enhance the resort detail page
- Epic 7 adds a new directory page for resort comparison
- Epic 8 adds a new external links directory page
- Epic 9 adds a new social media accounts directory page
- Epic 10 implements critical SEO infrastructure for search engine visibility
- Epic 11 populates data for all 76 Colorado ski resorts and areas (33 active + 43 lost)
- Consider implementing in batches for iterative releases
- Weather API will require API key and cost consideration
- Trail map assets need to be sourced for each resort
- Ski Links data file pre-populated with 150 curated industry links
- Social Links data file contains 80+ curated social accounts
- SEO implementation requires `NEXT_PUBLIC_BASE_URL` environment variable
- Resort data population (Epic 11) is a prerequisite for comprehensive directory coverage
