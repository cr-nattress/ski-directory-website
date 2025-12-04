# About Ski Resort Directory

## What This Project Is

Ski Resort Directory is a unified platform that aggregates comprehensive data on all ski resorts across North America (United States and Canada). It serves as the single source of truth for skiers and snowboarders seeking detailed, accurate, and up-to-date information about any ski resort on the continent.

## Who It Serves

| User Type | Primary Needs |
|-----------|---------------|
| **Casual Skiers** | Trip planning, comparing resorts, finding beginner-friendly mountains |
| **Hardcore Enthusiasts** | Real-time conditions, terrain stats, snowfall tracking, backcountry access |
| **Families** | Kid-friendly resorts, lessons, amenities, lodging options |
| **Pass Holders** | Finding resorts on their pass (Epic, Ikon, Indy, etc.), maximizing value |
| **Travel Planners** | Distance calculations, multi-resort trips, regional exploration |
| **Ski Historians** | Lost/closed ski areas, historical data, industry trends |

## The Core Problem It Solves

Ski resort information is fragmented across hundreds of individual resort websites, multiple aggregator sites (OnTheSnow, OpenSnow, Liftie), pass provider portals, and social media. Users must visit 5-10 different sources to plan a single ski trip. Data is inconsistent, often outdated, and rarely comparable side-by-side.

**Ski Resort Directory consolidates everything into one platform:**
- No more tab-hopping between resort sites
- Standardized data format for easy comparison
- Single search across all resorts
- Real-time conditions aggregated from multiple sources
- Pass affiliation filtering to maximize pass value

## High-Level Approach

### Data Aggregation Strategy
1. **Authoritative Sources**: Scrape and parse official resort websites for base data
2. **Third-Party APIs**: Integrate with Liftie (lift status), weather APIs, and snow reporting services
3. **Enrichment Pipelines**: Use Wikipedia, Wikidata, and other sources to fill gaps
4. **User Contributions**: Allow verified updates and corrections (future phase)
5. **Manual Curation**: Editorial review for accuracy on high-traffic resorts

### User Experience Philosophy
- **Search-first**: Users find resorts by name, location, or filters
- **Map-centric**: Interactive map as primary discovery interface
- **Comparison-friendly**: Side-by-side stats, sortable directories
- **Mobile-ready**: Responsive design, future native apps

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | Server components, SEO, fast navigation |
| **Language** | TypeScript 5.3 | Type safety, developer experience |
| **Styling** | Tailwind CSS 3.4 | Utility-first, rapid development |
| **Database** | Supabase (PostgreSQL) | Managed, real-time subscriptions, auth-ready |
| **Maps** | Leaflet + react-leaflet | Open-source, customizable, offline-capable |
| **Asset Storage** | Google Cloud Storage | Scalable, CDN-integrated, cost-effective |
| **Hosting** | Netlify / Vercel | Edge functions, easy deployment |
| **Data Pipelines** | Node.js scripts | Scheduled updaters for conditions, Wikipedia, etc. |

## Constraints

### Technical Constraints
- Must work without JavaScript for core content (SEO requirement)
- Map must degrade gracefully (SSR limitations with Leaflet)
- API rate limits from third-party data sources
- Image optimization required for mobile performance

### Data Constraints
- Real-time data dependent on third-party availability
- Some resorts have minimal public information
- Historical data for closed resorts is incomplete
- International expansion requires new data sources

### Legal Constraints
- Respect robots.txt and terms of service when scraping
- Attribute data sources appropriately
- No republishing of copyrighted trail maps without permission

## Non-Goals (Explicit Exclusions)

| Not Building | Reason |
|--------------|--------|
| Booking/reservations system | Complex, liability, existing solutions |
| User accounts (Phase 1) | Adds complexity, not needed for MVP |
| Lift ticket price comparison | Prices change frequently, legal concerns |
| Snow prediction/forecasting | Specialized domain, existing tools |
| Social features (Phase 1) | Focus on data quality first |
| Mobile native apps (Phase 1) | Web-first, responsive approach |
| International resorts (Phase 1) | North America focus for data quality |

## Current State

**Stage: MVP (Minimum Viable Product)**

The platform currently includes:
- 100+ resorts across 20+ US states and Canadian provinces
- Interactive Leaflet map with pass-type color coding
- A-Z directory with filtering and sorting
- Individual resort detail pages
- Distance calculator from major cities
- Multi-pass support (Epic, Ikon, Indy, Mountain Collective, Powder Alliance, etc.)
- Lost ski areas historical database
- Wikipedia-enriched content
- Real-time lift status via Liftie integration

**Next milestone**: Public launch with comprehensive resort coverage and real-time conditions.
