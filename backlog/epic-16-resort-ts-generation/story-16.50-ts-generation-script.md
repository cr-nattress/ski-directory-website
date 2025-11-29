# Story 16.50: Create TypeScript Generation Script

## Description

Create a script to generate `resort.ts` files from existing `resort.json` data for resorts that don't have TypeScript source files.

## Acceptance Criteria

- [x] Script can list all resort folders in GCS
- [x] Script can detect which resorts are missing `resort.ts`
- [x] Script generates valid TypeScript from `resort.json`
- [x] Script uploads generated files to correct GCS location
- [x] Supports `--dry-run` mode
- [x] Supports filtering by `--state` and `--country`
- [x] Reports summary of generated files

## Completed

- **Date**: 2025-11-28
- **Files Created**:
  - `tools/migrate-regions/src/generator.ts` - TypeScript generation logic
  - Updated `tools/migrate-regions/src/index.ts` - Added `--generate-ts` command

## Technical Details

### New Files

Add to `tools/migrate-regions/src/`:

1. `generator.ts` - TypeScript generation logic
2. Update `index.ts` - Add `--generate-ts` command

### Template Format

```typescript
/**
 * {Resort Name}
 * Location: {State Name}, {Country Name}
 * Status: {status}
 *
 * GCS Path: gs://sda-assets-prod/resorts/{country}/{state}/{slug}/
 * Generated: {timestamp}
 */

import type { Resort } from '../../../schema/resort.types';

export const resort: Resort = {
  id: '{id}',
  slug: '{slug}',
  name: '{name}',
  country: '{country}',
  countryName: '{countryName}',
  state: '{state}',
  stateName: '{stateName}',
  status: '{status}',
  isActive: {isActive},
  isLost: {isLost},
  location: {location},
  nearestCity: {nearestCity},
  stats: {stats},
  terrain: {terrain},
  passAffiliations: {passAffiliations},
  features: {features},
  websiteUrl: {websiteUrl},
  description: {description},
  tags: {tags},
  assetLocation: {assetLocation},
  lastUpdated: '{lastUpdated}',
};

export default resort;
```

### CLI Commands

```bash
# Generate for specific state
npx ts-node src/index.ts --generate-ts --state colorado --country us

# Generate for all resorts
npx ts-node src/index.ts --generate-ts --all

# Dry run (no uploads)
npx ts-node src/index.ts --generate-ts --all --dry-run

# Verbose output
npx ts-node src/index.ts --generate-ts --all --verbose
```

### Algorithm

1. List all folders in `gs://sda-assets-prod/resorts/{country}/{state}/`
2. For each resort folder:
   a. Check if `resort.ts` exists
   b. If exists, skip
   c. If missing:
      - Fetch `resort.json`
      - Generate TypeScript from template
      - Upload `resort.ts`
3. Report summary

### GCS Operations

```typescript
// Check if file exists
async function fileExists(gcsPath: string): Promise<boolean>

// Fetch JSON file
async function fetchJson(gcsPath: string): Promise<unknown>

// Generate TS content
function generateTypeScript(resort: Resort): string

// Upload TS file
async function uploadTs(gcsPath: string, content: string): Promise<boolean>
```

## Testing

1. Run with `--dry-run` first
2. Verify generated TypeScript is valid
3. Check uploaded files in GCS console
4. Validate against schema types

## Dependencies

- `@google-cloud/storage` (already installed)
- Schema types from `schemas/resort.types.ts`
