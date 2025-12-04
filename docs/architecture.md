---
title: "Architecture Overview"
description: "System design, data flow, and technology stack for the Ski Resort Directory"
tags:
  - architecture
  - nextjs
  - supabase
  - typescript
  - system-design
---

# Architecture Overview

System design and technology stack for the Ski Resort Directory.

## Table of Contents

- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Directory Structure](#directory-structure)
- [Key Patterns](#key-patterns)

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Server components, SSR, routing |
| Language | TypeScript 5.3 | Type safety with strict mode |
| Database | Supabase (PostgreSQL) | Resort data, conditions, passes |
| Assets | Google Cloud Storage | Images, trail maps, Wikipedia content |
| Maps | Leaflet + react-leaflet | Interactive resort map |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| Validation | Zod | API request validation |
| Testing | Vitest | Unit and integration tests |
| Observability | Grafana Cloud | Logging, metrics, dashboards |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
│              (React + Next.js 14 App Router)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  React Hooks Layer                           │
│   useMapPins, useResorts, useResort, useInfiniteResorts     │
│              (localStorage caching, 5-min TTL)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               API Service Layer                              │
│           lib/api/supabase-resort-service.ts                 │
│      (queries, filtering, pagination, conditions)            │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
    ┌─────────▼─────────┐       ┌─────────▼─────────┐
    │     Supabase      │       │  Google Cloud     │
    │   PostgreSQL DB   │       │  Storage (GCS)    │
    │                   │       │                   │
    │ • resorts         │       │ • Hero images     │
    │ • resort_conds    │       │ • Trail maps      │
    │ • pass_affils     │       │ • Wikipedia READMEs│
    │ • major_cities    │       │ • Wiki JSON data  │
    └───────────────────┘       └───────────────────┘
```

## Data Flow

### Page Load Flow

```
1. Browser requests /{country}/{state}/{slug}
   │
2. Next.js Server Component
   │ ├── generateStaticParams() → Pre-render all routes
   │ └── getResortBySlug() → Fetch from Supabase
   │
3. Supabase Query
   │ └── resorts_full view → JOIN resorts + conditions
   │
4. Data Adapter
   │ └── adaptResortFromSupabase() → Transform to Resort type
   │
5. Render Page
   └── ResortDetail + cards + map
```

### Map Pin Flow

```
1. Landing page mounts
   │
2. useMapPins() hook
   │ ├── Check localStorage cache (5-min TTL)
   │ └── If stale: fetch from Supabase
   │
3. Supabase Query
   │ └── resorts_map_pins view → Lightweight pin data
   │
4. ResortMapView renders
   └── Leaflet markers with popups
```

### Real-time Conditions Flow

```
1. Liftie.info API (external)
   │
2. liftie-sync updater (scheduled)
   │ ├── Fetch lift/weather/webcam data
   │ └── Write to resort_conditions table
   │
3. Frontend fetches conditions
   │ └── /api/resorts/[slug]/conditions
   │
4. ConditionsPanel displays
   └── Lift status, weather, webcams
```

## Directory Structure

### Application (`apps/v1/`)

```
apps/v1/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing page
│   ├── directory/                # A-Z directory
│   ├── ski-links/                # External resources
│   ├── social-links/             # Social media directory
│   ├── [country]/[state]/[slug]/ # Resort detail pages
│   └── api/                      # API routes
│       ├── engagement/           # Analytics tracking
│       └── resorts/[slug]/       # Resort conditions
│
├── components/
│   ├── ResortMapView.tsx         # Interactive Leaflet map
│   ├── ResortCard.tsx            # Resort listing card
│   ├── directory/                # Directory components
│   ├── discovery/                # Homepage sections
│   └── resort-detail/            # Detail page cards
│
└── lib/
    ├── api/                      # Supabase services
    │   ├── supabase-resort-service.ts
    │   └── supabase-resort-adapter.ts
    ├── hooks/                    # React data hooks
    ├── types/                    # TypeScript definitions
    ├── validation/               # Zod schemas
    ├── middleware/               # Rate limiting
    └── logging/                  # Grafana logging
```

### Data Updaters (`apps/updaters/`)

```
apps/updaters/
├── liftie-sync/          # Real-time lift/weather sync
├── wikipedia-updater/    # Wikipedia content fetcher
└── wikidata-enricher/    # Metadata enrichment
```

## Key Patterns

### Dynamic Routing

Routes follow `/{country}/{state}/{slug}` pattern:

```
/us/colorado/vail
/us/utah/park-city
/ca/british-columbia/whistler
```

### SSR Safety for Leaflet

Always use dynamic import with `ssr: false`:

```tsx
const ResortMapView = dynamic(
  () => import('@/components/ResortMapView'),
  { ssr: false }
);
```

### Data Fetching with Hooks

```tsx
// Map markers (cached)
const { pins, isLoading } = useMapPins();

// Filtered resort list
const { resorts } = useResorts({ state: 'colorado' });

// Single resort
const { resort } = useResort('vail');

// Infinite scroll
const { resorts, loadMore, hasMore } = useInfiniteResorts();
```

### Type Transformation

Database types are transformed to frontend types via adapter:

```tsx
// Supabase returns snake_case
const dbResort: ResortFull = await supabase.from('resorts_full')...

// Adapter converts to camelCase
const resort: Resort = adaptResortFromSupabase(dbResort);
```

## Related

- [Development Guide](./development.md) - Setup and commands
- [Data Model](./data-model.md) - Schema details
- [API Reference](./api-reference.md) - Service methods
