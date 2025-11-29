# Epic 17: Supabase Database Migration

## Overview
Migrate resort data from GCP Cloud Storage JSON files to Supabase PostgreSQL database. This establishes a relational data layer that enables dynamic queries, filtering, full-text search, and real-time updates while keeping GCS for static asset storage (images, trail maps).

## Business Value
- Enable advanced filtering and search capabilities (by state, pass type, terrain, features)
- Support dynamic content updates without redeployment
- Provide real-time data sync for conditions/status updates
- Enable user features (favorites, reviews, trip planning) in future
- Improve SEO with server-rendered dynamic content
- Reduce client-side data fetching overhead

## Technical Context

### Current State
- **Data Location**: `gs://sda-assets-prod/resorts/{country}/{state}/{slug}/resort.json`
- **Schema Definition**: `schemas/resort.schema.json` and `schemas/resort.types.ts`
- **Total Resorts**: ~800+ across US and Canada (49 states/provinces)
- **Assets**: Images remain in GCS at `gs://sda-assets-prod/resorts/...`

### Target State
- **Database**: Supabase PostgreSQL
- **Tables**: Normalized schema with proper relationships
- **Access**: Supabase client SDK for queries, Row Level Security for future auth
- **Assets**: Continue using GCS URLs in database records

### Schema Analysis

From `resort.schema.json`, the data model includes:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Format: `resort:{slug}` |
| slug | string | Yes | URL-friendly identifier |
| name | string | Yes | Official name |
| country | enum | Yes | `us` or `ca` |
| countryName | string | Yes | Full country name |
| state | string | Yes | State/province slug |
| stateName | string | Yes | Full state name |
| status | enum | Yes | `active` or `defunct` |
| isActive | boolean | Yes | Derived from status |
| isLost | boolean | Yes | Derived from status |
| location | object | No | `{lat, lng}` coordinates |
| nearestCity | string | No | Reference city |
| stats | object | No | Skiing statistics |
| terrain | object | No | Difficulty percentages |
| passAffiliations | array | Yes | Pass programs (can be empty) |
| features | object | No | Boolean amenities |
| websiteUrl | string | No | Official website |
| description | string | No | Brief description |
| tags | array | Yes | Searchable tags (can be empty) |
| assetLocation | object | Yes | GCS path components |
| lastUpdated | datetime | Yes | ISO 8601 timestamp |

---

## Database Design

### Proposed Supabase Schema

```
┌─────────────────────┐      ┌─────────────────────┐
│      countries      │      │       states        │
├─────────────────────┤      ├─────────────────────┤
│ code (PK)           │──────│ country_code (FK)   │
│ name                │      │ slug (PK)           │
└─────────────────────┘      │ name                │
                             └──────────┬──────────┘
                                        │
                             ┌──────────┴──────────┐
                             │       resorts       │
                             ├─────────────────────┤
                             │ id (PK)             │
                             │ slug (UNIQUE)       │
                             │ name                │
                             │ country_code (FK)   │
                             │ state_slug (FK)     │
                             │ status              │
                             │ location (POINT)    │
                             │ nearest_city        │
                             │ website_url         │
                             │ description         │
                             │ stats (JSONB)       │
                             │ terrain (JSONB)     │
                             │ features (JSONB)    │
                             │ asset_path          │
                             │ created_at          │
                             │ updated_at          │
                             └──────────┬──────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         │                              │                              │
┌────────┴────────┐          ┌─────────┴─────────┐          ┌─────────┴─────────┐
│  resort_passes  │          │   resort_tags     │          │  pass_programs    │
├─────────────────┤          ├───────────────────┤          ├───────────────────┤
│ resort_id (FK)  │          │ resort_id (FK)    │          │ slug (PK)         │
│ pass_slug (FK)  │          │ tag (TEXT)        │          │ name              │
│ (composite PK)  │          │ (composite PK)    │          │ website_url       │
└─────────────────┘          └───────────────────┘          └───────────────────┘
```

### Table Definitions

#### 1. `countries` (Reference Table)
```sql
CREATE TABLE countries (
  code TEXT PRIMARY KEY CHECK (code IN ('us', 'ca')),
  name TEXT NOT NULL
);

INSERT INTO countries VALUES
  ('us', 'United States'),
  ('ca', 'Canada');
```

#### 2. `states` (Reference Table)
```sql
CREATE TABLE states (
  slug TEXT PRIMARY KEY,
  country_code TEXT NOT NULL REFERENCES countries(code),
  name TEXT NOT NULL
);
```

