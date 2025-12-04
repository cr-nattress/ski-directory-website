# Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Web Browser │  │  Mobile Web  │  │  iOS App     │  │  Android App │    │
│  │  (Next.js)   │  │  (PWA)       │  │  (Future)    │  │  (Future)    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────────┘
          │                 │                 │                 │
          └────────────────┬┴─────────────────┴─────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────────────┐
│                           EDGE / CDN                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Netlify / Vercel Edge Network                                       │   │
│  │  - Static asset caching                                              │   │
│  │  - Edge functions for dynamic routes                                 │   │
│  │  - Geographic routing                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Next.js 14 Application (apps/v1/)                                   │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ Server          │  │ Client          │  │ API Routes      │     │   │
│  │  │ Components      │  │ Components      │  │ /api/*          │     │   │
│  │  │ (SSR/SSG)       │  │ (Hydrated)      │  │ (Serverless)    │     │   │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │   │
│  │           └───────────────────┬┴────────────────────┘               │   │
│  └───────────────────────────────┼─────────────────────────────────────┘   │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
┌─────────▼─────────┐  ┌───────────▼───────────┐  ┌────────▼────────┐
│   SUPABASE        │  │   GOOGLE CLOUD        │  │  EXTERNAL APIs  │
│   (Database)      │  │   STORAGE             │  │                 │
│  ┌─────────────┐  │  │  ┌─────────────────┐  │  │  ┌───────────┐  │
│  │ PostgreSQL  │  │  │  │ Resort Images   │  │  │  │ Liftie    │  │
│  │ - resorts   │  │  │  │ - Hero images   │  │  │  │ (Lifts)   │  │
│  │ - passes    │  │  │  │ - Card images   │  │  │  └───────────┘  │
│  │ - cities    │  │  │  │ - Trail maps    │  │  │  ┌───────────┐  │
│  │ - conditions│  │  │  │ - Wiki content  │  │  │  │ Weather   │  │
│  └─────────────┘  │  │  └─────────────────┘  │  │  │ APIs      │  │
│  ┌─────────────┐  │  └───────────────────────┘  │  └───────────┘  │
│  │ Real-time   │  │                             │  ┌───────────┐  │
│  │ Subscriptions│ │                             │  │ Wikipedia │  │
│  └─────────────┘  │                             │  │ /Wikidata │  │
└───────────────────┘                             │  └───────────┘  │
                                                  └─────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────────────────┐
│                         DATA PIPELINES (apps/updaters/)                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │ wikipedia-      │  │ liftie-sync     │  │ wikidata-       │           │
│  │ updater         │  │                 │  │ enricher        │           │
│  │ (Scheduled)     │  │ (Scheduled)     │  │ (Scheduled)     │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└───────────────────────────────────────────────────────────────────────────┘
```

## Main Subsystems

### 1. Web Application (`apps/v1/`)

The primary user-facing application built with Next.js 14.

```
apps/v1/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Homepage (map + cards)
│   ├── directory/            # A-Z directory
│   ├── [country]/[state]/[slug]/  # Resort detail pages
│   ├── ski-links/            # External resources
│   └── api/                  # API routes
├── components/               # React components
│   ├── ResortMapView.tsx     # Leaflet map
│   ├── ResortCard.tsx        # Card component
│   ├── directory/            # Directory components
│   └── resort-detail/        # Detail page components
└── lib/                      # Shared logic
    ├── api/                  # Data fetching
    ├── hooks/                # React hooks
    ├── services/             # Business logic
    └── types/                # TypeScript types
```

**Responsibilities**:
- Render pages (SSR for SEO, client hydration for interactivity)
- Handle user interactions (search, filter, map zoom)
- Fetch data from Supabase
- Serve API endpoints for future mobile apps

### 2. Database Layer (Supabase)

PostgreSQL database with real-time capabilities.

**Core Tables**:
```
resorts              # Primary resort data
├── id, slug, name
├── location (lat/lng)
├── stats (acres, lifts, runs, vertical)
├── terrain (beginner/intermediate/advanced/expert %)
├── features (park, halfpipe, night skiing, etc.)
└── metadata (created_at, updated_at, is_active)

resort_pass_affiliations    # Many-to-many: resorts ↔ passes
├── resort_id
├── pass_id
└── tier (unlimited, limited, blackout dates)

passes                      # Pass programs
├── id, name, slug
├── provider (Vail, Alterra, etc.)
└── type (mega, regional, indie)

major_cities               # Distance calculation reference
├── id, name, state
├── location (lat/lng)
└── is_primary

resort_conditions          # Real-time conditions (updated frequently)
├── resort_id
├── snow_24h, snow_48h, base_depth
├── lifts_open, terrain_open_percent
├── status (open, closed, limited)
└── updated_at
```

**Views**:
```
resorts_full              # Denormalized view joining all data
resort_map_pins           # Lightweight view for map markers
```

### 3. Asset Storage (Google Cloud Storage)

Hierarchical storage for resort media.

```
gs://sda-assets-prod/
└── resorts/
    └── {country}/
        └── {state}/
            └── {slug}/
                ├── cards/
                │   └── main.jpg          # 400x300, card thumbnail
                ├── hero/
                │   └── main.jpg          # 1920x1080, detail page hero
                ├── trailmaps/
                │   └── current.jpg       # Trail map image
                ├── gallery/
                │   └── *.jpg             # Additional photos
                ├── README.md             # Wikipedia-sourced content
                └── wiki-data.json        # Raw Wikipedia data
```

### 4. Data Pipelines (`apps/updaters/`)

Scheduled jobs that keep data fresh.

| Pipeline | Schedule | Source | Updates |
|----------|----------|--------|---------|
| `liftie-sync` | Every 15 min (season) | Liftie API | Lift status, conditions |
| `wikipedia-updater` | Weekly | Wikipedia | Resort descriptions, history |
| `wikidata-enricher` | Weekly | Wikidata | Structured data (elevation, etc.) |
| `weather-sync` | Hourly | Weather API | Current conditions |

### 5. External Integrations

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL DATA SOURCES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    Read-only, no auth required             │
│  │   Liftie    │ ─────────────────────────────────────────► │
│  │   API       │    GET /api/resorts, /api/resort/{id}      │
│  └─────────────┘                                            │
│                                                              │
│  ┌─────────────┐    Read-only, no auth required             │
│  │  Wikipedia  │ ─────────────────────────────────────────► │
│  │  API        │    GET /w/api.php?action=query             │
│  └─────────────┘                                            │
│                                                              │
│  ┌─────────────┐    Read-only, API key required             │
│  │  Weather    │ ─────────────────────────────────────────► │
│  │  API        │    (OpenWeatherMap, WeatherAPI, etc.)      │
│  └─────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flows

### 1. Page Load (Resort Detail)

```
User Request: GET /us/colorado/vail
       │
       ▼
┌──────────────────┐
│ Next.js Server   │
│ Component        │
└────────┬─────────┘
         │ getResortBySlug('vail')
         ▼
┌──────────────────┐
│ Resort Service   │
│ (lib/services)   │
└────────┬─────────┘
         │ Supabase query
         ▼
┌──────────────────┐
│ Supabase         │
│ resorts_full     │
└────────┬─────────┘
         │ Resort data
         ▼
┌──────────────────┐
│ Adapter          │
│ (DB → Frontend)  │
└────────┬─────────┘
         │ Resort type
         ▼
┌──────────────────┐
│ React Component  │
│ (Server render)  │
└────────┬─────────┘
         │ HTML + hydration data
         ▼
┌──────────────────┐
│ Client Browser   │
│ (Hydrated)       │
└──────────────────┘
```

### 2. Map Pin Loading

```
User: Visits homepage
       │
       ▼
┌──────────────────┐
│ useMapPins()     │
│ Hook             │
└────────┬─────────┘
         │ Check localStorage cache (5 min TTL)
         │
    ┌────┴────┐
    │ Cached? │
    └────┬────┘
     Yes │ No
      │  │
      │  ▼
      │ ┌──────────────────┐
      │ │ API: /api/pins   │
      │ └────────┬─────────┘
      │          │
      │          ▼
      │ ┌──────────────────┐
      │ │ Supabase         │
      │ │ resort_map_pins  │
      │ └────────┬─────────┘
      │          │
      │          ▼
      │ ┌──────────────────┐
      │ │ Cache in         │
      │ │ localStorage     │
      │ └────────┬─────────┘
      │          │
      └────┬─────┘
           │
           ▼
┌──────────────────┐
│ ResortMapView    │
│ (Leaflet)        │
└──────────────────┘
```

### 3. Conditions Update Pipeline

```
┌──────────────────┐
│ Scheduled Trigger│
│ (Every 15 min)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ liftie-sync      │
│ Updater          │
└────────┬─────────┘
         │ For each resort with liftie_id
         ▼
┌──────────────────┐
│ Liftie API       │
│ GET /resort/{id} │
└────────┬─────────┘
         │ Lift status, snow data
         ▼
┌──────────────────┐
│ Transform &      │
│ Validate         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Supabase         │
│ UPSERT conditions│
└──────────────────┘
```

## API Boundaries

### Internal APIs (Next.js API Routes)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/resorts` | GET | List resorts (paginated, filterable) |
| `/api/resorts/[slug]` | GET | Single resort by slug |
| `/api/pins` | GET | Lightweight map pin data |
| `/api/search` | GET | Full-text search |
| `/api/conditions/[slug]` | GET | Real-time conditions |

### External APIs Consumed

| Service | Usage | Rate Limits |
|---------|-------|-------------|
| Supabase | All data queries | 500 req/sec (plan dependent) |
| Liftie | Lift status | Unknown (public API) |
| Wikipedia | Content enrichment | 200 req/sec |
| Weather API | Conditions | Plan dependent |
| GCS | Asset serving | Effectively unlimited via CDN |

## Where Logic Belongs

| Logic Type | Location | Rationale |
|------------|----------|-----------|
| Data fetching | `lib/api/`, `lib/services/` | Centralized, reusable |
| Data transformation | `lib/api/*-adapter.ts` | Clean separation |
| UI state | React hooks (`lib/hooks/`) | Colocated with usage |
| Business rules | `lib/services/` | Testable, framework-agnostic |
| Validation | Zod schemas (`lib/types/`) | Runtime + compile-time safety |
| Styling | Tailwind classes in components | Colocation |
| Map rendering | `components/ResortMapView.tsx` | Leaflet-specific |
| SEO | Page-level metadata | Next.js conventions |
| Caching | Hooks + localStorage / React Query | Client-side performance |

## Scalability Considerations

### Current Scale
- ~100 resorts
- ~1K daily users (estimated)
- Single region deployment

### Scale Targets

| Dimension | Current | Target | Strategy |
|-----------|---------|--------|----------|
| Resorts | 100 | 600+ | Database indexing, pagination |
| Users | 1K/day | 100K/day | Edge caching, CDN |
| Conditions updates | 15 min | 5 min | Queue-based processing |
| API requests | 10K/day | 1M/day | Rate limiting, caching |

### Scaling Strategies

1. **Database**
   - Indexes on `slug`, `state_code`, `pass_id`
   - Materialized views for complex queries
   - Read replicas for heavy traffic

2. **Caching**
   - CDN for static pages (1 hour TTL)
   - ISR (Incremental Static Regeneration) for resort pages
   - Client-side caching for map pins

3. **Asset Delivery**
   - GCS + Cloud CDN
   - Image optimization (WebP, responsive sizes)
   - Lazy loading for below-fold images

4. **API**
   - Rate limiting per IP
   - Response caching (60 second TTL)
   - Pagination for list endpoints

## Future-Proofing

### Prepared For

| Future Feature | Current Preparation |
|----------------|---------------------|
| User accounts | Supabase Auth ready, schema extensible |
| Reviews | `reviews` table schema designed |
| Mobile apps | API routes are app-agnostic |
| International | `country_code` field exists, schema supports |
| Real-time | Supabase real-time subscriptions available |
| Search | Full-text search ready in Supabase |

### Technical Debt to Address

| Debt | Impact | Priority |
|------|--------|----------|
| Mock data fallback | Complexity, maintenance | Remove after full migration |
| Inline components | Bundle size | Extract to lazy-loaded |
| Missing error boundaries | UX on failures | Add before launch |
| Limited test coverage | Regression risk | Add critical path tests |

## Security Considerations

| Layer | Protection |
|-------|------------|
| Database | Row-level security (RLS) ready |
| API | Rate limiting, input validation |
| Auth (future) | Supabase Auth with MFA option |
| Secrets | Environment variables, not committed |
| XSS | React's default escaping |
| CSRF | Serverless functions are stateless |
