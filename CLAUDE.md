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

### Data Layer Architecture (CRITICAL)

**The app has TWO data sources - make sure you're using the right one:**

1. **`lib/mock-data/resorts.ts`** - Enhanced data with weather, trail maps, social media
2. **`lib/mock-data/resorts-from-json.ts`** - Basic data from JSON export

**IMPORTANT:** `lib/mock-data/index.ts` controls which source is active:
- Currently imports from `resorts.ts` (enhanced data)
- Previously imported from `resorts-from-json.ts` (caused missing weather cards bug)
- When adding new features to resorts, ALWAYS update `resorts.ts`, not the JSON file

### Next.js App Router Structure

```
app/
├── layout.tsx              # Root layout with fonts (Inter, Poppins)
├── page.tsx                # Landing page with hero, filters, resort grid
├── globals.css             # Tailwind imports + custom styles
└── colorado/
    └── [slug]/
        └── page.tsx        # Dynamic resort detail pages
```

**Key patterns:**
- Uses App Router (not Pages Router)
- Static generation via `generateStaticParams()` for all resort slugs
- SEO metadata generated per-resort via `generateMetadata()`
- Resort data fetched via `getResortBySlug(slug)` from mock-data layer

### Resort Detail Pages

Located in `components/resort-detail/`:

**Main Component:** `ResortDetail.tsx`
- Two-column layout: main content (left) + action rail (right, sticky)
- Left: Overview, Mountain Stats, Terrain Breakdown, Trail Map
- Right: Plan Your Visit card, Weather, Location Map, Social Media

**Enhanced Components:**
- `WeatherForecastCard.tsx` - Current conditions + 7-day forecast with weather icons
- `LocationMapCard.tsx` - Leaflet map with resort marker
- `LocationMapCardWrapper.tsx` - Dynamic import wrapper (prevents SSR issues with Leaflet)
- `TrailMapCard.tsx` - Trail map image with resort stats
- `SocialMediaCard.tsx` - Links to Facebook, Instagram, YouTube, TikTok, X

**Pattern for map components:**
- Leaflet maps must use dynamic imports with `ssr: false`
- Wrapper pattern prevents "window is not defined" errors
- See `LocationMapCardWrapper.tsx` for reference

### Resort Data Model

Every resort in `resorts.ts` has:

```typescript
{
  id, slug, name, tagline, description,
  location: { lat, lng },
  nearestCity, distanceFromDenver, driveTimeFromDenver,
  stats: { skiableAcres, liftsCount, runsCount, verticalDrop, elevations, avgAnnualSnowfall },
  terrain: { beginner, intermediate, advanced, expert }, // percentages
  conditions: { snowfall24h, snowfall72h, baseDepth, terrainOpen, liftsOpen, status },
  passAffiliations: ['epic' | 'ikon' | 'indy' | 'local'],
  rating, reviewCount,
  heroImage, trailMapUrl?,
  weather?: { current, forecast[] }, // Added in enhancement
  socialMedia?: { facebook, instagram, youtube, tiktok, x },
  features: { hasPark, hasHalfpipe, hasNightSkiing, hasBackcountryAccess, hasSpaVillage },
  tags: string[]
}
```

### Styling System

**Tailwind Configuration:**
- Custom colors: `ski-blue`, `powder-blue`, `epic-red`, `ikon-orange`
- Fonts: `font-display` (Poppins for headings), `font-sans` (Inter for body)
- Utility: `clsx` + `tailwind-merge` via `cn()` helper in `lib/utils.ts`

**Responsive Breakpoints:**
- Mobile-first approach
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px

**Design Philosophy:**
- Airbnb: Prominent search, minimal nav, one primary action
- AllTrails: Clean simplicity, scannable info
- Yelp: Practical directory, ratings front-and-center

### Data Utilities (lib/mock-data/index.ts)

```typescript
getResortBySlug(slug)           // Find resort by slug
filterResorts(resorts, filters)  // Filter by search, distance, pass type
sortResorts(resorts, sortBy)     // Sort by distance, rating, snow, name
getRegionalStats()               // Aggregate stats for hero section
```

### Component Patterns

**Conditional Rendering:**
- Weather/Social cards return `null` if no data (not empty divs)
- Use `if (!data) return null;` pattern at component top

**Pass Badges:**
```tsx
{resort.passAffiliations.map((pass) => (
  <span className={pass === 'epic' ? 'bg-epic-red' : 'bg-ikon-orange'}>
    {pass} Pass
  </span>
))}
```

**Terrain Progress Bars:**
- Show percentage with colored bars (green/blue/orange/red)
- Use Tailwind arbitrary values: `style={{ width: \`\${percentage}%\` }}`

## Common Gotchas

1. **Missing weather/social cards?** Check `lib/mock-data/index.ts` imports from `resorts.ts` not `resorts-from-json.ts`

2. **Leaflet "window is not defined" error?** Use dynamic import with `ssr: false`:
   ```tsx
   const MapComponent = dynamic(() => import('./Map'), { ssr: false })
   ```

3. **Hydration mismatch?** Avoid random values that differ between server/client. Use seeded random if needed.

4. **Tailwind classes not applying?** Ensure file is in `content` array in `tailwind.config.ts`

5. **TypeScript errors in resorts.ts?** All weather/social fields are optional (`?:`). Don't forget to add to type definition in `types.ts` first.

## Adding New Resort Features

1. Update `Resort` interface in `lib/mock-data/types.ts`
2. Add data to resorts in `lib/mock-data/resorts.ts` (NOT resorts-from-json.ts)
3. Create component in `components/resort-detail/`
4. Import and use in `ResortDetail.tsx`
5. Make component return `null` if optional data missing

## Repository Structure

- `apps/v1/` - Main Next.js application (work here)
- `backlog/` - Epic/story/task planning docs
- `full-ski-directory-architecture.md` - Overall platform vision
- `ski-directory-data-model.md` - Database schema documentation

## Git Workflow

- Main branch: `master`
- Commit messages use conventional format with AI attribution footer
- Always commit with: `🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`
