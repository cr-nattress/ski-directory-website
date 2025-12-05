# Ski Shop Enricher - Implementation Plan

## Overview

This updater application uses OpenAI to discover and catalog ski shops within a configurable radius of each ski resort in our database. The enriched data enables users to find nearby ski shops for rentals, gear purchases, and services when planning their ski trips.

## Goals

1. **Discover ski shops** near each resort using OpenAI's knowledge
2. **Store structured data** in Supabase for each ski shop
3. **Associate shops with resorts** via a junction table
4. **Enable UI features** like "Nearby Ski Shops" lists and map markers

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Ski Shop Enricher App                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   Supabase   │───▶│   Enricher   │───▶│     OpenAI       │   │
│  │   (resorts)  │    │    Engine    │    │   GPT-4 Turbo    │   │
│  └──────────────┘    └──────────────┘    └──────────────────┘   │
│         │                   │                     │              │
│         │                   ▼                     │              │
│         │           ┌──────────────┐              │              │
│         │           │   Response   │◀─────────────┘              │
│         │           │   Parser     │                             │
│         │           └──────────────┘                             │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Supabase                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │  ski_shops  │  │resort_shops │  │ enrichment_logs  │  │   │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Table: `ski_shops`

Stores individual ski shop information.

```sql
CREATE TABLE ski_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326), -- PostGIS point for distance queries
  phone VARCHAR(50),
  website_url VARCHAR(500),
  email VARCHAR(255),

  -- Business details
  shop_type VARCHAR(50)[], -- ['rental', 'retail', 'repair', 'demo']
  services TEXT[], -- ['ski_rental', 'snowboard_rental', 'boot_fitting', 'tuning', 'waxing', 'repairs']
  brands TEXT[], -- Major brands carried

  -- Hours (JSON for flexibility)
  hours JSONB, -- {"monday": {"open": "09:00", "close": "18:00"}, ...}

  -- Metadata
  source VARCHAR(50) DEFAULT 'openai', -- 'openai', 'manual', 'google_places'
  verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_enriched_at TIMESTAMPTZ
);

-- Create PostGIS location from lat/lng
CREATE OR REPLACE FUNCTION update_ski_shop_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ski_shop_location_trigger
BEFORE INSERT OR UPDATE ON ski_shops
FOR EACH ROW EXECUTE FUNCTION update_ski_shop_location();

-- Indexes
CREATE INDEX idx_ski_shops_location ON ski_shops USING GIST(location);
CREATE INDEX idx_ski_shops_slug ON ski_shops(slug);
CREATE INDEX idx_ski_shops_state ON ski_shops(state);
CREATE INDEX idx_ski_shops_active ON ski_shops(is_active);
```

### Table: `resort_ski_shops`

Junction table linking resorts to nearby ski shops with distance.

```sql
CREATE TABLE resort_ski_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  ski_shop_id UUID NOT NULL REFERENCES ski_shops(id) ON DELETE CASCADE,

  -- Relationship metadata
  distance_miles DECIMAL(6, 2), -- Calculated distance from resort
  drive_time_minutes INTEGER, -- Estimated drive time
  is_on_mountain BOOLEAN DEFAULT FALSE, -- Shop is at the resort base
  is_preferred BOOLEAN DEFAULT FALSE, -- Resort-recommended shop

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(resort_id, ski_shop_id)
);

-- Indexes
CREATE INDEX idx_resort_ski_shops_resort ON resort_ski_shops(resort_id);
CREATE INDEX idx_resort_ski_shops_shop ON resort_ski_shops(ski_shop_id);
CREATE INDEX idx_resort_ski_shops_distance ON resort_ski_shops(distance_miles);
```

### Table: `ski_shop_enrichment_logs`

Track enrichment runs for auditing and debugging.

