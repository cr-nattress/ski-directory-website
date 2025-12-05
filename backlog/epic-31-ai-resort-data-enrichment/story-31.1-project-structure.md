# Story 31.1: Create AI Enrichment Updater Project Structure

## Description

Create a new updater application in `apps/updaters/ai-enricher/` that follows the established patterns from existing updaters (wikipedia-updater, wikidata-enricher, liftie-sync).

## Acceptance Criteria

- [ ] New directory `apps/updaters/ai-enricher/` created
- [ ] `package.json` with required dependencies
- [ ] TypeScript configuration (`tsconfig.json`)
- [ ] Source directory structure (`src/`)
- [ ] Environment configuration (`.env.example`)
- [ ] Entry point (`src/index.ts`)

## Technical Details

### Directory Structure

```
apps/updaters/ai-enricher/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts         # Main entry point with CLI
    ├── config.ts        # Environment configuration
    ├── types.ts         # Type definitions
    ├── gcs.ts           # GCS read/write operations
    ├── openai.ts        # OpenAI API integration
    ├── supabase.ts      # Supabase update operations
    ├── aggregator.ts    # Aggregates all resort data
    ├── mapper.ts        # Maps AI output to Supabase schema
    └── output.ts        # Console output formatting
```

### package.json

```json
{
  "name": "ai-enricher",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "tsx src/index.ts",
    "dev": "tsx watch src/index.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@google-cloud/storage": "^7.7.0",
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.1",
    "openai": "^4.20.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

### .env.example

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GCS Configuration
GCS_BUCKET_NAME=sda-assets-prod
GCS_KEY_FILE=../../../gcp/service-account-key.json

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o

# Processing Configuration
MIN_CONFIDENCE=0.7
DRY_RUN=true
DELAY_MS=500
```

## Tasks

- [ ] Create directory structure
- [ ] Initialize package.json with dependencies
- [ ] Create tsconfig.json (copy from wikidata-enricher)
- [ ] Create .env.example
- [ ] Create placeholder source files with exports
- [ ] Verify `npm install` succeeds
- [ ] Verify `npm run typecheck` succeeds

## Effort

**Size:** M (Medium - 2-4 hours)

## Dependencies

None - this is the foundation story.

## References

- [Wikidata Enricher Structure](../../apps/updaters/wikidata-enricher/)
- [Wikipedia Updater Structure](../../apps/updaters/wikipedia-updater/)
