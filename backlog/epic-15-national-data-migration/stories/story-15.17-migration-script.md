# Story 15.17: Create Migration Script

**Epic**: 15 - National Resort Data Migration
**Priority**: High
**Effort**: Medium
**Type**: Tooling

## Description

Create a reusable Node.js/TypeScript script to automate the migration of resort data from local files to GCP Cloud Storage.

## Requirements

### Input Sources
- TypeScript resort files (`/regions/{country}/{state}/*.ts`)
- JSON region metadata files (`region-{country}-{state}.json`)
- Enhanced resort data (`/apps/v1/lib/mock-data/resorts.ts`)

### Output Targets
- Individual resort JSON files
- Aggregated state/province resort files
- Region metadata files
- Master index files

## Script Location

```
/tools/migrate-regions/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Main CLI entry point
│   ├── parser.ts          # Parse TS files to JSON
│   ├── uploader.ts        # GCS upload logic
│   ├── generator.ts       # Generate metadata/indexes
│   ├── validator.ts       # JSON schema validation
│   └── types.ts           # TypeScript interfaces
└── README.md
```

## CLI Interface

```bash
# Migrate single state
npx migrate-regions --state colorado --country us

# Migrate single province
npx migrate-regions --state british-columbia --country ca

# Migrate all regions
npx migrate-regions --all

# Dry run (no upload)
npx migrate-regions --state colorado --dry-run

# Validate only
npx migrate-regions --state colorado --validate-only

# Generate indexes only
npx migrate-regions --indexes-only
```

## Features

### Core Features
1. **Parse TypeScript to JSON**
   - Extract resort objects from TS files
   - Handle imports and exports
   - Preserve all data fields

2. **Generate Metadata**
   - Calculate resort counts
   - Compute geographic bounds
   - Aggregate statistics (acres, snowfall, etc.)

3. **Upload to GCS**
   - Use `@google-cloud/storage` SDK
   - Set correct Content-Type
   - Set Cache-Control headers
   - Support parallel uploads

4. **Validation**
   - JSON schema validation
   - Required field checking
   - Data type verification

### Advanced Features
5. **Incremental Updates**
   - Compare local vs remote
   - Only upload changed files
   - Track last sync timestamp

6. **Error Handling**
   - Retry failed uploads
   - Detailed error logging
   - Rollback support

7. **Reporting**
   - Progress indicators
   - Summary statistics
   - Error reports

## Dependencies

```json
{
  "dependencies": {
    "@google-cloud/storage": "^7.0.0",
    "commander": "^11.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "ajv": "^8.0.0",
    "chalk": "^5.0.0",
    "ora": "^7.0.0"
  }
}
```

## Configuration

```typescript
// config.ts
export const config = {
  bucket: 'sda-assets-prod',
  basePath: 'regions',
  cacheControl: {
    json: 'public, max-age=300',
    index: 'public, max-age=60'
  },
  sources: {
    regions: './regions',
    mockData: './apps/v1/lib/mock-data'
  }
};
```

## Output Schema

### Individual Resort
```json
{
  "id": "resort:vail",
  "slug": "vail",
  "name": "Vail Ski Resort",
  "country": "us",
  "state": "colorado",
  "location": { "lat": 39.6061, "lng": -106.3550 },
  "stats": { ... },
  "terrain": { ... },
  "isActive": true,
  "isLost": false
}
```

### Region Metadata
```json
{
  "code": "colorado",
  "name": "Colorado",
  "country": "us",
  "stats": {
    "totalResorts": 76,
    "activeResorts": 32,
    "lostResorts": 44
  },
  "bounds": { ... },
  "resorts": ["vail", "breckenridge", ...],
  "lastUpdated": "2025-11-28T00:00:00Z"
}
```

## Tasks

1. [ ] Initialize Node.js project with TypeScript
2. [ ] Implement TS-to-JSON parser
3. [ ] Implement GCS uploader with SDK
4. [ ] Implement metadata generator
5. [ ] Implement JSON schema validator
6. [ ] Add CLI with commander
7. [ ] Add progress indicators
8. [ ] Write unit tests
9. [ ] Create documentation
10. [ ] Test with Colorado data

## Acceptance Criteria

- [ ] Script can parse TypeScript resort files
- [ ] Script generates valid JSON output
- [ ] Script uploads to GCS successfully
- [ ] Script sets correct headers
- [ ] CLI supports all documented options
- [ ] Dry-run mode works without uploading
- [ ] Error handling is robust
- [ ] Progress is displayed during execution
- [ ] Documentation is complete

## Verification

```bash
# Test parse
npx migrate-regions --state colorado --dry-run --verbose

# Test upload
npx migrate-regions --state colorado

# Verify upload
curl "https://storage.googleapis.com/sda-assets-prod/regions/us/colorado/region.json"
```

## Notes

- Use Application Default Credentials for GCS auth
- Consider adding GitHub Actions workflow for CI/CD
- May need to handle circular imports in TS files
- Large files should use resumable uploads
