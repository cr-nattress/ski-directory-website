---
title: "Claude Code Instructions"
description: "AI coding assistant context and instructions for the Ski Resort Directory project"
tags:
  - claude-code
  - ai-assistant
  - development
  - instructions
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands must be run from the `apps/v1` directory:

```bash
cd apps/v1

# Development
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Build production bundle
npm start        # Start production server
npm run lint     # Run ESLint

# Clear Next.js cache if needed
rm -rf .next && npm run dev
```

## Architecture Overview

### Data Layer Architecture

The app uses **Supabase as the primary data source** with mock data as fallback:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Components                        │
│                    (use React hooks)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               lib/hooks/ (useMapPins, useViewMode, etc.)     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│           lib/api/resort-service.ts (feature flag router)    │
│           USE_SUPABASE = env.NEXT_PUBLIC_USE_SUPABASE        │
└─────────────┬───────────────────────────────┬───────────────┘
              │                               │
    ┌─────────▼─────────┐          ┌─────────▼─────────┐
    │ supabase-resort-  │          │   mock-data/      │
    │ service.ts        │          │   index.ts        │
    └─────────┬─────────┘          └───────────────────┘
              │
    ┌─────────▼─────────┐
    │ supabase-resort-  │  ← Transforms DB schema to Resort type
    │ adapter.ts        │
    └───────────────────┘
```

**Key files:**
- `lib/supabase.ts` - Supabase client (public + server clients)
- `lib/api/supabase-resort-service.ts` - Supabase queries
- `lib/api/supabase-resort-adapter.ts` - DB → Frontend type conversion
- `lib/services/resort-service.ts` - Server-side data access (for server components)

**Environment variables** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_USE_SUPABASE=true
```

### Next.js App Router Structure

```
app/
├── layout.tsx              # Root layout with fonts (Inter, Poppins)
├── page.tsx                # Landing page with hero, map/cards toggle
├── globals.css             # Tailwind + Leaflet styles
├── directory/page.tsx      # A-Z directory view
├── ski-links/page.tsx      # External ski resources
├── social-links/page.tsx   # Social media directory
└── [state]/[slug]/         # Dynamic resort detail (ALL states)
    └── page.tsx
```

**Routing pattern:**
- Routes are `/{state}/{slug}` (e.g., `/colorado/vail`, `/utah/park-city`)
- `generateStaticParams()` fetches all state+slug pairs from Supabase
- State validation: page returns 404 if URL state doesn't match resort's actual state

### Hooks Layer (`lib/hooks/`)

Client-side data fetching with caching:

| Hook | Purpose |
|------|---------|
| `useMapPins()` | Lightweight map pin data with 5-min localStorage cache |
| `useViewMode()` | Cards/map toggle with localStorage persistence |
| `useResorts(options)` | Paginated resort list with filters |
| `useResort(slug)` | Single resort fetch |
| `useResortSearch(query)` | Full-text search |

### Interactive Map (`ResortMapView`)

Full-screen Leaflet map with resort pins:
- Marker colors by pass type (Epic=red, Ikon=orange, Local=blue, Lost=gray)
- Popups with resort info + "View Details" link
- Centers on North America (44°N, 98°W, zoom 4)

**SSR Safety:** Always use dynamic import:
```tsx
const ResortMapView = dynamic(
  () => import('@/components/ResortMapView').then(mod => ({ default: mod.ResortMapView })),
  { ssr: false }
);
```

### Resort Data Model

**Frontend type** (`lib/mock-data/types.ts`):
```typescript
interface Resort {
  id, slug, name, description,
  stateCode,  // e.g., 'colorado', 'utah' - used for URL routing
  location: { lat, lng },
  nearestCity,
  majorCityName,  // e.g., 'Denver', 'Salt Lake City' - state-specific major city
  distanceFromMajorCity,  // miles
  driveTimeToMajorCity,   // minutes
  stats: { skiableAcres, liftsCount, runsCount, verticalDrop, baseElevation, summitElevation, avgAnnualSnowfall },
  terrain: { beginner, intermediate, advanced, expert },
  conditions: { snowfall24h, snowfall72h, baseDepth, terrainOpen, liftsOpen, status },
  passAffiliations: ('epic' | 'ikon' | 'indy' | 'local')[],
  rating, reviewCount,
  heroImage, trailMapUrl?, images?,
  isActive, isLost,
  features: { hasPark, hasHalfpipe, hasNightSkiing, hasBackcountryAccess, hasSpaVillage },
  tags: string[]
}
```

**Map pin type** (lightweight):
```typescript
interface ResortMapPin {
  id, slug, name,
  latitude, longitude,
  nearestCity, stateCode,
  majorCityName?, distanceFromMajorCity?,
  passAffiliations, rating, status,
  isActive, isLost,
  terrainOpenPercent?, snowfall24h?
}
```

### Major Cities Reference

Each state has a designated major city for distance calculations:

| State | Major City | Notes |
|-------|------------|-------|
| Colorado | Denver | Front Range population center |
| Utah | Salt Lake City | Main airport and population hub |
| California | Los Angeles / San Francisco | Split by region |
| Vermont | Burlington | Largest city, airport |
| Washington | Seattle | Major population center |
| Oregon | Portland | Major population center |

The `major_cities` Supabase table stores coordinates and allows states to have multiple cities (with `is_primary` flag).

### Styling System

**Tailwind custom values:**
- Colors: `ski-blue`, `powder-blue`, `epic-red`, `ikon-orange`
- Fonts: `font-display` (Poppins), `font-sans` (Inter)
- Utility: `cn()` helper in `lib/utils.ts`

### GCS Image Assets

Resort images stored in Google Cloud Storage:
```typescript
// lib/supabase.ts helpers
getCardImageUrl(assetPath)   // → /cards/main.jpg
getHeroImageUrl(assetPath)   // → /hero/main.jpg
getTrailMapUrl(assetPath)    // → /trailmaps/current.jpg
```

**next.config.js** must include `storage.googleapis.com` in `remotePatterns`.

## Common Gotchas

1. **Leaflet "window is not defined"** - Use dynamic import with `ssr: false`

2. **Resort not showing on map** - Check if `location` is null in Supabase (needs lat/lng)

3. **Wrong state in URL** - The `[state]/[slug]` route validates state matches DB; mismatches return 404

4. **Supabase types out of sync** - Regenerate with `npx supabase gen types typescript`

5. **GCS images 404** - Image may not exist; check `asset_path` in Supabase and actual GCS bucket

6. **Hydration mismatch with view toggle** - `useViewMode` has `isHydrated` flag to prevent this

## Adding New Resort Fields

1. Add column to Supabase `resorts` table
2. Update `resorts_full` view if needed
3. Add to `ResortFull` type in `types/supabase.ts`
4. Update `adaptResortFromSupabase()` in `lib/api/supabase-resort-adapter.ts`
5. Add to frontend `Resort` type in `lib/mock-data/types.ts`
6. Use in components

## Repository Structure

- `apps/v1/` - Main Next.js application
- `backlog/` - Epic/story/task planning docs
- `gcp/` - Google Cloud Platform configuration
- `migration/` - Data migration scripts

## Git Workflow

- Main branch: `master`
- **Epic branches:** Every epic MUST be developed on a dedicated branch named `epic-{number}-{short-description}` (e.g., `epic-20-remove-mock-data`)
- **Branch workflow:**
  1. Create new branch from `master` before starting an epic: `git checkout -b epic-{N}-{name}`
  2. All commits for that epic go on the branch
  3. When epic is complete, user will manually merge to `master`
  4. Do NOT auto-merge or push to `master` without explicit user approval
- Commit footer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`
