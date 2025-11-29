# Epic 15: National Resort Data Migration to GCP Cloud Storage

## Overview

Migrate all US and Canadian ski resort data models and JSON files from the `/regions/` directory structure to GCP Cloud Storage (`gs://sda-assets-prod`). This establishes a scalable, cloud-hosted data layer for the multi-region ski directory application.

## Business Value

- Enable cloud-hosted resort data accessible via public URLs
- Establish consistent data structure across all states/provinces
- Support future CDN integration for fast global delivery
- Provide foundation for dynamic data updates without code deployments
- Enable data sharing with mobile apps, APIs, and third-party integrations

## Technical Context

### Source Data Location
- Regional data: `/regions/{country}/{state}/`
- TypeScript resort files: Individual `.ts` files per resort
- JSON region metadata: `region-{country}-{state}.json` files

### Target GCS Structure
```
gs://sda-assets-prod/
├── regions/
│   ├── us/
│   │   ├── colorado/
│   │   │   ├── region.json           # Region metadata
│   │   │   ├── resorts.json          # All resorts for state
│   │   │   └── resorts/
│   │   │       ├── vail.json         # Individual resort data
│   │   │       ├── breckenridge.json
│   │   │       └── ...
│   │   ├── california/
│   │   ├── utah/
│   │   └── ...
│   └── ca/
│       ├── british-columbia/
│       ├── alberta/
│       └── ...
└── resorts/                          # Existing asset structure
    └── us/colorado/{slug}/images/
```

### Data Coverage Summary

| Country | States/Provinces | Total Resorts |
|---------|------------------|---------------|
| United States | 12 with data | ~65 active |
| Canada | 4 with data | ~9 active |
| **Total** | **16** | **~74** |

## Prerequisites

- GCP project `ski-directory-prod` configured
- GCS bucket `gs://sda-assets-prod` created and accessible
- `gsutil` CLI authenticated
- Completed Epic 13 (GCP Infrastructure) and Epic 14 (Initial Migration)

---

## Stories by State/Province

### Phase 1: United States - Western Region

#### Story 15.1: Colorado Data Migration
**Priority**: High | **Effort**: Medium

Migrate Colorado resort data (largest dataset with 76 resorts including 44 lost/defunct).

**Source Files**:
- `/regions/us/colorado/*.ts` (8 resort files)
- `/regions/us/colorado/region-us-colorado.json`
- `/apps/v1/lib/mock-data/resorts.ts` (76 resorts - primary source)

**Target**:
- `gs://sda-assets-prod/regions/us/colorado/region.json`
- `gs://sda-assets-prod/regions/us/colorado/resorts.json`
- `gs://sda-assets-prod/regions/us/colorado/resorts/{slug}.json` (individual files)

**Tasks**:
1. Export Colorado resorts from `resorts.ts` to JSON format
2. Create region metadata JSON
3. Upload to GCS with proper cache headers
4. Verify public URL access

**Acceptance Criteria**:
- [ ] All 76 Colorado resorts exported to JSON
- [ ] Region metadata includes resort count, bounds, stats
- [ ] Files accessible via public URLs
- [ ] Cache-Control headers set (5 min for JSON)

---

#### Story 15.2: California Data Migration
**Priority**: High | **Effort**: Medium

Migrate California resort data (26 resorts - second largest US state).

**Source Files**:
- `/regions/us/california/*.ts`
- `/regions/us/california/region-us-california.json`

**Target**:
- `gs://sda-assets-prod/regions/us/california/region.json`
- `gs://sda-assets-prod/regions/us/california/resorts.json`
- `gs://sda-assets-prod/regions/us/california/resorts/{slug}.json`

**Tasks**:
1. Parse TypeScript resort files to JSON
2. Aggregate into state-level `resorts.json`
3. Create region metadata
4. Upload to GCS

**Acceptance Criteria**:
- [ ] All 26 California resorts migrated
- [ ] Mammoth, Squaw Valley, Heavenly, etc. accessible
- [ ] Region stats calculated and included

---

#### Story 15.3: Utah Data Migration
**Priority**: High | **Effort**: Small

Migrate Utah resort data (6 resorts).

**Source Files**:
- `/regions/us/utah/*.ts`
- `/regions/us/utah/region-us-utah.json`

**Target**:
- `gs://sda-assets-prod/regions/us/utah/`

**Resorts**:
- Park City, Snowbird, Alta, Brighton, Deer Valley, Solitude

