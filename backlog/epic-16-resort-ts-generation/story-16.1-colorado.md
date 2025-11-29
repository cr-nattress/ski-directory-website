# Story 16.1: Generate resort.ts for Colorado Resorts

## Description

Generate missing `resort.ts` files for all Colorado ski resorts.

## State Info

- **Country**: United States (us)
- **State**: Colorado (colorado)
- **Total Resorts**: 76
- **Active**: 33
- **Defunct**: 43

## Resorts

### Active Resorts
- Arapahoe Basin
- Aspen Highlands
- Aspen Mountain
- Beaver Creek
- Breckenridge
- Buttermilk
- Chapman Hill Ski Area
- Copper Mountain
- Cranor Ski Hill
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
- Monarch
- Powderhorn
- Purgatory
- Silverton
- Ski Cooper
- Snowmass
- Steamboat
- Sunlight Mountain
- Telluride
- Vail
- Winter Park
- Wolf Creek

### Defunct Resorts
- Adam's Rib
- Arapahoe East
- Arrowhead
- Baker Mountain
- Berthoud Pass
- Bluebird Backcountry
- Climax
- Coal Bank Pass
- Conquistador
- Cuchara Valley
- Emerald Mountain
- Fern Lake
- Geneva Basin
- Hidden Valley
- Hoosier Pass
- Idlewild
- Ironton Park
- Jones Pass
- Libby Creek
- Little Annie
- Lizard Head Pass
- Marble Mountain
- Marshall Pass
- Meadow Mountain
- Mesa Creek
- Montezuma Basin
- Mount Lugo
- Peak One
- Pikes Peak
- Pioneer
- Porcupine Gulch
- Red Mountain
- Rock Creek
- Rozman Hill
- Saint Mary's Glacier
- Seven Utes Mountain
- Sharktooth
- Ski Broadmoor
- Ski Dallas
- Steamboat Lake
- Stoner
- White Pine
- Wolf Creek Pass

## Acceptance Criteria

- [x] All 76 Colorado resorts have `resort.ts` files
- [x] Generated files are valid TypeScript
- [x] Files uploaded to `gs://sda-assets-prod/resorts/us/colorado/{slug}/resort.ts`

## Completed

- **Date**: 2025-11-28
- **Result**: 76 resort.ts files now exist
  - 8 original files (uploaded during migration)
  - 68 generated files (from resort.json data)

## Command

```bash
npx ts-node src/index.ts --generate-ts --state colorado --country us --verbose
```

## Verification

```bash
# Count TS files in Colorado
gsutil ls "gs://sda-assets-prod/resorts/us/colorado/*/resort.ts" | wc -l
# Expected: 76
```
