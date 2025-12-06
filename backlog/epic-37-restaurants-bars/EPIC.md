# Epic 37: Restaurants & Bars Directory

## Overview

Build a comprehensive restaurants and bars discovery feature for ski resorts, modeled after the successful ski shops implementation. This includes an AI-powered enricher service, database infrastructure, API endpoints, and rich UI components with map integration.

## Business Value

- **User Experience**: Help visitors discover dining and nightlife options near resorts
- **Engagement**: Increase time on site and return visits
- **Differentiation**: Provide unique value beyond basic resort info
- **Local Business Support**: Drive traffic to local establishments

## Scope

### In Scope
- Restaurants near ski resorts (within configurable radius)
- Bars, breweries, and nightlife venues
- On-mountain dining options (base lodges, mid-mountain, summit)
- AI-powered data enrichment using OpenAI
- Database schema and Supabase integration
- REST API endpoints
- UI components (cards, lists, filtering, map pins)
- Analytics tracking

### Out of Scope
- Reservations/booking integration
- Menu data
- Real-time wait times
- User reviews (use external links)

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              dining-enricher (Node.js CLI)                   │
│  OpenAI → Parse → Validate → Dedupe → Supabase + GCS        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                         │
│  dining_venues | resort_dining_venues | enrichment_logs     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Next.js API Routes                            │
│  GET /api/resorts/[slug]/dining                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  React Components                            │
│  DiningCard | DiningList | Map Pins | Filters               │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### DiningVenue
```typescript
interface DiningVenue {
  id: string;
  name: string;
  slug: string;
  description: string;

  // Location
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;

  // Contact
  phone: string;
  website_url: string;

  // Classification
  venue_type: VenueType[];  // restaurant, bar, brewery, cafe, food_truck
  cuisine_type: CuisineType[];  // american, italian, mexican, asian, etc.

  // Dining Features
  price_range: PriceRange;  // $, $$, $$$, $$$$
  serves_breakfast: boolean;
  serves_lunch: boolean;
  serves_dinner: boolean;
  serves_drinks: boolean;
  has_full_bar: boolean;

  // Atmosphere
  ambiance: Ambiance[];  // casual, upscale, family, sports_bar, apres_ski
  features: VenueFeature[];  // outdoor_seating, live_music, happy_hour, etc.

  // Ski-specific
  is_on_mountain: boolean;
  mountain_location: MountainLocation;  // base, mid_mountain, summit
  is_ski_in_ski_out: boolean;

  // Hours (optional - may not always have)
  hours_notes: string;

  // Meta
  source: 'openai' | 'manual' | 'google_places';
  verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

type VenueType = 'restaurant' | 'bar' | 'brewery' | 'cafe' | 'food_truck' | 'lodge_dining';
type CuisineType = 'american' | 'italian' | 'mexican' | 'asian' | 'pizza' | 'burgers' |
                   'seafood' | 'steakhouse' | 'bbq' | 'pub_food' | 'fine_dining' | 'deli';
type PriceRange = '$' | '$$' | '$$$' | '$$$$';
type Ambiance = 'casual' | 'upscale' | 'family_friendly' | 'sports_bar' |
                'apres_ski' | 'romantic' | 'lively';
type VenueFeature = 'outdoor_seating' | 'patio' | 'fireplace' | 'live_music' |
                    'happy_hour' | 'late_night' | 'reservations_recommended' |
                    'walk_ins_only' | 'takeout' | 'delivery';
type MountainLocation = 'base' | 'mid_mountain' | 'summit' | 'village' | 'off_mountain';
```

## User Stories

| ID | Story | Priority | Effort |
|----|-------|----------|--------|
| 37.1 | Database schema and migrations | P0 | M |
| 37.2 | TypeScript types for dining venues | P0 | S |
| 37.3 | Dining enricher - core service | P0 | L |
| 37.4 | Dining enricher - OpenAI integration | P0 | L |
| 37.5 | Dining enricher - response parser | P0 | M |
| 37.6 | Dining enricher - deduplication | P0 | M |
| 37.7 | Dining enricher - CLI interface | P0 | M |
| 37.8 | API endpoint - GET dining | P0 | M |
| 37.9 | Frontend types and helpers | P0 | S |
| 37.10 | DiningCard component | P1 | M |
| 37.11 | DiningList component with filters | P1 | L |
| 37.12 | Dining sidebar card | P1 | M |
| 37.13 | Map pins for dining venues | P1 | M |
| 37.14 | Mobile accordion integration | P1 | S |
| 37.15 | Analytics integration | P2 | S |
| 37.16 | Feature flag setup | P2 | S |
| 37.17 | Run initial enrichment | P1 | M |

## Dependencies

- Supabase database access
- OpenAI API key (gpt-4-turbo or gpt-4o)
- Google Cloud Storage bucket
- Leaflet map component (already exists)

## Success Metrics

- 80%+ of active resorts have dining data
- Average 5+ venues per resort
- UI engagement: clicks on phone/directions/website
- Page load time < 2s with dining data

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OpenAI hallucinations | Strict validation, coordinate bounds checking |
| Duplicate venues | Slug-based + fuzzy name matching deduplication |
| Stale data | Re-enrichment capability, manual override support |
| Cost overrun | Token tracking, batch limits, dry-run mode |

## Timeline Estimate

- Database & Types: 1-2 days
- Enricher Service: 3-4 days
- API Endpoint: 1 day
- UI Components: 3-4 days
- Testing & Refinement: 2 days
- Initial Enrichment: 1 day

**Total: ~12-14 days**