**Acceptance Criteria**:
- [ ] All 6 Utah resorts migrated
- [ ] Famous Utah resorts accessible via public URLs

---

#### Story 15.4: Alaska Data Migration
**Priority**: Medium | **Effort**: Small

Migrate Alaska resort data (11 resorts).

**Source Files**:
- `/regions/us/alaska/*.ts`
- `/regions/us/alaska/region-us-alaska.json`

**Target**:
- `gs://sda-assets-prod/regions/us/alaska/`

**Acceptance Criteria**:
- [ ] All 11 Alaska resorts migrated
- [ ] Alyeska and other Alaska resorts accessible

---

#### Story 15.5: Arizona Data Migration
**Priority**: Medium | **Effort**: Small

Migrate Arizona resort data (3 resorts).

**Source Files**:
- `/regions/us/arizona/*.ts`
- `/regions/us/arizona/region-us-arizona.json`

**Target**:
- `gs://sda-assets-prod/regions/us/arizona/`

**Resorts**:
- Arizona Snowbowl, Sunrise Park, Mt. Lemmon

**Acceptance Criteria**:
- [ ] All 3 Arizona resorts migrated

---

#### Story 15.6: Idaho Data Migration
**Priority**: Medium | **Effort**: Small

Migrate Idaho resort data (1 resort).

**Source Files**:
- `/regions/us/idaho/*.ts`
- `/regions/us/idaho/region-us-idaho.json`

**Target**:
- `gs://sda-assets-prod/regions/us/idaho/`

**Acceptance Criteria**:
- [ ] Idaho resort(s) migrated

---

#### Story 15.7: Montana Data Migration
**Priority**: Medium | **Effort**: Small

Migrate Montana resort data (1 resort).

**Source Files**:
- `/regions/us/montana/*.ts`
- `/regions/us/montana/region-us-montana.json`

**Target**:
- `gs://sda-assets-prod/regions/us/montana/`

**Acceptance Criteria**:
- [ ] Montana resort(s) migrated (Big Sky, Whitefish, etc.)

---

#### Story 15.8: Nevada Data Migration
**Priority**: Medium | **Effort**: Small

Migrate Nevada resort data (1 resort).

**Source Files**:
- `/regions/us/nevada/*.ts`
- `/regions/us/nevada/region-us-nevada.json`

**Target**:
- `gs://sda-assets-prod/regions/us/nevada/`

**Acceptance Criteria**:
- [ ] Nevada resort(s) migrated (Mt. Rose, Lee Canyon, etc.)

---

#### Story 15.9: New Mexico Data Migration
**Priority**: Medium | **Effort**: Small

Migrate New Mexico resort data (1 resort).

**Source Files**:
- `/regions/us/new-mexico/*.ts`
- `/regions/us/new-mexico/region-us-new-mexico.json`

**Target**:
- `gs://sda-assets-prod/regions/us/new-mexico/`

**Acceptance Criteria**:
- [ ] New Mexico resort(s) migrated (Taos, Santa Fe, etc.)

---

#### Story 15.10: Wyoming Data Migration
**Priority**: Medium | **Effort**: Small

Migrate Wyoming resort data (1 resort).

**Source Files**:
- `/regions/us/wyoming/*.ts`
- `/regions/us/wyoming/region-us-wyoming.json`

**Target**:
- `gs://sda-assets-prod/regions/us/wyoming/`

**Acceptance Criteria**:
- [ ] Wyoming resort(s) migrated (Jackson Hole, Grand Targhee, etc.)

---

### Phase 2: United States - Eastern Region

#### Story 15.11: Vermont Data Migration
**Priority**: High | **Effort**: Small

Migrate Vermont resort data (5 resorts - largest Eastern state).

**Source Files**:
- `/regions/us/vermont/*.ts`
- `/regions/us/vermont/region-us-vermont.json`

**Target**:
- `gs://sda-assets-prod/regions/us/vermont/`

**Resorts**:
- Stowe, Killington, Sugarbush, Jay Peak, Okemo

**Acceptance Criteria**:
- [ ] All 5 Vermont resorts migrated
- [ ] Famous Vermont resorts accessible

---

#### Story 15.12: Alabama Data Migration
**Priority**: Low | **Effort**: Small

Migrate Alabama resort data (1 resort).

**Source Files**:
- `/regions/us/alabama/*.ts`
- `/regions/us/alabama/region-us-alabama.json`

**Target**:
- `gs://sda-assets-prod/regions/us/alabama/`

**Acceptance Criteria**:
- [ ] Alabama resort(s) migrated (Cloudmont, etc.)