```sql
CREATE TABLE ski_shop_enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID REFERENCES resorts(id),
  resort_name VARCHAR(255),

  -- Request details
  search_radius_miles INTEGER,
  search_lat DECIMAL(10, 8),
  search_lng DECIMAL(11, 8),

  -- Response details
  shops_found INTEGER DEFAULT 0,
  shops_created INTEGER DEFAULT 0,
  shops_updated INTEGER DEFAULT 0,
  shops_linked INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50), -- 'success', 'partial', 'failed', 'no_results'
  error_message TEXT,

  -- OpenAI details
  model_used VARCHAR(50),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_cost DECIMAL(10, 6),

  -- Raw data for debugging
  raw_response JSONB,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

CREATE INDEX idx_enrichment_logs_resort ON ski_shop_enrichment_logs(resort_id);
CREATE INDEX idx_enrichment_logs_status ON ski_shop_enrichment_logs(status);
CREATE INDEX idx_enrichment_logs_date ON ski_shop_enrichment_logs(started_at);
```

---

## OpenAI Prompt Design

### System Prompt

```
You are a ski industry expert assistant that helps find ski shops near ski resorts.
You have extensive knowledge of ski shops, rental facilities, and outdoor gear stores
across North America.

When asked about ski shops near a location, provide accurate, real information about
actual businesses. Include only shops that you are confident exist and are currently
operating.

Always respond in valid JSON format as specified.
```

### User Prompt Template

```
Find ski shops within {radius} miles of {resort_name} ski resort located at
{latitude}, {longitude} near {nearest_city}, {state}.

Include:
- Ski rental shops
- Ski/snowboard retail stores
- Outdoor gear stores with ski equipment
- Resort-operated rental facilities

For each shop, provide:
1. name: Official business name
2. description: Brief 1-2 sentence description of the shop and what they offer
3. address: Full street address
4. city: City name
5. state: State abbreviation (e.g., CO, UT)
6. postal_code: ZIP code
7. latitude: Decimal latitude (e.g., 39.6403)
8. longitude: Decimal longitude (e.g., -106.3742)
9. website_url: Official website URL (or null if unknown)
10. phone: Phone number (or null if unknown)
11. shop_type: Array of types from: ["rental", "retail", "repair", "demo"]
12. services: Array from: ["ski_rental", "snowboard_rental", "boot_fitting", "tuning", "waxing", "repairs", "lessons"]
13. estimated_distance_miles: Approximate distance from the resort

Respond ONLY with a JSON object in this exact format:
{
  "resort_name": "{resort_name}",
  "search_location": {
    "latitude": {latitude},
    "longitude": {longitude}
  },
  "search_radius_miles": {radius},
  "shops_found": <number>,
  "ski_shops": [
    {
      "name": "...",
      "description": "...",
      "address": "...",
      "city": "...",
      "state": "...",
      "postal_code": "...",
      "latitude": ...,
      "longitude": ...,
      "website_url": "..." or null,
      "phone": "..." or null,
      "shop_type": ["rental", "retail"],
      "services": ["ski_rental", "boot_fitting"],
      "estimated_distance_miles": ...
    }
  ]
}

If no ski shops are found within the radius, return:
{
  "resort_name": "{resort_name}",
  "search_location": {...},
  "search_radius_miles": {radius},
  "shops_found": 0,
  "ski_shops": [],
  "note": "No ski shops found within the specified radius"
}
```

### Example Response

```json
{
  "resort_name": "Vail",
  "search_location": {
    "latitude": 39.6403,
    "longitude": -106.3742
  },
  "search_radius_miles": 15,
  "shops_found": 5,
  "ski_shops": [
    {
      "name": "Vail Sports",
      "description": "Full-service ski shop at Vail Village offering premium rentals, demos, and expert boot fitting services. Official partner of Vail Resorts.",
      "address": "141 E Meadow Dr",
      "city": "Vail",
      "state": "CO",
      "postal_code": "81657",
      "latitude": 39.6391,
      "longitude": -106.3749,
      "website_url": "https://www.vailsports.com",
      "phone": "(970) 476-5600",
      "shop_type": ["rental", "retail", "demo"],
      "services": ["ski_rental", "snowboard_rental", "boot_fitting", "tuning", "waxing"],
      "estimated_distance_miles": 0.2
    },
    {
      "name": "Christy Sports",
      "description": "Large outdoor retailer with extensive ski rental fleet and gear sales. Multiple locations throughout the Vail Valley.",
      "address": "293 Bridge St",
      "city": "Vail",
      "state": "CO",
      "postal_code": "81657",
      "latitude": 39.6419,
      "longitude": -106.3781,
      "website_url": "https://www.christysports.com",
      "phone": "(970) 476-2244",
      "shop_type": ["rental", "retail", "repair"],
      "services": ["ski_rental", "snowboard_rental", "boot_fitting", "tuning", "waxing", "repairs"],
      "estimated_distance_miles": 0.5
    }
  ]
}
```

