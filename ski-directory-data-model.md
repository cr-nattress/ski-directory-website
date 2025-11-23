# Ski Directory Data Model & Aggregate Root

## 1. Purpose & Design Goals

This document defines the core data model for the ski directory platform.

The goals:

- Represent **regions, subregions, and resorts** with a single consistent **Aggregate Root** model.
- Support **progressive AI use cases**:
  - Intent-specific summaries
  - Resort/pas optimizers
  - Trip planners and itinerary builders
  - Condition, crowd, and operations forecasting
  - Embedded AI apps per region/resort
- Support **short‑term rentals and lodging** at multiple levels:
  - Individual units (STRs, hotels, condos, cabins)
  - Deep links to Airbnb/VRBO/direct booking
  - Region/resort‑level lodging search links
- Provide a foundation for future apps/tools (Resort Selector, Pass Optimizer, Lodging Finder, Map Browser, etc.).


---

## 2. Aggregate Root Concept

The **Aggregate Root** is a generic ski entity that can represent:

- A **region** (e.g., Colorado)
- A **subregion** (e.g., Summit County)
- A **resort** (e.g., Vail Ski Resort)

All aggregates share the same core structure and can have:

- Geo and stats
- Snow & weather data
- Lift & trail structures
- Maps (winter/summer/backcountry/town/etc.)
- Events
- Content (articles, FAQs, editorial)
- User‑generated content (reviews, snow/crowd reports, photos)
- Linked places (shops, après, lodging, guide services)
- Lodging links (deep links and curated units)
- AI/LLM metadata and embedded app definitions

### 2.1 Aggregate Table

```sql
create table aggregates (
  id            text primary key,        -- "region:colorado", "subregion:summit", "resort:vail"
  level         text not null,           -- 'region' | 'subregion' | 'resort'
  type          text not null,           -- 'ski_region' | 'ski_subregion' | 'ski_resort'
  slug          text not null,           -- "colorado", "summit-county", "vail"
  name          text not null,           -- "Colorado", "Summit County", "Vail Ski Resort"
  parent_id     text references aggregates(id),

  -- Core identity & codes (description, region codes, passes, nearest town, etc.)
  core          jsonb not null default '{}'::jsonb,

  -- Geospatial data (lat/lng, bounds, elevation, etc.)
  geo           jsonb not null default '{}'::jsonb,

  -- Aggregated stats (runs_count, lifts_count, total_skiable_acres, etc.)
  stats         jsonb not null default '{}'::jsonb,

  -- External IDs in other systems (OnTheSnow, SkiResort.info, OpenSnow, etc.)
  external_ids  jsonb not null default '{}'::jsonb,

  -- AI & SEO helpers (cached summaries, embeddings, FAQ seeds, etc.)
  ai_meta       jsonb not null default '{}'::jsonb,

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

### 2.2 TypeScript Model (SkiAggregate)

```ts
export type AggregateLevel = "region" | "subregion" | "resort";

export interface SkiAggregate {
  id: string;             // "region:colorado", "resort:vail"
  level: AggregateLevel;
  type: "ski_region" | "ski_subregion" | "ski_resort";
  slug: string;
  name: string;
  parentId: string | null;

  core: {
    description?: string;
    regionCode?: string;         // e.g., "CO"
    countryCode?: string;        // e.g., "US"
    nearestTown?: string;
    passAffiliations?: string[]; // ['epic', 'ikon', 'indy', 'local']
    sizeCategory?: "mega" | "large" | "mid" | "small" | "community";
  };

  geo: {
    location?: { lat: number; lng: number };
    bounds?: {
      north: number; south: number; east: number; west: number;
    };
    elevation?: {
      base_m?: number;
      summit_m?: number;
      vertical_drop_m?: number;
    };
    mountainRange?: string;
  };

  stats: {
    resortsCount?: number;          // for region
    liftsCount?: number;
    runsCount?: number;
    skiableAcres?: number;
    xcKm?: number;
    avgAnnualSnowCm?: number;
  };

  externalIds: Record<string, string>;  // e.g. { "onthesnow": "1234", "skiresort_info": "5678" }