---

### Phase 3: Canada

#### Story 15.13: British Columbia Data Migration
**Priority**: High | **Effort**: Small

Migrate British Columbia resort data (5 resorts - largest Canadian province).

**Source Files**:
- `/regions/ca/british-columbia/*.ts`
- `/regions/ca/british-columbia/region-ca-british-columbia.json`

**Target**:
- `gs://sda-assets-prod/regions/ca/british-columbia/`

**Resorts**:
- Whistler Blackcomb, Big White, Sun Peaks, Revelstoke, Silver Star

**Acceptance Criteria**:
- [ ] All 5 BC resorts migrated
- [ ] Whistler Blackcomb accessible via public URL

---

#### Story 15.14: Alberta Data Migration
**Priority**: High | **Effort**: Small

Migrate Alberta resort data (2 resorts).

**Source Files**:
- `/regions/ca/alberta/*.ts`
- `/regions/ca/alberta/region-ca-alberta.json`

**Target**:
- `gs://sda-assets-prod/regions/ca/alberta/`

**Resorts**:
- Lake Louise, Sunshine Village, Banff Norquay

**Acceptance Criteria**:
- [ ] All Alberta resorts migrated

---

#### Story 15.15: Ontario Data Migration
**Priority**: Medium | **Effort**: Small

Migrate Ontario resort data (1 resort).

**Source Files**:
- `/regions/ca/ontario/*.ts`
- `/regions/ca/ontario/region-ca-ontario.json`

**Target**:
- `gs://sda-assets-prod/regions/ca/ontario/`

**Acceptance Criteria**:
- [ ] Ontario resort(s) migrated (Blue Mountain, etc.)

---

#### Story 15.16: Quebec Data Migration
**Priority**: Medium | **Effort**: Small

Migrate Quebec resort data (1 resort).

**Source Files**:
- `/regions/ca/quebec/*.ts`
- `/regions/ca/quebec/region-ca-quebec.json`

**Target**:
- `gs://sda-assets-prod/regions/ca/quebec/`

**Acceptance Criteria**:
- [ ] Quebec resort(s) migrated (Mont Tremblant, etc.)

---

### Phase 4: Infrastructure & Tooling

#### Story 15.17: Create Migration Script
**Priority**: High | **Effort**: Medium

Create a reusable Node.js script to automate the migration process.

**Features**:
- Parse TypeScript resort files to JSON
- Generate region metadata (resort count, bounds, statistics)
- Upload to GCS with proper headers
- Support incremental updates
- Validation and error handling

**File**: `/tools/migrate-regions.ts`

**Acceptance Criteria**:
- [ ] Script can process single state/province
- [ ] Script can process all regions in batch
- [ ] Generates valid JSON output
- [ ] Sets correct Cache-Control headers
- [ ] Logs progress and errors

---

#### Story 15.18: Create Region Index
**Priority**: Medium | **Effort**: Small

Create a master index of all regions and resorts.

**Target Files**:
- `gs://sda-assets-prod/regions/index.json` - List of all countries
- `gs://sda-assets-prod/regions/us/index.json` - List of US states
- `gs://sda-assets-prod/regions/ca/index.json` - List of Canadian provinces

**Schema**:
```json
{
  "country": "us",
  "name": "United States",
  "states": [
    { "code": "colorado", "name": "Colorado", "resortCount": 76 },
    { "code": "california", "name": "California", "resortCount": 26 }
  ],
  "totalResorts": 65,
  "lastUpdated": "2025-11-28T00:00:00Z"
}
```

**Acceptance Criteria**:
- [ ] Master index created
- [ ] Country-level indexes created
- [ ] Resort counts accurate
- [ ] Accessible via public URLs

---

#### Story 15.19: Update Application to Use GCS Data
**Priority**: Medium | **Effort**: Medium

Update the Next.js application to fetch resort data from GCS.

**Tasks**:
1. Create data fetching utilities for GCS JSON
2. Add caching layer (SWR or React Query)
3. Update components to use fetched data
4. Implement fallback to local data

**Acceptance Criteria**:
- [ ] App can fetch region data from GCS
- [ ] Caching prevents excessive requests
- [ ] Fallback works when GCS unavailable
- [ ] No performance regression

---

#### Story 15.20: Verification and Documentation
**Priority**: High | **Effort**: Small

Verify all migrations and update documentation.