#### 3. `pass_programs` (Reference Table)
```sql
CREATE TABLE pass_programs (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT
);

INSERT INTO pass_programs VALUES
  ('epic', 'Epic Pass', 'https://www.epicpass.com'),
  ('ikon', 'Ikon Pass', 'https://www.ikonpass.com'),
  ('indy', 'Indy Pass', 'https://www.indyskipass.com'),
  ('mountain-collective', 'Mountain Collective', 'https://www.mountaincollective.com'),
  ('powder-alliance', 'Powder Alliance', 'https://www.powderalliance.com');
```

#### 4. `resorts` (Main Table)
```sql
CREATE TABLE resorts (
  id TEXT PRIMARY KEY,                    -- Format: resort:{slug}
  slug TEXT UNIQUE NOT NULL,              -- URL identifier
  name TEXT NOT NULL,                     -- Official name
  country_code TEXT NOT NULL REFERENCES countries(code),
  state_slug TEXT NOT NULL REFERENCES states(slug),
  status TEXT NOT NULL CHECK (status IN ('active', 'defunct')),

  -- Location
  location GEOGRAPHY(POINT, 4326),        -- PostGIS point
  nearest_city TEXT,

  -- URLs
  website_url TEXT,

  -- Content
  description TEXT,

  -- Nested JSON for complex objects
  stats JSONB DEFAULT '{}',               -- skiableAcres, liftsCount, etc.
  terrain JSONB DEFAULT '{}',             -- beginner, intermediate, etc.
  features JSONB DEFAULT '{}',            -- hasPark, hasHalfpipe, etc.

  -- Asset location (for constructing GCS URLs)
  asset_path TEXT NOT NULL,               -- e.g., "us/colorado/vail"

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Computed columns via generated columns
ALTER TABLE resorts ADD COLUMN is_active BOOLEAN
  GENERATED ALWAYS AS (status = 'active') STORED;
ALTER TABLE resorts ADD COLUMN is_lost BOOLEAN
  GENERATED ALWAYS AS (status = 'defunct') STORED;
```

#### 5. `resort_passes` (Junction Table)
```sql
CREATE TABLE resort_passes (
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  pass_slug TEXT REFERENCES pass_programs(slug) ON DELETE CASCADE,
  PRIMARY KEY (resort_id, pass_slug)
);
```

#### 6. `resort_tags` (Tags Table)
```sql
CREATE TABLE resort_tags (
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (resort_id, tag)
);

-- Index for tag searches
CREATE INDEX idx_resort_tags_tag ON resort_tags(tag);
```

---

## Prerequisites
- Supabase project created
- Supabase CLI installed (`npx supabase`)
- Access to GCP Cloud Storage (for reading resort.json files)
- Node.js 18+ for migration scripts

---

# User Stories

## Phase 1: Supabase Project Setup

### Story 17.1: Create Supabase Project
**As a** platform administrator
**I want** to create and configure a Supabase project
**So that** we have a PostgreSQL database for resort data

**Tasks:**
1. Create new Supabase project at supabase.com
2. Note project URL and anon/service role keys
3. Enable PostGIS extension for geographic queries
4. Configure connection pooling settings

**Acceptance Criteria:**
- [ ] Supabase project created
- [ ] Project URL and API keys documented securely
- [ ] PostGIS extension enabled
- [ ] Connection pooling configured
- [ ] Can connect via Supabase dashboard SQL editor

**Configuration:**
```bash
# Store in .env.local (not committed)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```

---

### Story 17.2: Install Supabase CLI and Link Project
**As a** developer
**I want** to set up Supabase CLI locally
**So that** I can manage migrations and generate types

**Tasks:**
1. Install Supabase CLI: `npm install supabase --save-dev`
2. Login: `npx supabase login`
3. Link to project: `npx supabase link --project-ref <project-ref>`
4. Initialize local directory structure

**Acceptance Criteria:**
- [ ] Supabase CLI installed
- [ ] Successfully authenticated
- [ ] Project linked locally
- [ ] `supabase/` directory created with config

**Commands:**
```bash
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db pull  # Pull existing schema if any
```

---

## Phase 2: Schema Creation

### Story 17.3: Create Reference Tables Migration
**As a** database administrator
**I want** to create reference tables for countries, states, and passes
**So that** resort data has proper foreign key relationships

**Tasks:**
1. Create migration file for reference tables
2. Define countries, states, and pass_programs tables
3. Seed countries and pass_programs with static data
4. Apply migration