  aiMeta: {
    // Cached embeddings or vector keys for AI retrieval
    embeddingKey?: string;
    // Pre-generated summaries by intent (beginner/family/expert/budget/etc.)
    summaries?: Record<string, string>;
    // System tags used by AI agents (e.g., vibe/style)
    tags?: string[];
  };
}
```


### 2.3 Example: Region Aggregate (Colorado)

```json
{
  "id": "region:colorado",
  "level": "region",
  "type": "ski_region",
  "slug": "colorado",
  "name": "Colorado",
  "parentId": null,
  "core": {
    "description": "Colorado ski region including I-70 mega resorts, front range ski areas, and southern gems.",
    "regionCode": "CO",
    "countryCode": "US",
    "sizeCategory": "mega"
  },
  "geo": {
    "bounds": { "north": 41.0, "south": 37.0, "east": -102.0, "west": -109.1 },
    "location": { "lat": 39.0, "lng": -105.5 }
  },
  "stats": {
    "resortsCount": 30,
    "liftsCount": 200,
    "skiableAcres": 35000
  },
  "externalIds": {},
  "aiMeta": {
    "tags": ["rockies", "destination_region", "continental_snowpack"]
  }
}
```

### 2.4 Example: Resort Aggregate (Vail)

```json
{
  "id": "resort:vail",
  "level": "resort",
  "type": "ski_resort",
  "slug": "vail",
  "name": "Vail Ski Resort",
  "parentId": "region:colorado",
  "core": {
    "description": "Large Colorado resort famous for its Back Bowls, upscale village, and extensive terrain.",
    "regionCode": "CO",
    "countryCode": "US",
    "nearestTown": "Vail, CO",
    "passAffiliations": ["epic"],
    "sizeCategory": "mega"
  },
  "geo": {
    "location": { "lat": 39.6061, "lng": -106.3550 },
    "elevation": {
      "base_m": 2475,
      "summit_m": 3527,
      "vertical_drop_m": 1052
    }
  },
  "stats": {
    "liftsCount": 31,
    "runsCount": 195,
    "skiableAcres": 5289,
    "avgAnnualSnowCm": 900
  },
  "externalIds": {
    "onthesnow": "vail-co-123",
    "skiresort_info": "vail-mountain-456"
  },
  "aiMeta": {
    "tags": ["destination", "bowls", "upscale", "epic_pass"]
  }
}
```


---

## 3. Static Structures: Lifts, Trails, Maps

These attach to the `aggregates` table via `aggregate_id`.

### 3.1 Lifts

```sql
create table lifts (
  id                 text primary key,
  aggregate_id       text not null references aggregates(id),
  name               text,
  code               text,
  lift_type          text,              -- gondola, tram, hs_quad, fixed_grip, tbar, carpet, etc.
  status_static      text,              -- 'permanent'|'seasonal'
  manufacturer       text,
  year_built         int,
  capacity_per_hour  int,
  length_m           int,
  top_elevation_m    int,
  bottom_elevation_m int,
  metadata           jsonb default '{}'::jsonb
);
```

### 3.2 Trails

```sql
create table trails (
  id                 text primary key,
  aggregate_id       text not null references aggregates(id),
  name               text,
  difficulty         text,             -- 'green'|'blue'|'black'|'double_black'
  is_gladed          boolean,
  is_mogul           boolean,
  is_park_feature    boolean,
  length_m           int,
  vertical_drop_m    int,
  metadata           jsonb default '{}'::jsonb
);
```

### 3.3 Map Resources (winter, summer, backcountry, town, etc.)

```sql
create table map_resources (
  id               text primary key,
  aggregate_id     text not null references aggregates(id),
  map_type         text not null,      -- 'winter_trail'|'summer_trail'|'xc_trail'|'backcountry'|'town'|'transport'|'bike'
  season           text,               -- '2024-2025', 'summer-2025'
  title            text,
  description      text,
  source_type      text,               -- 'official'|'scraped'|'open_data'|'user_submitted'
  source_provider  text,
  source_url       text,
  file_pdf_url     text,
  file_image_url   text,
  bounds           jsonb,
  license_kind     text,
  license_notes    text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
```


---

## 4. Time‑Varying Data: Snow, Ops, Pricing

These tables support historical & real‑time analytics, AI forecasting, and condition summaries.

### 4.1 Snow & Weather History

```sql
create table snow_conditions (
  id                  bigserial primary key,
  aggregate_id        text not null references aggregates(id),
  observed_at         timestamptz not null,
  source              text not null,          -- 'resort_api'|'noaa'|'opensnow'|...

  snowfall_24h_cm     numeric,
  snowfall_72h_cm     numeric,
  base_depth_cm       numeric,
  season_total_cm     numeric,
  surface_condition   text,                  -- powder, packed powder, ice, etc.

  temperature_c       numeric,
  wind_speed_kph      numeric,
  raw                 jsonb default '{}'::jsonb
);
```

### 4.2 Lift & Trail Operational Status

```sql
create table lift_status (
  id             bigserial primary key,
  lift_id        text not null references lifts(id),
  reported_at    timestamptz not null,
  status         text not null,              -- 'open'|'closed'|'hold'|'wind_hold'|'scheduled'
  reason         text,
  raw            jsonb default '{}'::jsonb
);

create table trail_status (
  id             bigserial primary key,
  trail_id       text not null references trails(id),
  reported_at    timestamptz not null,
  status         text not null,              -- 'open'|'closed'|'groomed'|'icy'|'thin_coverage'
  grooming       text,                       -- 'groomed'|'moguls'|...
  raw            jsonb default '{}'::jsonb
);
```

### 4.3 Ticket Products & Daily Prices

```sql
create table ticket_products (
  id               text primary key,
  aggregate_id     text not null references aggregates(id),
  product_type     text not null,            -- 'day_ticket'|'half_day'|'night'|'season_pass'
  name             text,
  description      text,
  age_group        text,                     -- 'adult'|'child'|'senior'
  metadata         jsonb default '{}'::jsonb
);

create table ticket_prices (
  id               bigserial primary key,
  ticket_product_id text not null references ticket_products(id),
  valid_date       date not null,
  source           text not null,            -- 'official'|'scraped'|'partner'
  price_currency   text not null,            -- 'USD'
  price_amount     numeric not null,
  dynamic_pricing  boolean default false,
  raw              jsonb default '{}'::jsonb
);
```


---

## 5. User‑Generated Content (UGC)

These tables let users contribute reviews, snow reports, crowd reports, and photos.

### 5.1 Reviews

```sql
create table user_reviews (
  id                    bigserial primary key,
  aggregate_id          text not null references aggregates(id),
  user_id               uuid,
  created_at            timestamptz default now(),

  rating_overall        int check (rating_overall between 1 and 5),
  rating_snow           int,
  rating_lifts          int,
  rating_value          int,
  rating_family_friendly int,

  visit_date            date,
  title                 text,
  body                  text,
  metadata              jsonb default '{}'::jsonb
);
```

### 5.2 Snow & Crowd Reports

```sql
create table user_snow_reports (
  id                 bigserial primary key,
  aggregate_id       text not null references aggregates(id),
  user_id            uuid,
  reported_at        timestamptz default now(),

  snowfall_cm        numeric,
  surface_condition  text,                  -- powder, packed powder, icy, slushy...
  crowd_level        text,                  -- empty, moderate, busy, insane
  wait_time_lifts_minutes int,
  visibility         text,                  -- good, fair, poor
  notes              text,
  metadata           jsonb default '{}'::jsonb
);
```

### 5.3 User Photos

```sql
create table user_photos (
  id                 bigserial primary key,
  aggregate_id       text not null references aggregates(id),
  user_id            uuid,
  uploaded_at        timestamptz default now(),
  image_url          text not null,
  caption            text,
  category           text,                  -- 'powder'|'park'|'village'|'lift'|...
  metadata           jsonb default '{}'::jsonb
);
```


---

## 6. Content & Editorial: Articles, Rankings, Guides

Supports SEO content, “best of” lists, and editorial guides.

### 6.1 Articles

```sql
create table articles (
  id               text primary key,
  slug             text not null unique,
  title            text not null,
  body_markdown    text not null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  published_at     timestamptz,
  author           text,
  seo              jsonb default '{}'::jsonb
);
```

Link articles to aggregates:

```sql
create table article_aggregates (
  article_id   text references articles(id) on delete cascade,
  aggregate_id text references aggregates(id) on delete cascade,
  role         text,                        -- 'primary'|'mentioned'|'region_focus'
  primary key (article_id, aggregate_id)
);
```

### 6.2 Rankings / Lists

```sql
create table rankings (
  id               text primary key,
  slug             text not null unique,
  title            text not null,
  description      text,
  created_at       timestamptz default now(),
  ranking_type     text,                    -- 'editorial'|'algorithmic'
  criteria         jsonb default '{}'::jsonb
);

create table ranking_items (
  ranking_id       text references rankings(id) on delete cascade,
  aggregate_id     text references aggregates(id) on delete cascade,
  rank_position    int not null,
  score            numeric,
  notes            text,
  primary key (ranking_id, aggregate_id)
);
```


---

## 7. Events (Region & Resort Level)

Events attach to any aggregate (region, subregion, or resort).

```sql
create table events (
  id               text primary key,
  aggregate_id     text not null references aggregates(id),
  title            text not null,
  description      text,
  category         text,                    -- 'race'|'festival'|'concert'|'demo_day'|'avalanche_class'|'kids'
  start_at         timestamptz,
  end_at           timestamptz,
  all_day          boolean default false,
  location         jsonb,                   -- venue details
  external_url     text,
  metadata         jsonb default '{}'::jsonb
);
```


---

## 8. Places Around Resorts: Shops, Après, Lodging, Guides

Short‑term rentals and lodging are implemented as `places` with a lodging subtype.

### 8.1 Places

```sql
create table places (
  id               text primary key,
  place_type       text not null,           -- 'shop'|'apres'|'restaurant'|'lodging_hotel'|'lodging_str'|'lodging_condo'|'lodging_bnb'|'lodging_cabin'|'guide_service'|'xc_center'
  slug             text not null unique,
  name             text not null,
  description      text,
  address          jsonb,
  geo              jsonb,
  contact          jsonb,                   -- phone, email, website, social
  tags             text[],
  lodging_details  jsonb default '{}'::jsonb, -- STR/hotel specific metadata (beds, baths, ski-in/out, etc.)
  metadata         jsonb default '{}'::jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
```

### 8.2 Link Places to Aggregates (Resorts/Regions/Towns)

```sql
create table place_aggregates (
  place_id       text references places(id) on delete cascade,
  aggregate_id   text references aggregates(id) on delete cascade,
  relationship   text,                      -- 'nearby'|'base_area'|'town_center'
  distance_km    numeric,
  primary key (place_id, aggregate_id)
);
```

### 8.3 Lodging Channels (Airbnb, VRBO, Direct, etc.)

```sql
create table lodging_channels (
  id             bigserial primary key,
  place_id       text not null references places(id) on delete cascade,
  channel_type   text not null,            -- 'airbnb'|'vrbo'|'booking'|'direct'|'other'
  label          text,                     -- 'Airbnb listing'|'VRBO listing'|'Owner site'
  url            text not null,
  affiliate_tag  text,
  is_primary     boolean default false,
  metadata       jsonb default '{}'::jsonb
);
```

### 8.4 Aggregate‑Level Lodging Links (Search Deep Links)

```sql
create table aggregate_lodging_links (
  id             bigserial primary key,
  aggregate_id   text not null references aggregates(id),
  channel_type   text not null,            -- 'airbnb_search'|'vrbo_search'|'direct_portal'
  label          text not null,            -- 'View Airbnb listings near Vail'
  url            text not null,
  metadata       jsonb default '{}'::jsonb
);
```

This combination supports:

- Individual STRs/hotels with detailed lodging metadata.
- Deep links to Airbnb/VRBO/booking for a given resort or region.
- Progressive enhancement toward full lodging meta‑search and trip planning.


---

## 9. Apps / Tools Registry (Embedded Applications)

Apps are small applications that can be:

- Full pages under `/apps/*`
- Embedded in dashboards, region pages, or resort pages
- User‑facing tools (Resort Selector, Pass Optimizer, Lodging Finder, Map Browser)
- Infrastructure/admin tools (Data Health, Ingestion Monitor)

```sql
create table apps (
  id                    text primary key,
  slug                  text not null unique,
  name                  text not null,
  description           text,
  type                  text not null,       -- 'user-facing'|'infrastructure'
  status                text not null,       -- 'active'|'beta'|'deprecated'
  entry_url             text not null,       -- '/apps/resort-selector'
  embed_type            text not null,       -- 'component'|'iframe'
  visibility            text not null,       -- 'public'|'admin'
  requires_auth         boolean default false,

  -- e.g., { "needs_region": true, "needs_resort": false, "needs_dates": false }
  context_requirements  jsonb default '{}'::jsonb,

  -- Placement hints for embedding (dashboard, region page, resort page, slot names)
  placements            jsonb default '[]'::jsonb,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
```

This registry allows:

- Discoverable, structured app metadata for AI tools and devs.
- Dynamic embedding based on page context (aggregate level, region/resort, admin/user).
- A consistent way to add new tools without restructuring the core site.


---

## 10. External API Catalog (Developer Hub)

To act as a central hub for ski data APIs (including third‑party providers):

```sql
create table external_apis (
  id               text primary key,
  name             text not null,
  slug             text not null unique,
  provider         text,
  description      text,
  api_base_url     text,
  docs_url         text,
  coverage         text,                    -- 'global'|'north_america'|'europe'|'colorado_only'|...
  categories       text[],                  -- 'snow'|'forecast'|'maps'|'passes'|'prices'|'trail_maps'
  requires_api_key boolean,
  pricing_model    text,                    -- 'free'|'freemium'|'paid'
  metadata         jsonb default '{}'::jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
```


---

## 11. AI & LLM Friendliness

The model is intentionally designed to be AI‑friendly:

- **Single Aggregate Root** for region/subregion/resort makes it easy to:
  - Build a **universal ski knowledge graph**
  - Run AI summarization and comparison at any level
- **Time series tables** (snow, ops, prices) enable:
  - Forecasting models
  - Crowd and condition predictions
- **Structured maps** via `map_resources` enable:
  - AI trail map navigation
  - Route planning for beginners/intermediates/experts
- **Lodging model** with channels allows:
  - Trip‑cost estimators
  - Lodging recommenders
  - Pass vs lodging tradeoff tools
- **Apps registry** and **external API catalog**:
  - Allow LLM agents and devs to discover tools and endpoints
  - Enable embedded resort/region‑specific AI assistants

This schema should cover everything done by existing top ski aggregators, plus support progressive AI applications and short‑term rental integrations without needing structural changes later.
