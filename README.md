# Colorado Ski Directory

> **Discover Colorado's world-class ski resorts with real-time conditions, detailed trail maps, and comprehensive resort information.**

A modern ski resort directory built with Next.js 14, TypeScript, and Tailwind CSS. Designed with the clean simplicity of AllTrails, the search prominence of Airbnb, and the practical directory power of Yelp.

![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Development](#development)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Resort Directory** - Comprehensive Colorado ski resort listings with detailed information
- **Real-time Conditions** - Live snowfall data, base depth, terrain status, and lift counts
- **Weather Forecasts** - Current conditions and 7-day forecasts for each resort
- **Interactive Maps** - Leaflet-powered location maps with resort markers
- **Trail Maps** - High-resolution trail maps for each resort
- **Pass Affiliations** - Epic Pass, Ikon Pass, Indy Pass, and local resort badges
- **Smart Filtering** - Filter by resort, skill level, and travel dates
- **Responsive Design** - Mobile-first approach optimized for on-the-go planning
- **SEO Optimized** - Structured data and metadata for search engine visibility

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cr-nattress/ski-directory-website.git
cd ski-directory-website

# Navigate to the app directory
cd apps/v1

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
state-ski-resort-directory/
├── apps/v1/                    # Next.js application
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Root layout with fonts
│   │   ├── page.tsx            # Landing page
│   │   └── colorado/[slug]/    # Dynamic resort detail pages
│   ├── components/             # React components
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Hero.tsx            # Hero section with search
│   │   ├── ResortCard.tsx      # Resort listing cards
│   │   ├── ResortGrid.tsx      # Resort card grid
│   │   └── resort-detail/      # Resort detail components
│   ├── lib/                    # Utilities and data
│   │   ├── api/                # API service layer
│   │   ├── hooks/              # React hooks
│   │   └── mock-data/          # Resort data and types
│   └── public/images/          # Local resort images
├── CLAUDE.md                   # AI development guide
├── netlify.toml                # Netlify deployment config
└── README.md                   # This file
```

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |
| Maps | Leaflet + React Leaflet |
| Deployment | Netlify |

### Key Patterns

**Data Layer**
- Mock data simulates API responses with configurable latency
- `isActive` flag controls which resorts appear in the UI
- React hooks (`useResorts`, `useAllResorts`, `useRegionalStats`) provide data access

**Component Architecture**
- Server components for static content and SEO
- Client components for interactive features
- Dynamic imports for Leaflet maps (SSR-safe)

**Styling System**
- Custom colors: `ski-blue`, `powder-blue`, `epic-red`, `ikon-orange`
- Fonts: Poppins (headings), Inter (body)
- Mobile-first responsive breakpoints

---

## Data Model

### Resort Schema

```typescript
interface Resort {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  isActive: boolean;

  // Location
  location: { lat: number; lng: number };
  nearestCity: string;
  distanceFromDenver: number;
  driveTimeFromDenver: number;

  // Statistics
  stats: {
    skiableAcres: number;
    liftsCount: number;
    runsCount: number;
    verticalDrop: number;
    baseElevation: number;
    summitElevation: number;
    avgAnnualSnowfall: number;
  };

  // Terrain breakdown (percentages)
  terrain: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };

  // Current conditions
  conditions: {
    snowfall24h: number;
    snowfall72h: number;
    baseDepth: number;
    terrainOpen: number;
    liftsOpen: number;
    status: 'open' | 'closed' | 'opening-soon';
  };

  // Pass affiliations
  passAffiliations: ('epic' | 'ikon' | 'indy' | 'local')[];

  // Media
  images: ResortImage[];
  trailMapUrl: string;

  // Optional
  weather?: WeatherData;
  socialMedia?: SocialLinks;
  features: ResortFeatures;
  tags: string[];
}
```

### Active Resorts

Currently, 3 resorts are active in the directory:

| Resort | Pass | Distance from Denver |
|--------|------|---------------------|
| Vail Ski Resort | Epic | 100 miles |
| Breckenridge Ski Resort | Epic | 85 miles |
| Aspen Snowmass | Ikon | 200 miles |

---

## Development

### Available Scripts

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Adding a New Resort

1. Add resort data to `lib/mock-data/resorts.ts`
2. Set `isActive: true` to display in the UI
3. Add listing image to `public/images/[resort]-listing.jpg`
4. Add trail map to `public/images/[resort]-trailmap.jpg`

### Common Issues

| Issue | Solution |
|-------|----------|
| Leaflet "window is not defined" | Use dynamic import with `ssr: false` |
| Missing weather cards | Check imports in `lib/mock-data/index.ts` |
| Hydration mismatch | Avoid random values that differ server/client |

---

## Deployment

### Netlify

The project is configured for Netlify deployment:

```toml
[build]
  base = "apps/v1"
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Deploy automatically by pushing to the `master` branch.

---

## Roadmap

### Completed

- [x] Next.js 14 App Router setup
- [x] Resort directory with filtering
- [x] Resort detail pages with full information
- [x] Weather forecasts and conditions
- [x] Interactive location maps
- [x] Trail map display
- [x] Social media links
- [x] API service layer with React hooks
- [x] isActive flag for resort visibility
- [x] Local images for listings and trail maps
- [x] Netlify deployment

### Planned

- [ ] Real-time conditions API integration
- [ ] User authentication
- [ ] Reviews and ratings
- [ ] AI-powered resort recommendations
- [ ] Pass optimizer tool
- [ ] Trip planning features

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes with descriptive messages
4. Push to your branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Code Style

- TypeScript for all new code
- Tailwind CSS for styling
- Mobile-first responsive design
- Conventional commit messages

---

## License

This project is proprietary. All rights reserved.

---

## Acknowledgments

- **Design Inspiration** - Airbnb, AllTrails, Yelp
- **Images** - Resort-provided imagery
- **Icons** - [Lucide](https://lucide.dev/)
- **Maps** - [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)

---

**Built for Colorado skiers and snowboarders**