**Acceptance Criteria:**
- [ ] Migration file created: `supabase/migrations/001_reference_tables.sql`
- [ ] countries table with us/ca entries
- [ ] states table ready for population
- [ ] pass_programs table with 5 pass types
- [ ] Migration applied successfully

**Migration File:**
```sql
-- 001_reference_tables.sql

-- Countries
CREATE TABLE countries (
  code TEXT PRIMARY KEY CHECK (code IN ('us', 'ca')),
  name TEXT NOT NULL
);

INSERT INTO countries (code, name) VALUES
  ('us', 'United States'),
  ('ca', 'Canada');

-- States/Provinces
CREATE TABLE states (
  slug TEXT PRIMARY KEY,
  country_code TEXT NOT NULL REFERENCES countries(code),
  name TEXT NOT NULL,
  UNIQUE(country_code, slug)
);

-- Pass Programs
CREATE TABLE pass_programs (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT,
  logo_url TEXT
);

INSERT INTO pass_programs (slug, name, website_url) VALUES
  ('epic', 'Epic Pass', 'https://www.epicpass.com'),
  ('ikon', 'Ikon Pass', 'https://www.ikonpass.com'),
  ('indy', 'Indy Pass', 'https://www.indyskipass.com'),
  ('mountain-collective', 'Mountain Collective', 'https://www.mountaincollective.com'),
  ('powder-alliance', 'Powder Alliance', 'https://www.powderalliance.com');
```

---

### Story 17.4: Create Resorts Table Migration
**As a** database administrator
**I want** to create the main resorts table
**So that** we can store all resort data

**Tasks:**
1. Enable PostGIS extension
2. Create resorts table with all columns
3. Add generated columns for is_active/is_lost
4. Create indexes for common queries

**Acceptance Criteria:**
- [ ] Migration file created: `supabase/migrations/002_resorts_table.sql`
- [ ] PostGIS extension enabled
- [ ] resorts table with all required columns
- [ ] Generated columns working
- [ ] Indexes created for slug, state, status
- [ ] Migration applied successfully

**Migration File:**
```sql
-- 002_resorts_table.sql

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Resorts table
CREATE TABLE resorts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES countries(code),
  state_slug TEXT NOT NULL REFERENCES states(slug),
  status TEXT NOT NULL CHECK (status IN ('active', 'defunct')) DEFAULT 'active',

  -- Location (PostGIS geography for accurate distance calculations)
  location GEOGRAPHY(POINT, 4326),
  nearest_city TEXT,

  -- URLs and content
  website_url TEXT,
  description TEXT,

  -- Complex nested data as JSONB
  stats JSONB DEFAULT '{}',
  terrain JSONB DEFAULT '{}',
  features JSONB DEFAULT '{}',

  -- Asset path for GCS URL construction
  asset_path TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Generated columns
  is_active BOOLEAN GENERATED ALWAYS AS (status = 'active') STORED,
  is_lost BOOLEAN GENERATED ALWAYS AS (status = 'defunct') STORED
);

-- Indexes
CREATE INDEX idx_resorts_slug ON resorts(slug);
CREATE INDEX idx_resorts_state ON resorts(state_slug);
CREATE INDEX idx_resorts_country ON resorts(country_code);
CREATE INDEX idx_resorts_status ON resorts(status);
CREATE INDEX idx_resorts_location ON resorts USING GIST(location);
CREATE INDEX idx_resorts_stats ON resorts USING GIN(stats);
CREATE INDEX idx_resorts_features ON resorts USING GIN(features);

-- Full-text search index
ALTER TABLE resorts ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(nearest_city, '')), 'C')
  ) STORED;
CREATE INDEX idx_resorts_fts ON resorts USING GIN(fts);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resorts_updated_at
  BEFORE UPDATE ON resorts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

### Story 17.5: Create Junction Tables Migration
**As a** database administrator
**I want** to create junction tables for passes and tags
**So that** resorts can have multiple passes and tags

**Tasks:**
1. Create resort_passes junction table
2. Create resort_tags table
3. Add appropriate indexes

**Acceptance Criteria:**
- [ ] Migration file created: `supabase/migrations/003_junction_tables.sql`
- [ ] resort_passes table with composite primary key
- [ ] resort_tags table with composite primary key
- [ ] Indexes for efficient lookups
- [ ] Migration applied successfully

**Migration File:**
```sql
-- 003_junction_tables.sql

