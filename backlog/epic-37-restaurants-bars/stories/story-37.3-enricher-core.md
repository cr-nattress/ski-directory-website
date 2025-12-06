# Story 37.3: Dining Enricher - Core Service

## Description

Create the main dining enricher service that orchestrates the enrichment workflow: fetching resorts, calling OpenAI, validating responses, and saving to database.

## Acceptance Criteria

- [ ] `dining-enricher/` project structure created
- [ ] Package.json with dependencies (typescript, supabase, openai, zod, etc.)
- [ ] Config management for environment variables
- [ ] Main enricher class with orchestration logic
- [ ] Supabase service for database operations
- [ ] GCS service for audit trail storage
- [ ] Logger utility with structured output
- [ ] Rate limiter for API calls

## Project Structure

```
apps/updaters/dining-enricher/
├── src/
│   ├── enricher/
│   │   ├── dining-enricher.ts      # Main orchestrator
│   │   ├── response-parser.ts      # Validate & parse OpenAI responses
│   │   └── deduplicator.ts         # Prevent duplicate venues
│   ├── services/
│   │   ├── supabase.ts             # Database operations
│   │   ├── openai.ts               # OpenAI API calls
│   │   ├── gcs.ts                  # Cloud storage
│   │   └── geocoding.ts            # Coordinate validation
│   ├── utils/
│   │   ├── logger.ts               # Structured logging
│   │   ├── rate-limiter.ts         # API rate limiting
│   │   └── slug.ts                 # URL-safe slugs
│   ├── config.ts                   # Environment config
│   ├── types.ts                    # TypeScript interfaces
│   └── index.ts                    # CLI entry point
├── supabase/
│   └── migrations/
│       └── 001_create_dining_tables.sql
├── package.json
├── tsconfig.json
├── .env.example
└── DINING_ENRICHER_PLAN.md
```

## Core Enricher Logic

```typescript
// dining-enricher.ts
export class DiningEnricher {
  async enrichResort(resort: Resort): Promise<EnrichmentResult> {
    const startTime = Date.now();

    try {
      // 1. Build OpenAI prompt with resort location
      const prompt = this.buildPrompt(resort);

      // 2. Call OpenAI API
      const response = await this.openai.complete(prompt);

      // 3. Parse and validate response
      const venues = await this.parser.parse(response, resort);

      // 4. Deduplicate against existing venues
      const uniqueVenues = await this.deduplicator.process(venues);

      // 5. Upsert venues to database
      const savedVenues = await this.supabase.upsertVenues(uniqueVenues);

      // 6. Link venues to resort
      await this.supabase.linkVenuesToResort(resort.id, savedVenues);

      // 7. Save audit trail to GCS
      await this.gcs.saveEnrichmentResult(resort, response, venues);

      // 8. Log enrichment result
      await this.supabase.logEnrichment({
        resort_id: resort.id,
        status: 'success',
        venues_found: venues.length,
        venues_created: savedVenues.filter(v => v.isNew).length,
        // ...
      });

      return { success: true, venues: savedVenues };
    } catch (error) {
      await this.handleError(resort, error);
      return { success: false, error };
    }
  }

  async enrichAll(options: EnrichOptions): Promise<void> {
    const resorts = await this.supabase.getResortsToEnrich(options);

    for (const resort of resorts) {
      await this.rateLimiter.wait();
      await this.enrichResort(resort);
    }
  }
}
```

## Environment Variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4-turbo  # or gpt-4o

# Google Cloud Storage
GCS_BUCKET=ski-directory-assets
GCS_CREDENTIALS_PATH=

# Enricher Settings
DEFAULT_SEARCH_RADIUS_MILES=5
MAX_VENUES_PER_RESORT=30
RATE_LIMIT_DELAY_MS=2000
```

## Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "openai": "^4.x",
    "@google-cloud/storage": "^7.x",
    "zod": "^3.x",
    "commander": "^11.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tsx": "^4.x",
    "@types/node": "^20.x"
  }
}
```

## Effort

Large (4-6 hours)