---

## Application Structure

```
apps/updaters/ski-shop-enricher/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── config.ts                # Configuration and env vars
│   ├── types.ts                 # TypeScript interfaces
│   │
│   ├── services/
│   │   ├── supabase.ts          # Supabase client and queries
│   │   ├── openai.ts            # OpenAI client and prompts
│   │   └── geocoding.ts         # Distance calculations
│   │
│   ├── enricher/
│   │   ├── ski-shop-enricher.ts # Main enrichment logic
│   │   ├── response-parser.ts   # Parse and validate OpenAI responses
│   │   └── deduplicator.ts      # Prevent duplicate shops
│   │
│   └── utils/
│       ├── logger.ts            # Logging utility
│       ├── rate-limiter.ts      # API rate limiting
│       └── slug.ts              # Generate URL-safe slugs
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Core Implementation

### TypeScript Interfaces

```typescript
// types.ts

export interface Resort {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  nearest_city: string;
  state: string;
  state_name: string;
}

export interface SkiShop {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: ShopType[];
  services: ShopService[];
  source: 'openai' | 'manual' | 'google_places';
  verified: boolean;
  is_active: boolean;
}

export type ShopType = 'rental' | 'retail' | 'repair' | 'demo';

export type ShopService =
  | 'ski_rental'
  | 'snowboard_rental'
  | 'boot_fitting'
  | 'tuning'
  | 'waxing'
  | 'repairs'
  | 'lessons';

export interface ResortSkiShop {
  resort_id: string;
  ski_shop_id: string;
  distance_miles: number;
  drive_time_minutes?: number;
  is_on_mountain: boolean;
  is_preferred: boolean;
}

export interface OpenAIShopResponse {
  resort_name: string;
  search_location: {
    latitude: number;
    longitude: number;
  };
  search_radius_miles: number;
  shops_found: number;
  ski_shops: OpenAIShop[];
  note?: string;
}

export interface OpenAIShop {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  website_url: string | null;
  phone: string | null;
  shop_type: ShopType[];
  services: ShopService[];
  estimated_distance_miles: number;
}

export interface EnrichmentConfig {
  searchRadiusMiles: number;
  maxShopsPerResort: number;
  batchSize: number;
  delayBetweenRequests: number; // ms
  openaiModel: string;
}

export interface EnrichmentResult {
  resort_id: string;
  resort_name: string;
  status: 'success' | 'partial' | 'failed' | 'no_results';
  shops_found: number;
  shops_created: number;
  shops_updated: number;
  shops_linked: number;
  error?: string;
  duration_ms: number;
}
```

### Main Enricher Class

```typescript
// enricher/ski-shop-enricher.ts

import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Resort, SkiShop, EnrichmentConfig, EnrichmentResult, OpenAIShopResponse } from '../types';
import { generateSlug } from '../utils/slug';
import { calculateDistance } from '../services/geocoding';
import { logger } from '../utils/logger';

export class SkiShopEnricher {
  private openai: OpenAI;
  private supabase: ReturnType<typeof createClient>;
  private config: EnrichmentConfig;