**Tasks**:
1. Verify all public URLs accessible
2. Validate JSON schema consistency
3. Update GCP-PROJECT-INFO.md
4. Update CLAUDE.md with data layer info
5. Create data model documentation

**Acceptance Criteria**:
- [ ] All URLs return 200 OK
- [ ] JSON validates against schema
- [ ] Documentation updated
- [ ] Migration guide created

---

## Summary Table

| Story | State/Province | Resorts | Priority | Effort |
|-------|---------------|---------|----------|--------|
| 15.1 | Colorado | 76 | High | Medium |
| 15.2 | California | 26 | High | Medium |
| 15.3 | Utah | 6 | High | Small |
| 15.4 | Alaska | 11 | Medium | Small |
| 15.5 | Arizona | 3 | Medium | Small |
| 15.6 | Idaho | 1 | Medium | Small |
| 15.7 | Montana | 1 | Medium | Small |
| 15.8 | Nevada | 1 | Medium | Small |
| 15.9 | New Mexico | 1 | Medium | Small |
| 15.10 | Wyoming | 1 | Medium | Small |
| 15.11 | Vermont | 5 | High | Small |
| 15.12 | Alabama | 1 | Low | Small |
| 15.13 | British Columbia | 5 | High | Small |
| 15.14 | Alberta | 2 | High | Small |
| 15.15 | Ontario | 1 | Medium | Small |
| 15.16 | Quebec | 1 | Medium | Small |
| 15.17 | Migration Script | - | High | Medium |
| 15.18 | Region Index | - | Medium | Small |
| 15.19 | App Integration | - | Medium | Medium |
| 15.20 | Verification | - | High | Small |

**Total Stories**: 20
**Total Resorts**: ~74 active across 16 states/provinces

---

## Execution Order

### Sprint 1: Foundation
1. Story 15.17 - Create Migration Script
2. Story 15.1 - Colorado (largest, proves script)

### Sprint 2: High Priority US States
3. Story 15.2 - California
4. Story 15.3 - Utah
5. Story 15.11 - Vermont

### Sprint 3: Canada
6. Story 15.13 - British Columbia
7. Story 15.14 - Alberta
8. Story 15.15 - Ontario
9. Story 15.16 - Quebec

### Sprint 4: Remaining US States
10. Story 15.4 - Alaska
11. Story 15.5 - Arizona
12. Story 15.6 - Idaho
13. Story 15.7 - Montana
14. Story 15.8 - Nevada
15. Story 15.9 - New Mexico
16. Story 15.10 - Wyoming
17. Story 15.12 - Alabama

### Sprint 5: Integration
18. Story 15.18 - Region Index
19. Story 15.19 - App Integration
20. Story 15.20 - Verification

---

## JSON Schema

### Resort JSON Schema
```json
{
  "id": "resort:vail",
  "slug": "vail",
  "name": "Vail Ski Resort",
  "country": "us",
  "state": "colorado",
  "location": { "lat": 39.6061, "lng": -106.3550 },
  "stats": {
    "skiableAcres": 5289,
    "liftsCount": 31,
    "runsCount": 195,
    "verticalDrop": 3450,
    "baseElevation": 8120,
    "summitElevation": 11570,
    "avgAnnualSnowfall": 354
  },
  "terrain": {
    "beginner": 18,
    "intermediate": 29,
    "advanced": 31,
    "expert": 22
  },
  "passAffiliations": ["epic"],
  "isActive": true,
  "isLost": false,
  "websiteUrl": "https://www.vail.com",
  "assetLocation": {
    "country": "us",
    "state": "colorado",
    "slug": "vail"
  }
}
```

### Region JSON Schema
```json
{
  "code": "colorado",
  "name": "Colorado",
  "country": "us",
  "bounds": {
    "north": 41.0,
    "south": 37.0,
    "east": -102.0,
    "west": -109.0
  },
  "stats": {
    "totalResorts": 76,
    "activeResorts": 32,
    "lostResorts": 44,
    "totalSkiableAcres": 45000,
    "avgSnowfall": 300
  },
  "resorts": ["vail", "breckenridge", "..."],
  "lastUpdated": "2025-11-28T00:00:00Z"
}
```

---

## Cost Estimate

GCS Storage (US multi-region):
- JSON files: ~5 MB total → ~$0.15/month
- Operations: Minimal reads → ~$0.01/month
- **Total**: < $1/month

---

## Dependencies

- Epic 13: GCP Infrastructure Setup ✅
- Epic 14: Initial Asset Migration ✅
- GCS bucket `sda-assets-prod` operational ✅