-- Resort to Pass junction
CREATE TABLE resort_passes (
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  pass_slug TEXT REFERENCES pass_programs(slug) ON DELETE CASCADE,
  PRIMARY KEY (resort_id, pass_slug)
);

CREATE INDEX idx_resort_passes_pass ON resort_passes(pass_slug);

-- Resort tags
CREATE TABLE resort_tags (
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (resort_id, tag)
);

CREATE INDEX idx_resort_tags_tag ON resort_tags(tag);
```

---

### Story 17.6: Create Database Views
**As a** API consumer
**I want** convenient views that join related data
**So that** I can fetch complete resort data in one query

**Tasks:**
1. Create view for resorts with state/country names
2. Create view with aggregated passes and tags
3. Create view matching original JSON structure

**Acceptance Criteria:**
- [ ] Migration file created: `supabase/migrations/004_views.sql`
- [ ] `resorts_full` view with all joined data
- [ ] Views return data matching original JSON schema
- [ ] Views are performant with proper indexes

**Migration File:**
```sql
-- 004_views.sql

-- Full resort view with all related data
CREATE OR REPLACE VIEW resorts_full AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.country_code AS country,
  c.name AS country_name,
  r.state_slug AS state,
  s.name AS state_name,
  r.status,
  r.is_active,
  r.is_lost,
  ST_Y(r.location::geometry) AS lat,
  ST_X(r.location::geometry) AS lng,
  r.nearest_city,
  r.stats,
  r.terrain,
  r.features,
  r.website_url,
  r.description,
  r.asset_path,
  r.created_at,
  r.updated_at,
  COALESCE(
    (SELECT array_agg(pass_slug) FROM resort_passes WHERE resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS pass_affiliations,
  COALESCE(
    (SELECT array_agg(tag) FROM resort_tags WHERE resort_id = r.id),
    ARRAY[]::TEXT[]
  ) AS tags
FROM resorts r
JOIN countries c ON r.country_code = c.code
JOIN states s ON r.state_slug = s.slug;

-- Resorts by state view
CREATE OR REPLACE VIEW resorts_by_state AS
SELECT
  s.slug AS state_slug,
  s.name AS state_name,
  s.country_code,
  COUNT(r.id) AS resort_count,
  COUNT(r.id) FILTER (WHERE r.status = 'active') AS active_count,
  COUNT(r.id) FILTER (WHERE r.status = 'defunct') AS defunct_count
FROM states s
LEFT JOIN resorts r ON s.slug = r.state_slug
GROUP BY s.slug, s.name, s.country_code
ORDER BY s.country_code, s.name;
```

---

### Story 17.7: Configure Row Level Security
**As a** security administrator
**I want** to configure Row Level Security policies
**So that** data access is properly controlled

**Tasks:**
1. Enable RLS on all tables
2. Create policy for public read access
3. Create policy for authenticated admin writes
4. Test policies work correctly

**Acceptance Criteria:**
- [ ] Migration file created: `supabase/migrations/005_rls_policies.sql`
- [ ] RLS enabled on all tables
- [ ] Anonymous users can read all data
- [ ] Only service role can write data
- [ ] Policies tested and working

**Migration File:**
```sql
-- 005_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE resorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Public read access" ON resorts
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON resort_passes
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON resort_tags
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON states
  FOR SELECT USING (true);

-- Reference tables are read-only (managed via migrations)
CREATE POLICY "Public read access" ON countries
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON pass_programs
  FOR SELECT USING (true);

-- Note: Write access is handled via service role key
-- which bypasses RLS. Future user features would add
-- user-specific policies here.
```

---

## Phase 3: Migration Scripts

### Story 17.8: Create States Seeding Script
**As a** developer
**I want** to seed the states table from GCS data
**So that** we have all US and Canadian states/provinces

**Tasks:**
1. Create script to list all state folders in GCS
2. Parse state slugs and generate full names
3. Insert into states table
4. Verify all 49 states/provinces created

**Acceptance Criteria:**
- [ ] Script created: `scripts/seed-states.ts`
- [ ] All US states with resorts seeded
- [ ] All Canadian provinces with resorts seeded
- [ ] State names properly formatted
- [ ] Script idempotent (can run multiple times)

**Script Outline:**
```typescript
// scripts/seed-states.ts
import { createClient } from '@supabase/supabase-js';
import { Storage } from '@google-cloud/storage';

const US_STATES: Record<string, string> = {
  'alaska': 'Alaska',
  'arizona': 'Arizona',
  'california': 'California',
  'colorado': 'Colorado',
  // ... all states
};

const CA_PROVINCES: Record<string, string> = {
  'alberta': 'Alberta',
  'british-columbia': 'British Columbia',
  'ontario': 'Ontario',
  'quebec': 'Quebec',
  // ... all provinces
};

async function seedStates() {
  const supabase = createClient(url, serviceKey);

  // Get state folders from GCS
  const storage = new Storage();
  const [usFiles] = await storage.bucket('sda-assets-prod')
    .getFiles({ prefix: 'resorts/us/', delimiter: '/' });

  // Insert states...
}
```

---

### Story 17.9: Create Resort Migration Script
**As a** developer
**I want** to migrate all resort.json files to Supabase
**So that** the database is populated with all resort data

**Tasks:**
1. Create migration script that reads from GCS
2. Transform JSON to database schema
3. Handle location as PostGIS geography
4. Insert passes and tags into junction tables
5. Add progress logging and error handling

**Acceptance Criteria:**
- [ ] Script created: `scripts/migrate-resorts.ts`
- [ ] Reads all resort.json files from GCS
- [ ] Transforms data to match database schema
- [ ] Handles missing optional fields
- [ ] Inserts passes and tags correctly
- [ ] Logs progress and errors
- [ ] Handles duplicates gracefully (upsert)

**Script Outline:**
```typescript
// scripts/migrate-resorts.ts
import { createClient } from '@supabase/supabase-js';
import { Storage } from '@google-cloud/storage';

interface ResortJson {
  id: string;
  slug: string;
  name: string;
  country: string;
  state: string;
  status: string;
  location?: { lat: number; lng: number };
  stats?: object;
  terrain?: object;
  features?: object;
  passAffiliations: string[];
  tags: string[];
  // ... other fields
}

async function migrateResorts() {
  const supabase = createClient(url, serviceKey);
  const storage = new Storage();

  // List all resort folders
  const bucket = storage.bucket('sda-assets-prod');

  // For each resort.json:
  // 1. Read and parse JSON
  // 2. Transform to database format
  // 3. Upsert resort
  // 4. Upsert passes
  // 5. Upsert tags
}

function transformResort(json: ResortJson) {
  return {
    id: json.id,
    slug: json.slug,
    name: json.name,
    country_code: json.country,
    state_slug: json.state,
    status: json.status,
    location: json.location
      ? `POINT(${json.location.lng} ${json.location.lat})`
      : null,
    nearest_city: json.nearestCity,
    website_url: json.websiteUrl,
    description: json.description,
    stats: json.stats || {},
    terrain: json.terrain || {},
    features: json.features || {},
    asset_path: `${json.country}/${json.state}/${json.slug}`,
  };
}
```

---

### Story 17.10: Create Validation Script
**As a** developer
**I want** to validate migrated data
**So that** I can confirm the migration was successful

**Tasks:**
1. Create validation script
2. Compare counts: GCS files vs database rows
3. Spot check random resorts for data integrity
4. Verify all relationships are intact

**Acceptance Criteria:**
- [ ] Script created: `scripts/validate-migration.ts`
- [ ] Counts match between GCS and database
- [ ] Sample resorts have all data intact
- [ ] All passes and tags migrated
- [ ] No orphaned records

---

## Phase 4: Application Integration

### Story 17.11: Install Supabase Client SDK
**As a** frontend developer
**I want** to install and configure the Supabase client
**So that** the app can query the database

**Tasks:**
1. Install `@supabase/supabase-js`
2. Create Supabase client utility
3. Add environment variables
4. Test connection from app

**Acceptance Criteria:**
- [ ] Package installed
- [ ] Client utility created: `lib/supabase.ts`
- [ ] Environment variables configured
- [ ] Can query resorts from the app

**Implementation:**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

---

### Story 17.12: Generate TypeScript Types from Schema
**As a** developer
**I want** TypeScript types generated from the database schema
**So that** I have type-safe database queries

**Tasks:**
1. Run `npx supabase gen types typescript`
2. Save output to `types/supabase.ts`
3. Configure type generation in CI/CD
4. Update client to use generated types

**Acceptance Criteria:**
- [ ] Types generated: `types/supabase.ts`
- [ ] Types match database schema
- [ ] Supabase client uses generated types
- [ ] Queries are type-safe

**Commands:**
```bash
npx supabase gen types typescript --project-id <project-ref> > types/supabase.ts
```

---

### Story 17.13: Create Resort Data Service
**As a** frontend developer
**I want** a data service layer for resort queries
**So that** components have clean data access

**Tasks:**
1. Create service with common queries
2. Implement getResortBySlug
3. Implement getResortsByState
4. Implement searchResorts
5. Add caching strategy

**Acceptance Criteria:**
- [ ] Service created: `lib/services/resort-service.ts`
- [ ] All CRUD operations implemented
- [ ] Search and filter functions working
- [ ] Caching implemented (React Query or SWR)
- [ ] Error handling in place

**Implementation:**
```typescript
// lib/services/resort-service.ts
import { supabase } from '@/lib/supabase';

export async function getResortBySlug(slug: string) {
  const { data, error } = await supabase
    .from('resorts_full')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getResortsByState(stateSlug: string) {
  const { data, error } = await supabase
    .from('resorts_full')
    .select('*')
    .eq('state', stateSlug)
    .order('name');

  if (error) throw error;
  return data;
}

export async function searchResorts(query: string) {
  const { data, error } = await supabase
    .from('resorts')
    .select('id, slug, name, state_slug')
    .textSearch('fts', query)
    .limit(20);

  if (error) throw error;
  return data;
}
```

---

### Story 17.14: Update Components to Use Supabase
**As a** frontend developer
**I want** to update existing components to fetch from Supabase
**So that** the app uses the new data layer

**Tasks:**
1. Update resort detail page to use Supabase
2. Update resort listing page
3. Update filters to query database
4. Remove dependency on mock-data (or make it fallback)

**Acceptance Criteria:**
- [ ] Resort detail pages fetch from Supabase
- [ ] Listing pages use database queries
- [ ] Filters work with database
- [ ] Performance is acceptable
- [ ] Fallback to static data if needed

---

## Phase 5: Verification and Cleanup

### Story 17.15: End-to-End Testing
**As a** QA engineer
**I want** to verify the migration is complete
**So that** we can confidently use the new data layer

**Tasks:**
1. Test all resort detail pages load correctly
2. Test filtering by state, pass, features
3. Test search functionality
4. Test on different network conditions
5. Compare with original data for accuracy

**Acceptance Criteria:**
- [ ] All resort pages render correctly
- [ ] Filters return expected results
- [ ] Search finds relevant resorts
- [ ] No console errors
- [ ] Performance meets targets (<1s page load)

---

### Story 17.16: Documentation Update
**As a** developer
**I want** updated documentation for the new data layer
**So that** the team understands how to work with Supabase

**Tasks:**
1. Update CLAUDE.md with Supabase section
2. Document database schema
3. Document common queries
4. Add troubleshooting guide

**Acceptance Criteria:**
- [ ] CLAUDE.md updated with Supabase info
- [ ] Schema documented
- [ ] Query examples provided
- [ ] Setup instructions complete

---

## Summary

| Story | Title | Priority | Effort |
|-------|-------|----------|--------|
| 17.1 | Create Supabase Project | High | Small |
| 17.2 | Install Supabase CLI | High | Small |
| 17.3 | Create Reference Tables Migration | High | Small |
| 17.4 | Create Resorts Table Migration | High | Medium |
| 17.5 | Create Junction Tables Migration | High | Small |
| 17.6 | Create Database Views | Medium | Small |
| 17.7 | Configure Row Level Security | High | Small |
| 17.8 | Create States Seeding Script | High | Medium |
| 17.9 | Create Resort Migration Script | High | Large |
| 17.10 | Create Validation Script | High | Medium |
| 17.11 | Install Supabase Client SDK | High | Small |
| 17.12 | Generate TypeScript Types | High | Small |
| 17.13 | Create Resort Data Service | High | Medium |
| 17.14 | Update Components to Use Supabase | High | Large |
| 17.15 | End-to-End Testing | High | Medium |
| 17.16 | Documentation Update | Medium | Small |

**Total Stories:** 16
**Overall Effort:** Large (includes schema design, migration scripts, and app integration)

---

## Rollback Plan

If issues occur after migration:

1. **Quick Rollback**: Switch app back to mock-data imports
2. **Data Recovery**: GCS resort.json files remain as source of truth
3. **Database Reset**: Drop and recreate schema, re-run migration

---

## Future Enhancements

After initial migration:

1. **Real-time Conditions**: Add conditions table with live updates
2. **User Features**: Add users, favorites, reviews tables
3. **Analytics**: Track popular resorts, search queries
4. **Admin Dashboard**: CRUD interface for data management
5. **API Layer**: Create REST/GraphQL API for third-party access