  constructor(config: EnrichmentConfig) {
    this.config = config;
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async enrichAllResorts(): Promise<EnrichmentResult[]> {
    const resorts = await this.getResortsToEnrich();
    const results: EnrichmentResult[] = [];

    logger.info(`Starting enrichment for ${resorts.length} resorts`);

    for (let i = 0; i < resorts.length; i += this.config.batchSize) {
      const batch = resorts.slice(i, i + this.config.batchSize);

      for (const resort of batch) {
        const result = await this.enrichResort(resort);
        results.push(result);

        // Rate limiting delay
        await this.delay(this.config.delayBetweenRequests);
      }

      logger.info(`Completed batch ${Math.floor(i / this.config.batchSize) + 1}`);
    }

    return results;
  }

  async enrichResort(resort: Resort): Promise<EnrichmentResult> {
    const startTime = Date.now();
    const logEntry = {
      resort_id: resort.id,
      resort_name: resort.name,
      search_radius_miles: this.config.searchRadiusMiles,
      search_lat: resort.lat,
      search_lng: resort.lng,
      started_at: new Date().toISOString(),
    };

    try {
      logger.info(`Enriching resort: ${resort.name}`);

      // Call OpenAI
      const response = await this.callOpenAI(resort);

      if (!response || response.shops_found === 0) {
        return this.logResult(logEntry, {
          status: 'no_results',
          shops_found: 0,
          shops_created: 0,
          shops_updated: 0,
          shops_linked: 0,
          duration_ms: Date.now() - startTime,
        }, response);
      }

      // Process shops
      let shopsCreated = 0;
      let shopsUpdated = 0;
      let shopsLinked = 0;

      for (const shopData of response.ski_shops) {
        const { shop, isNew } = await this.upsertShop(shopData);

        if (isNew) shopsCreated++;
        else shopsUpdated++;

        // Calculate actual distance
        const actualDistance = calculateDistance(
          resort.lat, resort.lng,
          shop.latitude, shop.longitude
        );

        // Link to resort
        await this.linkShopToResort(resort.id, shop.id!, actualDistance);
        shopsLinked++;
      }

      return this.logResult(logEntry, {
        status: 'success',
        shops_found: response.shops_found,
        shops_created: shopsCreated,
        shops_updated: shopsUpdated,
        shops_linked: shopsLinked,
        duration_ms: Date.now() - startTime,
      }, response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error enriching ${resort.name}: ${errorMessage}`);

      return this.logResult(logEntry, {
        status: 'failed',
        shops_found: 0,
        shops_created: 0,
        shops_updated: 0,
        shops_linked: 0,
        error: errorMessage,
        duration_ms: Date.now() - startTime,
      });
    }
  }

  private async callOpenAI(resort: Resort): Promise<OpenAIShopResponse | null> {
    const prompt = this.buildPrompt(resort);

    const completion = await this.openai.chat.completions.create({
      model: this.config.openaiModel,
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    try {
      return JSON.parse(content) as OpenAIShopResponse;
    } catch {
      logger.error('Failed to parse OpenAI response as JSON');
      return null;
    }
  }

  private buildPrompt(resort: Resort): string {
    return `Find ski shops within ${this.config.searchRadiusMiles} miles of ${resort.name} ski resort located at ${resort.lat}, ${resort.lng} near ${resort.nearest_city}, ${resort.state_name}.

Include:
- Ski rental shops
- Ski/snowboard retail stores
- Outdoor gear stores with ski equipment
- Resort-operated rental facilities

For each shop, provide:
1. name: Official business name
2. description: Brief 1-2 sentence description of the shop and what they offer
3. address: Full street address
4. city: City name
5. state: State abbreviation (e.g., CO, UT)
6. postal_code: ZIP code
7. latitude: Decimal latitude
8. longitude: Decimal longitude
9. website_url: Official website URL (or null if unknown)
10. phone: Phone number (or null if unknown)
11. shop_type: Array of types from: ["rental", "retail", "repair", "demo"]
12. services: Array from: ["ski_rental", "snowboard_rental", "boot_fitting", "tuning", "waxing", "repairs", "lessons"]
13. estimated_distance_miles: Approximate distance from the resort

Respond ONLY with valid JSON in this format:
{
  "resort_name": "${resort.name}",
  "search_location": {"latitude": ${resort.lat}, "longitude": ${resort.lng}},
  "search_radius_miles": ${this.config.searchRadiusMiles},
  "shops_found": <number>,
  "ski_shops": [...]
}`;
  }

  private getSystemPrompt(): string {
    return `You are a ski industry expert assistant that helps find ski shops near ski resorts. You have extensive knowledge of ski shops, rental facilities, and outdoor gear stores across North America.

When asked about ski shops near a location, provide accurate, real information about actual businesses. Include only shops that you are confident exist and are currently operating.

Always respond in valid JSON format as specified.`;
  }

  private async upsertShop(shopData: OpenAIShop): Promise<{ shop: SkiShop; isNew: boolean }> {
    const slug = generateSlug(shopData.name, shopData.city, shopData.state);

    // Check if shop exists
    const { data: existing } = await this.supabase
      .from('ski_shops')
      .select('*')
      .eq('slug', slug)
      .single();

    const shopRecord: Partial<SkiShop> = {
      name: shopData.name,
      slug,
      description: shopData.description,
      address_line1: shopData.address,
      city: shopData.city,
      state: shopData.state,
      postal_code: shopData.postal_code,
      country: 'US',
      latitude: shopData.latitude,
      longitude: shopData.longitude,
      phone: shopData.phone,
      website_url: shopData.website_url,
      shop_type: shopData.shop_type,
      services: shopData.services,
      source: 'openai',
    };

    if (existing) {
      // Update existing
      const { data } = await this.supabase
        .from('ski_shops')
        .update({ ...shopRecord, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      return { shop: data as SkiShop, isNew: false };
    } else {
      // Insert new
      const { data } = await this.supabase
        .from('ski_shops')
        .insert(shopRecord)
        .select()
        .single();

      return { shop: data as SkiShop, isNew: true };
    }
  }

  private async linkShopToResort(
    resortId: string,
    shopId: string,
    distanceMiles: number
  ): Promise<void> {
    await this.supabase
      .from('resort_ski_shops')
      .upsert({
        resort_id: resortId,
        ski_shop_id: shopId,
        distance_miles: Math.round(distanceMiles * 100) / 100,
        is_on_mountain: distanceMiles < 0.5,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'resort_id,ski_shop_id'
      });
  }

  private async getResortsToEnrich(): Promise<Resort[]> {
    const { data, error } = await this.supabase
      .from('resorts_full')
      .select('id, name, slug, lat, lng, nearest_city, state, state_name')
      .eq('is_active', true)
      .not('lat', 'is', null)
      .order('name');

    if (error) throw error;
    return data as Resort[];
  }

  private async logResult(
    logEntry: Record<string, unknown>,
    result: Partial<EnrichmentResult>,
    response?: OpenAIShopResponse | null
  ): Promise<EnrichmentResult> {
    await this.supabase.from('ski_shop_enrichment_logs').insert({
      ...logEntry,
      ...result,
      raw_response: response || null,
      completed_at: new Date().toISOString(),
    });

    return {
      resort_id: logEntry.resort_id as string,
      resort_name: logEntry.resort_name as string,
      ...result,
    } as EnrichmentResult;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Configuration

### Environment Variables

```bash
# .env.example

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Enrichment Settings
SEARCH_RADIUS_MILES=20
MAX_SHOPS_PER_RESORT=10
BATCH_SIZE=5
DELAY_BETWEEN_REQUESTS_MS=2000
OPENAI_MODEL=gpt-4-turbo-preview
```

### Default Configuration

```typescript
// config.ts

export const defaultConfig: EnrichmentConfig = {
  searchRadiusMiles: parseInt(process.env.SEARCH_RADIUS_MILES || '20'),
  maxShopsPerResort: parseInt(process.env.MAX_SHOPS_PER_RESORT || '10'),
  batchSize: parseInt(process.env.BATCH_SIZE || '5'),
  delayBetweenRequests: parseInt(process.env.DELAY_BETWEEN_REQUESTS_MS || '2000'),
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
};
```

---

## CLI Commands

```typescript
// index.ts

import { SkiShopEnricher } from './enricher/ski-shop-enricher';
import { defaultConfig } from './config';
import { logger } from './utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const enricher = new SkiShopEnricher(defaultConfig);

  switch (command) {
    case 'enrich-all':
      // Enrich all resorts
      const results = await enricher.enrichAllResorts();
      logger.info('Enrichment complete', {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
      });
      break;

    case 'enrich-resort':
      // Enrich single resort by slug
      const slug = args[1];
      if (!slug) {
        logger.error('Usage: enrich-resort <resort-slug>');
        process.exit(1);
      }
      // Implementation for single resort
      break;

    case 'enrich-state':
      // Enrich all resorts in a state
      const state = args[1];
      if (!state) {
        logger.error('Usage: enrich-state <state-code>');
        process.exit(1);
      }
      // Implementation for state
      break;

    default:
      console.log(`
Ski Shop Enricher CLI

Commands:
  enrich-all              Enrich all resorts
  enrich-resort <slug>    Enrich a single resort
  enrich-state <state>    Enrich all resorts in a state (e.g., CO, UT)

Options:
  --radius <miles>        Search radius (default: 20)
  --dry-run               Show what would be done without making changes
      `);
  }
}

main().catch(console.error);
```

---

## Estimated Costs

### OpenAI API Costs (GPT-4 Turbo)

| Metric | Estimate |
|--------|----------|
| Input tokens per request | ~500 tokens |
| Output tokens per request | ~1,500 tokens |
| Cost per 1K input tokens | $0.01 |
| Cost per 1K output tokens | $0.03 |
| **Cost per resort** | ~$0.05 |
| **Total for 200 resorts** | ~$10.00 |

### Supabase Costs

- Database storage: Minimal (< 1MB for ski shops data)
- API requests: Within free tier for this use case

---

## Execution Plan

### Phase 1: Setup (Day 1)

1. Create database tables via Supabase migrations
2. Set up the Node.js/TypeScript project structure
3. Configure environment variables
4. Test OpenAI API connection

### Phase 2: Core Development (Days 2-3)

1. Implement Supabase service layer
2. Implement OpenAI service with prompt
3. Build response parser with validation
4. Implement deduplication logic
5. Create enrichment logging

### Phase 3: Testing (Day 4)

1. Test with 5-10 resorts manually
2. Verify data quality and accuracy
3. Tune prompt for better results
4. Test deduplication across resorts

### Phase 4: Full Run (Day 5)

1. Run enrichment for all resorts
2. Monitor for errors
3. Review and verify results
4. Create summary report

### Phase 5: Integration (Day 6+)

1. Create Supabase view for easy querying
2. Add API endpoint for resort ski shops
3. Build UI components (list view, map markers)

---

## Data Quality Considerations

### Validation Rules

1. **Name**: Required, max 255 characters
2. **Coordinates**: Must be within reasonable bounds for US/Canada
3. **State**: Must match a valid state code
4. **Website URL**: Must be valid URL format if provided
5. **Distance**: Must be less than search radius

### Deduplication Strategy

1. Generate consistent slugs: `{name}-{city}-{state}`
2. Check for existing shops by slug before insert
3. Update existing records rather than duplicate
4. Consider fuzzy matching for name variations

### Manual Verification

- Flag shops for manual verification
- Allow admin to mark shops as "verified"
- Prioritize verified shops in UI displays

---

## Future Enhancements

1. **Google Places Integration**: Cross-reference with Google Places API for verification
2. **User Submissions**: Allow users to submit/correct ski shop info
3. **Opening Hours**: Add support for business hours display
4. **Reviews Integration**: Link to Google/Yelp reviews
5. **Real-time Updates**: Periodic re-enrichment for data freshness
6. **International Support**: Expand to European/other ski destinations

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Resorts with ski shops | > 90% |
| Average shops per resort | 3-5 |
| Data accuracy rate | > 85% |
| API cost per full run | < $15 |
| Full enrichment time | < 2 hours |
