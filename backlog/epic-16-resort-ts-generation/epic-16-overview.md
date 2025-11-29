# Epic 16: Generate Missing resort.ts Files

## Status: COMPLETED ✅

**Completed Date**: 2025-11-28

## Overview

Iterate through all resort folders in GCS and generate `resort.ts` files for any resort that doesn't have one. The TypeScript files will be created from the existing `resort.json` data.

## Objective

Ensure every resort folder in `gs://sda-assets-prod/resorts/{country}/{state}/{slug}/` contains both:
- `resort.json` - Resort data (already exists for all 868 resorts)
- `resort.ts` - TypeScript source file (currently missing for many resorts)

## Final Results

- **Total Resorts**: 868
- **resort.ts files**: 868 (100%)
- **resort.json files**: 868 (100%)

All resorts now have both `resort.json` and `resort.ts` files in GCS.

## resort.ts Template

```typescript
/**
 * {Resort Name}
 * Location: {State Name}, {Country Name}
 * Status: {active|defunct}
 */

import type { Resort } from '../../schema/resort.types';

export const resort: Resort = {
  id: '{id}',
  slug: '{slug}',
  name: '{name}',
  // ... all fields from resort.json
};

export default resort;
```

## Stories by State/Province

### United States (38 states)

| Story | State | Resorts | Priority |
|-------|-------|---------|----------|
| 16.1 | Colorado | 76 | High |
| 16.2 | California | 53 | High |
| 16.3 | Utah | ~15 | High |
| 16.4 | Vermont | ~20 | Medium |
| 16.5 | Montana | ~15 | Medium |
| 16.6 | Wyoming | ~12 | Medium |
| 16.7 | New Hampshire | ~20 | Medium |
| 16.8 | Maine | ~15 | Medium |
| 16.9 | New York | ~40 | Medium |
| 16.10 | Michigan | ~35 | Medium |
| 16.11 | Washington | ~15 | Medium |
| 16.12 | Oregon | ~12 | Medium |
| 16.13 | Idaho | 23 | Medium |
| 16.14 | New Mexico | ~10 | Low |
| 16.15 | Arizona | 5 | Low |
| 16.16 | Nevada | ~8 | Low |
| 16.17 | Alaska | 11 | Low |
| 16.18 | Pennsylvania | ~25 | Low |
| 16.19 | Minnesota | ~20 | Low |
| 16.20 | Wisconsin | ~20 | Low |
| 16.21 | Massachusetts | ~15 | Low |
| 16.22 | Connecticut | 10 | Low |
| 16.23 | Ohio | ~10 | Low |
| 16.24 | Illinois | 7 | Low |
| 16.25 | Indiana | 5 | Low |
| 16.26 | Iowa | 7 | Low |
| 16.27 | Missouri | ~5 | Low |
| 16.28 | North Dakota | ~3 | Low |
| 16.29 | South Dakota | ~5 | Low |
| 16.30 | New Jersey | ~5 | Low |
| 16.31 | North Carolina | ~8 | Low |
| 16.32 | Virginia | ~8 | Low |
| 16.33 | West Virginia | ~5 | Low |
| 16.34 | Maryland | ~3 | Low |
| 16.35 | Rhode Island | ~2 | Low |
| 16.36 | Alabama | 1 | Low |
| 16.37 | Georgia | 1 | Low |
| 16.38 | Tennessee | ~3 | Low |

### Canada (11 provinces)

| Story | Province | Resorts | Priority |
|-------|----------|---------|----------|
| 16.39 | British Columbia | 36 | High |
| 16.40 | Alberta | 23 | High |
| 16.41 | Quebec | 51 | High |
| 16.42 | Ontario | 40 | Medium |
| 16.43 | Manitoba | 9 | Low |
| 16.44 | Saskatchewan | 10 | Low |
| 16.45 | New Brunswick | 6 | Low |
| 16.46 | Nova Scotia | 6 | Low |
| 16.47 | Newfoundland and Labrador | 4 | Low |
| 16.48 | Prince Edward Island | 3 | Low |
| 16.49 | Yukon | 2 | Low |

### Infrastructure Stories

| Story | Description | Priority |
|-------|-------------|----------|
| 16.50 | Create TS generation script | High |
| 16.51 | Verification and reporting | Medium |

## Technical Approach

### Story 16.50: Create TS Generation Script

1. Add new function to `tools/migrate-regions/` to:
   - List all resort folders in GCS
   - Check if `resort.ts` exists
   - If missing, fetch `resort.json`
   - Generate `resort.ts` from template
   - Upload to GCS

2. CLI options:
   ```bash
   npx ts-node src/index.ts --generate-ts --state colorado --country us
   npx ts-node src/index.ts --generate-ts --all
   npx ts-node src/index.ts --generate-ts --dry-run
   ```

### Template Generation

The generated `resort.ts` should:
- Import the `Resort` type from schema
- Export a typed `resort` constant
- Include a header comment with resort info
- Pretty-print all JSON fields as TypeScript

## Acceptance Criteria

- [x] Every resort folder contains both `resort.json` and `resort.ts`
- [x] Generated TS files are valid TypeScript
- [x] Generated TS files match the Resort type definition
- [x] All 868 resorts have TS files after completion

## Dependencies

- Epic 15: National Data Migration (completed)
- Schema files in `gs://sda-assets-prod/resorts/schema/`

## Estimated Effort

- Script development: 1-2 hours
- Running generation for all states: 1-2 hours
- Verification: 30 minutes

Total: ~4 hours
