# Ski Resort Directory

**The comprehensive guide to ski resorts across North America**

![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet)

Discover 100+ ski resorts across the United States and Canada. Compare terrain stats, track snow conditions, explore interactive maps, and find your perfect mountain.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Development](#development)
- [Data Sources](#data-sources)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Interactive Map** - Full-screen Leaflet map with color-coded pins by pass type (Epic, Ikon, Indy, Mountain Collective, Powder Alliance, and more)
- **A-Z Directory** - Sortable table comparing all resorts with real-time filtering by state, pass, and status
- **Resort Details** - Comprehensive pages with terrain stats, elevations, trail maps, weather, and nearby amenities
- **Multi-Pass Support** - Epic, Ikon, Indy, Mountain Collective, Powder Alliance, NY SKI3, RCR Rockies, and L'EST GO passes
- **Lost Ski Areas** - Historical data on closed resorts for ski history enthusiasts
- **Distance Calculator** - Drive time and distance from major cities (Denver, Salt Lake City, Seattle, etc.)
- **Responsive Design** - Mobile-first approach optimized for on-the-go planning
- **SEO Optimized** - JSON-LD structured data, sitemaps, and meta tags for rich search results

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/state-ski-resort-directory.git
cd state-ski-resort-directory

# Navigate to the main app
cd apps/v1

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Variables

Add your Supabase credentials to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_USE_SUPABASE=true
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
state-ski-resort-directory/
├── apps/
│   ├── v1/                          # Main Next.js application
│   │   ├── app/                     # App Router pages
│   │   │   ├── page.tsx             # Landing page with hero + map
│   │   │   ├── directory/           # A-Z directory page
│   │   │   ├── ski-links/           # External ski resources
│   │   │   ├── social-links/        # Social media directory
│   │   │   └── [country]/[state]/[slug]/  # Resort detail pages
│   │   ├── components/
│   │   │   ├── ResortMapView.tsx    # Interactive Leaflet map
│   │   │   ├── ResortCard.tsx       # Resort listing cards
│   │   │   ├── directory/           # Directory page components
│   │   │   ├── discovery/           # Homepage discovery sections
│   │   │   └── resort-detail/       # Resort page components
│   │   └── lib/
│   │       ├── api/                 # Supabase service layer
│   │       ├── hooks/               # React data hooks
│   │       ├── scoring/             # Intelligent ranking algorithms
│   │       └── types/               # TypeScript definitions
│   │
│   └── updaters/
│       └── wikipedia-updater/       # Wikipedia data fetcher for GCS
│
├── backlog/                         # Epic/story/task planning docs
├── gcp/                             # Google Cloud configuration
├── migration/                       # Database migration scripts
├── research/                        # Design research & specs
└── schemas/                         # Data schemas
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Components                        │
│                    (React + Next.js 14)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               lib/hooks/ (useMapPins, useResorts, etc.)      │
│                    Cached data fetching                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               lib/api/resort-service.ts                      │
│                  Supabase query layer                        │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────▼─────────┐          ┌─────────────────────┐
    │     Supabase      │          │  Google Cloud       │
    │   PostgreSQL DB   │          │  Storage (Assets)   │
    └───────────────────┘          └─────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Server components, SSR, routing |
| Language | TypeScript 5.3 | Type safety |
| Database | Supabase (PostgreSQL) | Resort data, pass affiliations |
| Assets | Google Cloud Storage | Resort images, trail maps, Wikipedia data |
| Maps | Leaflet + react-leaflet | Interactive resort map |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| Icons | Lucide React | UI iconography |

---

## Data Model

### Resort Schema

```typescript
interface Resort {
  id: string;
  slug: string;
  name: string;
  description: string;
  isActive: boolean;        // Visible in UI
  isLost: boolean;          // Closed/historical resort

  // Geography
  countryCode: string;      // 'us', 'ca'
  stateCode: string;        // 'colorado', 'utah', etc.
  location: { lat: number; lng: number };
  nearestCity: string;
  majorCityName: string;    // Denver, Salt Lake City, etc.
  distanceFromMajorCity: number;  // miles
  driveTimeToMajorCity: number;   // minutes

  // Statistics
  stats: {
    skiableAcres: number;
    liftsCount: number;
    runsCount: number;
    verticalDrop: number;      // feet
    baseElevation: number;     // feet
    summitElevation: number;   // feet
    avgAnnualSnowfall: number; // inches
  };

  // Terrain breakdown (percentages)
  terrain: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };

  // Pass affiliations
  passAffiliations: PassAffiliation[];
  // Includes: epic, ikon, indy, mountain-collective, powder-alliance,
  //           ny-ski3, rcr-rockies, lest-go, local

  // Features
  features: {
    hasPark: boolean;
    hasHalfpipe: boolean;
    hasNightSkiing: boolean;
    hasBackcountryAccess: boolean;
    hasSpaVillage: boolean;
  };

  // Media
  heroImage: string;
  trailMapUrl?: string;
  websiteUrl?: string;
  socialMedia?: SocialLinks;
}
```

### Supported Regions

| Country | States/Provinces |
|---------|------------------|
| United States | Colorado, Utah, California, Vermont, New Hampshire, Maine, New York, Montana, Wyoming, Idaho, Washington, Oregon, New Mexico, Arizona, Michigan, Wisconsin, Minnesota |
| Canada | British Columbia, Alberta, Quebec, Ontario |

---

## Development

### Available Scripts

All commands run from `apps/v1/`:

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Key Patterns

**Dynamic Routing:**
```
/{country}/{state}/{slug}
# Examples:
/us/colorado/vail
/us/utah/park-city
/ca/british-columbia/whistler
```

**Map SSR Safety:**
```tsx
// Always use dynamic import for Leaflet components
const ResortMapView = dynamic(
  () => import('@/components/ResortMapView'),
  { ssr: false }
);
```

**Data Fetching Hooks:**
```tsx
const { pins, isLoading } = useMapPins();        // Map markers
const { resorts } = useResorts({ state: 'colorado' }); // Filtered list
const { resort } = useResort('vail');            // Single resort
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Leaflet "window is not defined" | Use dynamic import with `ssr: false` |
| Resort not showing on map | Check `location` in Supabase (needs lat/lng) |
| Wrong state in URL | `[state]/[slug]` route validates state matches DB |
| Supabase types out of sync | Run `npx supabase gen types typescript` |
| GCS images 404 | Check `asset_path` in Supabase and GCS bucket |

---

## Data Sources

### Supabase Database

Primary data source for all resort information:
- Resort details and statistics
- Pass affiliations
- Location coordinates
- Operating status

### Google Cloud Storage

Asset storage for resort media:
```
gs://sda-assets-prod/resorts/{country}/{state}/{slug}/
├── cards/main.jpg       # Listing card image
├── hero/main.jpg        # Detail page hero
├── trailmaps/current.jpg
├── README.md            # Wikipedia-sourced content
└── wiki-data.json       # Raw Wikipedia data
```

### Wikipedia Updater

Automated tool to fetch supplementary data:

```bash
cd apps/updaters/wikipedia-updater
npm install
npm run dev -- --filter=colorado --limit=10
```

---

## Contributing

We welcome contributions! This project uses an epic-based development workflow.

### Branch Strategy

```bash
# Create a feature branch for each epic
git checkout -b epic-{number}-{description}

# Example
git checkout -b epic-25-grafana-observability
```

### Development Flow

1. Pick an epic from `backlog/`
2. Create a feature branch from `master`
3. Implement changes
4. Submit PR for review
5. Merge to `master` after approval

### Code Style

- TypeScript strict mode enabled
- ESLint + Next.js config
- Tailwind CSS for all styling
- Mobile-first responsive design

---

## License

This project is proprietary. All rights reserved.

---

## Acknowledgments

- **Design Inspiration** - Airbnb, AllTrails, Yelp
- **Maps** - [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
- **Icons** - [Lucide](https://lucide.dev/)
- **Database** - [Supabase](https://supabase.com/)
- **Hosting** - Google Cloud Platform

---

*Find your perfect ski resort across North America.*
