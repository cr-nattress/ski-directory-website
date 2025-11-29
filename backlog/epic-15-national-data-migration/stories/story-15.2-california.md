# Story 15.2: California Data Migration

**Epic**: 15 - National Resort Data Migration
**Priority**: High
**Effort**: Medium
**State**: California (US)
**Resort Count**: 26

## Description

Migrate California resort data to GCP Cloud Storage. California has the second-largest number of resorts in the US dataset.

## Source Files

```
/regions/us/california/*.ts                    # Individual resort files
/regions/us/california/region-us-california.json  # Region metadata
```

## Target GCS Structure

```
gs://sda-assets-prod/regions/us/california/
├── region.json
├── resorts.json
└── resorts/
    ├── mammoth-mountain.json
    ├── squaw-valley.json
    ├── heavenly.json
    ├── kirkwood.json
    └── ... (22 more)
```

## Tasks

1. [ ] Parse TypeScript resort files to JSON
2. [ ] Generate individual resort JSON files
3. [ ] Create aggregated `resorts.json`
4. [ ] Create `region.json` with metadata
5. [ ] Upload to GCS
6. [ ] Set Cache-Control headers
7. [ ] Verify public URLs

## Notable Resorts

- Mammoth Mountain
- Palisades Tahoe (formerly Squaw Valley)
- Heavenly
- Kirkwood
- Northstar
- Sugar Bowl
- Alpine Meadows
- Bear Mountain
- Big Bear
- Snow Summit
- Mountain High
- June Mountain
- Sierra-at-Tahoe
- Dodge Ridge
- China Peak

## Public URLs

```
https://storage.googleapis.com/sda-assets-prod/regions/us/california/region.json
https://storage.googleapis.com/sda-assets-prod/regions/us/california/resorts.json
https://storage.googleapis.com/sda-assets-prod/regions/us/california/resorts/mammoth-mountain.json
```

## Acceptance Criteria

- [ ] All 26 California resorts migrated
- [ ] Individual and aggregated JSON files created
- [ ] Region metadata includes Tahoe and SoCal areas
- [ ] Public URLs accessible
- [ ] Proper cache headers set

## Notes

- California spans two major ski regions: Lake Tahoe and Southern California
- Several resorts are part of Epic/Ikon pass networks
- Palisades Tahoe was renamed from Squaw Valley in 2021
