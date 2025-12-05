# AI Resort Data Enricher

Automated AI-powered enrichment of ski resort data using OpenAI GPT-4o. This tool aggregates data from multiple GCS sources (Wikipedia, Liftie, OnTheSnow) and uses OpenAI to generate enriched resort information.

## Features

- **Multi-source aggregation**: Combines data from Wikipedia, Liftie, OnTheSnow, and SkiResortInfo
- **AI-powered content generation**: Creates compelling taglines and descriptions
- **Stats extraction**: Extracts terrain percentages, lift counts, vertical drop, etc.
- **Confidence scoring**: Each field includes a confidence score for quality control
- **Incremental processing**: Resume support and skip-existing functionality
- **Cost tracking**: Detailed OpenAI API cost monitoring
- **Dry-run mode**: Preview changes before applying

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# List resorts with data
npm run dev -- --list

# Dry-run test on a single resort
npm run dev -- --filter vail

# Process all resorts (apply changes)
npm run dev -- --apply
```

## Prerequisites

- Node.js 18+
- OpenAI API key (with GPT-4o access)
- GCS service account with read/write access to `sda-assets-prod`
- Supabase service role key

## Installation

1. Navigate to the enricher directory:
   ```bash
   cd apps/updaters/ai-enricher
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment template:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables (see Configuration section)

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o` | Model to use |
| `SUPABASE_URL` | Yes | - | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | - | Service role key |
| `GCS_BUCKET_NAME` | No | `sda-assets-prod` | GCS bucket |
| `GCS_KEY_FILE` | Yes | - | Path to GCS service account JSON |
| `MIN_CONFIDENCE` | No | `0.7` | Minimum confidence threshold |
| `DRY_RUN` | No | `true` | Enable dry-run by default |

## Usage

### CLI Options

```
Processing Options:
  --filter, -f <pattern>     Filter resorts by name/slug/state
  --limit, -l <number>       Process only N resorts
  --skip, -s <number>        Skip first N resorts
  --skip-existing            Skip resorts with existing enrichment
  --overwrite                Overwrite existing enrichment files
  --resume                   Resume from last successful run
  --dry-run                  Preview without writing (default)
  --apply, -a                Apply changes to GCS/Supabase

Quality Options:
  --min-confidence, -c <n>   Minimum confidence threshold (0.0-1.0)

Listing Options:
  --list                     List all resorts with GCS data
  --list-enriched            List resorts with existing enrichment

Other:
  --verbose, -v              Show detailed output
  --help, -h                 Show help
```

### Example Commands

```bash
# List resorts with data
npm run dev -- --list

# Dry run for a single resort
npm run dev -- --filter vail

# Process with verbose output
npm run dev -- --limit 5 --verbose

# Apply changes for Colorado resorts
npm run dev -- --filter colorado --apply

# Resume interrupted processing
npm run dev -- --resume --apply

# Skip already enriched resorts
npm run dev -- --skip-existing --apply

# Higher confidence threshold
npm run dev -- --min-confidence 0.85 --apply
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI (index.ts)                        │
│                    Parse args, configure                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Processor (processor.ts)                   │
│              Orchestrates the enrichment loop                │
└───────┬─────────────┬─────────────┬─────────────┬───────────┘
        │             │             │             │
┌───────▼───────┐ ┌───▼───┐ ┌───────▼───────┐ ┌───▼───────────┐
│  GCS Reader   │ │OpenAI │ │  GCS Writer   │ │   Supabase    │
│   (gcs.ts)    │ │(openai│ │   (gcs.ts)    │ │ (supabase.ts) │
└───────────────┘ │ .ts)  │ └───────────────┘ └───────────────┘
                  └───────┘
```

## Output Format

### GCS Output (`ai-enrichment.json`)

```json
{
  "slug": "vail",
  "assetPath": "us/colorado/vail",
  "enrichment": {
    "content": {
      "tagline": {
        "value": "World-class skiing in the heart of the Rockies",
        "confidence": 0.92
      },
      "description": {
        "value": "Vail Mountain offers over 5,300 acres...",
        "confidence": 0.88
      }
    },
    "stats": {
      "liftsCount": { "value": 31, "confidence": 0.95 },
      "runsCount": { "value": 195, "confidence": 0.90 },
      "verticalDrop": { "value": 3450, "confidence": 0.95 }
    },
    "terrain": {
      "beginner": { "value": 18, "confidence": 0.85 },
      "intermediate": { "value": 29, "confidence": 0.85 },
      "advanced": { "value": 53, "confidence": 0.85 }
    }
  },
  "metadata": {
    "version": "1.0.0",
    "processedAt": "2025-12-04T05:30:00Z",
    "model": "gpt-4o",
    "estimatedCost": 0.0275
  }
}
```

## Cost Estimation

### Per-Resort Costs (GPT-4o)

| Component | Tokens | Cost |
|-----------|--------|------|
| Input (prompt + data) | ~1,500 | $0.00375 |
| Output (JSON response) | ~800 | $0.008 |
| **Total per resort** | ~2,300 | **~$0.012** |

### Bulk Processing Estimates

| Resorts | Estimated Cost | Time |
|---------|---------------|------|
| 10 | $0.12 | ~35 sec |
| 50 | $0.60 | ~3 min |
| 100 | $1.20 | ~6 min |
| 500 | $6.00 | ~30 min |

Cost reports are saved to GCS:
```
sda-assets-prod/resorts/_processing/cost-reports/{timestamp}.json
```

## Confidence Scoring

Each extracted field includes a confidence score (0.0 - 1.0):

- **0.9+**: Explicitly stated in source data
- **0.7-0.9**: Inferred with high certainty
- **0.5-0.7**: Reasonable estimate
- **<0.5**: Low confidence, likely skipped

Fields below the `--min-confidence` threshold are not applied to Supabase.

## Troubleshooting

### "Missing OPENAI_API_KEY"

Ensure your `.env` file exists and contains a valid API key.

### "Rate limited by OpenAI"

The tool includes automatic retry with exponential backoff. If issues persist, reduce processing with `--limit 5`.

### "No Wikipedia data for resort"

Some resorts lack Wikipedia pages. Check available data with `--list`.

### "GCS permission denied"

Ensure your service account has `storage.objects.get` and `storage.objects.create` permissions.

## Development

```bash
# Build TypeScript
npm run build

# Run from compiled JS
npm start -- --help

# Development mode (tsx)
npm run dev -- --help
```

## Related Updaters

- `wikidata-enricher`: Enriches from Wikipedia data only
- `wikipedia-updater`: Fetches Wikipedia data to GCS
- `liftie-sync`: Syncs real-time lift status from Liftie.info

## License

MIT
