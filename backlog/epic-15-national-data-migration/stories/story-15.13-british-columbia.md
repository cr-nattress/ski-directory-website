# Story 15.13: British Columbia Data Migration

**Epic**: 15 - National Resort Data Migration
**Priority**: High
**Effort**: Small
**Province**: British Columbia (Canada)
**Resort Count**: 5

## Description

Migrate British Columbia resort data to GCP Cloud Storage. BC is the largest Canadian province in the dataset and home to world-famous Whistler Blackcomb.

## Source Files

```
/regions/ca/british-columbia/*.ts                        # Individual resort files
/regions/ca/british-columbia/region-ca-british-columbia.json  # Region metadata
```

## Target GCS Structure

```
gs://sda-assets-prod/regions/ca/british-columbia/
├── region.json
├── resorts.json
└── resorts/
    ├── whistler-blackcomb.json
    ├── big-white.json
    ├── sun-peaks.json
    ├── revelstoke.json
    └── silver-star.json
```

## Tasks

1. [ ] Parse TypeScript resort files to JSON
2. [ ] Generate individual resort JSON files
3. [ ] Create aggregated `resorts.json`
4. [ ] Create `region.json` with metadata
5. [ ] Upload to GCS
6. [ ] Set Cache-Control headers
7. [ ] Verify public URLs

## Resorts

| Resort | Notable Features |
|--------|------------------|
| Whistler Blackcomb | Largest ski resort in North America |
| Big White | Major Okanagan resort |
| Sun Peaks | Second largest in BC |
| Revelstoke | Biggest vertical in North America |
| Silver Star | Family-friendly Okanagan resort |

## Public URLs

```
https://storage.googleapis.com/sda-assets-prod/regions/ca/british-columbia/region.json
https://storage.googleapis.com/sda-assets-prod/regions/ca/british-columbia/resorts.json
https://storage.googleapis.com/sda-assets-prod/regions/ca/british-columbia/resorts/whistler-blackcomb.json
```

## Acceptance Criteria

- [ ] All 5 BC resorts migrated
- [ ] Whistler Blackcomb data complete and accurate
- [ ] Region metadata includes Canadian-specific fields
- [ ] Public URLs accessible
- [ ] Proper cache headers set

## Notes

- Whistler Blackcomb is on the Epic Pass
- BC uses metric system (convert elevations if needed)
- Consider CAD pricing fields for future enhancement
