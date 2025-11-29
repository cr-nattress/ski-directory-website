# Story 15.1: Colorado Data Migration

**Epic**: 15 - National Resort Data Migration
**Priority**: High
**Effort**: Medium
**State**: Colorado (US)
**Resort Count**: 76 (32 active, 44 lost/defunct)

## Description

Migrate Colorado resort data to GCP Cloud Storage. Colorado is the largest dataset and serves as the primary test case for the migration script.

## Source Files

```
/apps/v1/lib/mock-data/resorts.ts     # Primary source (76 resorts, enhanced data)
/regions/us/colorado/*.ts              # Individual resort files (8)
/regions/us/colorado/region-us-colorado.json  # Region metadata
```

## Target GCS Structure

```
gs://sda-assets-prod/regions/us/colorado/
├── region.json                        # Region metadata & stats
├── resorts.json                       # All 76 resorts in single file
└── resorts/
    ├── vail.json
    ├── breckenridge.json
    ├── aspen-mountain.json
    ├── snowmass.json
    ├── beaver-creek.json
    ├── steamboat.json
    ├── telluride.json
    ├── winter-park.json
    └── ... (68 more)
```

## Tasks

1. [ ] Export Colorado resorts from `resorts.ts` to JSON format
2. [ ] Generate individual resort JSON files
3. [ ] Create aggregated `resorts.json` with all resorts
4. [ ] Create `region.json` with metadata and statistics
5. [ ] Upload all files to GCS
6. [ ] Set Cache-Control headers (5 min for JSON)
7. [ ] Verify public URL access

## Resorts to Migrate

### Active Resorts (32)
- Arapahoe Basin
- Aspen Highlands
- Aspen Mountain
- Beaver Creek
- Breckenridge
- Buttermilk
- Chapman Hill
- Copper Mountain
- Cranor Hill
- Crested Butte
- Echo Mountain
- Eldora
- Granby Ranch
- Hesperus
- Hoedown Hill
- Howelsen Hill
- Kendall Mountain
- Keystone
- Lake City Ski Hill
- Lee's Ski Hill
- Loveland
- Monarch Mountain
- Powderhorn
- Purgatory
- Silverton Mountain
- Ski Cooper
- Snowmass
- Steamboat
- Sunlight Mountain
- Telluride
- Vail
- Winter Park
- Wolf Creek

### Lost/Defunct Resorts (44)
- Adams Rib, Arapahoe East, Arrowhead, Baker Mountain, Berthoud Pass...
- (Full list in region metadata)

## Public URLs

```
https://storage.googleapis.com/sda-assets-prod/regions/us/colorado/region.json
https://storage.googleapis.com/sda-assets-prod/regions/us/colorado/resorts.json
https://storage.googleapis.com/sda-assets-prod/regions/us/colorado/resorts/vail.json
```

## Acceptance Criteria

- [ ] All 76 Colorado resorts exported to valid JSON
- [ ] Individual resort files created for each resort
- [ ] Aggregated `resorts.json` contains all resorts
- [ ] `region.json` includes:
  - [ ] Resort counts (total, active, lost)
  - [ ] Geographic bounds
  - [ ] Aggregate statistics
  - [ ] List of resort slugs
- [ ] All files accessible via public URLs
- [ ] Cache-Control: `public, max-age=300`
- [ ] Content-Type: `application/json`

## Verification

```bash
# Test region metadata
curl "https://storage.googleapis.com/sda-assets-prod/regions/us/colorado/region.json"

# Test individual resort
curl "https://storage.googleapis.com/sda-assets-prod/regions/us/colorado/resorts/vail.json"

# Test aggregated file
curl "https://storage.googleapis.com/sda-assets-prod/regions/us/colorado/resorts.json" | jq '.resorts | length'
# Expected: 76
```

## Notes

- Colorado is the primary data source for the current application
- This story validates the migration script before applying to other states
- Includes both active resorts and historical/lost ski areas
- Enhanced data includes weather, social media, trail maps, nearby amenities
