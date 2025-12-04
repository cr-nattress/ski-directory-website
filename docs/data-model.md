---
title: "Data Model"
description: "Resort schema, TypeScript types, and database structure for the Ski Resort Directory"
tags:
  - data-model
  - typescript
  - supabase
  - schema
  - database
---

# Data Model

Resort schema, TypeScript types, and database structure.

## Table of Contents

- [Resort Type](#resort-type)
- [Map Pin Type](#map-pin-type)
- [Conditions Type](#conditions-type)
- [Database Tables](#database-tables)
- [Pass Affiliations](#pass-affiliations)
- [Geographic Coverage](#geographic-coverage)

## Resort Type

The main resort interface used throughout the application:

```typescript
interface Resort {
  // Identity
  id: string;
  slug: string;
  name: string;
  description: string;

  // Status
  isActive: boolean;      // Visible in UI
  isLost: boolean;        // Closed/historical resort

  // Geography
  countryCode: string;    // 'us', 'ca'
  stateCode: string;      // 'colorado', 'utah', etc.
  location: {
    lat: number;
    lng: number;
  };
  nearestCity: string;
  majorCityName: string;           // Denver, Salt Lake City, etc.
  distanceFromMajorCity: number;   // miles
  driveTimeToMajorCity: number;    // minutes

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

  // Terrain breakdown (percentages, sum to 100)
  terrain: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };

  // Conditions (real-time from Liftie)
  conditions: {
    snowfall24h: number;
    snowfall72h: number;
    baseDepth: number;
    terrainOpen: number;  // percentage
    liftsOpen: number;    // count
    status: 'open' | 'closed' | 'opening-soon';
  };

  // Pass affiliations
  passAffiliations: PassAffiliation[];

  // Ratings
  rating: number;      // 1-5
  reviewCount: number;

  // Media
  heroImage: string;
  trailMapUrl?: string;
  websiteUrl?: string;
  images?: ResortImage[];
  socialMedia?: SocialLinks;

  // Features
  features: {
    hasPark: boolean;
    hasHalfpipe: boolean;
    hasNightSkiing: boolean;
    hasBackcountryAccess: boolean;
    hasSpaVillage: boolean;
  };

  // Tags for filtering
  tags: string[];
}
```

## Map Pin Type

Lightweight type for map markers (faster loading):

```typescript
interface ResortMapPin {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  nearestCity: string;
  stateCode: string;
  countryCode: string;
  majorCityName?: string;
  distanceFromMajorCity?: number;
  passAffiliations: PassAffiliation[];
  rating: number;
  status: 'open' | 'closed' | 'opening-soon';
  isActive: boolean;
  isLost: boolean;
  terrainOpenPercent?: number;
  snowfall24h?: number;

  // From conditions (optional)
  liftsOpen?: number;
  liftsTotal?: number;
  liftsPercentage?: number;
  weatherCondition?: string;
  weatherHigh?: number;
}
```

## Conditions Type

Real-time conditions from Liftie sync:

```typescript
interface ResortConditions {
  resort_id: string;

  // Lift status
  lifts_open: number;
  lifts_total: number;
  lifts_percentage: number;
  lifts_status: Record<string, string>;  // lift name → status

  // Weather
  weather_high: number;        // °F
  weather_condition: string;   // "Sunny", "Snow", etc.
  weather_text: string;        // Full NOAA forecast
  weather_icon: string[];      // Icon classes

  // Webcams
  webcams: Webcam[];
  has_webcams: boolean;
  has_lifts: boolean;
  has_weather: boolean;

  // Timestamps
  source_timestamp: string;  // When Liftie collected
  updated_at: string;        // When we synced
}

interface Webcam {
  name: string;
  image: string;     // Current frame URL
  stream?: string;   // Live stream URL
}
```

## Database Tables

### `resorts` Table

Primary resort data:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `slug` | TEXT | URL-safe identifier |
| `name` | TEXT | Display name |
| `description` | TEXT | Resort description |
| `country_code` | TEXT | 'us' or 'ca' |
| `state` | TEXT | State/province slug |
| `latitude` | NUMERIC | Location latitude |
| `longitude` | NUMERIC | Location longitude |
| `nearest_city` | TEXT | Nearby city name |
| `stats` | JSONB | Terrain statistics |
| `terrain` | JSONB | Difficulty breakdown |
| `pass_affiliations` | TEXT[] | Pass types array |
| `is_active` | BOOLEAN | Visible in directory |
| `is_lost` | BOOLEAN | Historical/closed |
| `is_open` | BOOLEAN | Currently operating |
| `asset_path` | TEXT | GCS asset folder |

### `resort_conditions` Table

Real-time conditions from Liftie:

| Column | Type | Description |
|--------|------|-------------|
| `resort_id` | TEXT | Foreign key to resorts |
| `lifts_open` | INTEGER | Lifts currently open |
| `lifts_total` | INTEGER | Total lift count |
| `lifts_percentage` | NUMERIC | Percentage open |
| `lifts_status` | JSONB | Individual lift states |
| `weather_high` | INTEGER | Forecasted high °F |
| `weather_condition` | TEXT | Condition summary |
| `webcams` | JSONB | Webcam array |
| `updated_at` | TIMESTAMPTZ | Last sync time |

### `major_cities` Table

Reference cities for distance calculations:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | City name |
| `state` | TEXT | State slug |
| `country_code` | TEXT | Country code |
| `latitude` | NUMERIC | City latitude |
| `longitude` | NUMERIC | City longitude |
| `is_primary` | BOOLEAN | Default city for state |

### Database Views

| View | Purpose |
|------|---------|
| `resorts_full` | JOINs resorts with all related data |
| `resorts_map_pins` | Lightweight view for map markers |

## Pass Affiliations

Supported ski pass types:

| Pass | Code | Color (Map) |
|------|------|-------------|
| Epic Pass | `epic` | Red |
| Ikon Pass | `ikon` | Orange |
| Indy Pass | `indy` | Green |
| Mountain Collective | `mountain-collective` | Purple |
| Powder Alliance | `powder-alliance` | Teal |
| NY SKI3 | `ny-ski3` | Blue |
| RCR Rockies | `rcr-rockies` | Brown |
| L'EST GO | `lest-go` | Pink |
| Local/Independent | `local` | Blue |

```typescript
type PassAffiliation =
  | 'epic'
  | 'ikon'
  | 'indy'
  | 'mountain-collective'
  | 'powder-alliance'
  | 'ny-ski3'
  | 'rcr-rockies'
  | 'lest-go'
  | 'local';
```

## Geographic Coverage

### United States (17 states)

| State | Major City | Resort Count |
|-------|------------|--------------|
| Colorado | Denver | 76 |
| Utah | Salt Lake City | 34 |
| California | Los Angeles / SF | 52 |
| Vermont | Burlington | 42 |
| Montana | Bozeman | 24 |
| Wyoming | Jackson | 14 |
| Idaho | Boise | 23 |
| Washington | Seattle | 26 |
| Oregon | Portland | 19 |
| New Mexico | Albuquerque | 15 |
| New Hampshire | Manchester | 32 |
| Maine | Portland | 28 |
| New York | Albany | 48 |
| Michigan | Detroit | 33 |
| Wisconsin | Milwaukee | 28 |
| Minnesota | Minneapolis | 24 |
| Arizona | Phoenix | 5 |

### Canada (4 provinces)

| Province | Major City | Resort Count |
|----------|------------|--------------|
| British Columbia | Vancouver | 42 |
| Alberta | Calgary | 23 |
| Quebec | Montreal | 65 |
| Ontario | Toronto | 48 |

## Related

- [Architecture](./architecture.md) - System design
- [API Reference](./api-reference.md) - Service methods
- [Development Guide](./development.md) - Setup and patterns
