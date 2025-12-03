# Wikidata Enricher

Enriches ski resort data using OpenAI to extract and format Wikipedia data from GCS. Generates compelling taglines, detailed descriptions, and extracts statistics for each resort.

## Features

- **Content Generation**: Creates unique taglines and detailed descriptions for each resort
- **Data Extraction**: Extracts statistics (acres, lifts, runs, elevation, snowfall)
- **Confidence Scoring**: Each extracted value includes a confidence score
- **Dry Run Mode**: Preview changes before applying to Supabase
- **Selective Updates**: Skip fields that already have values

## Prerequisites

- Node.js 18+
- Access to GCS bucket with wiki-data.json files (created by `wikipedia-updater`)
- OpenAI API key
- Supabase service role key

## Setup

1. Install dependencies:

```bash
cd apps/updaters/wikidata-enricher
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Configure environment variables:

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-api-key

# Optional
GCS_BUCKET_NAME=sda-assets-prod
GCS_KEY_FILE=../../../gcp/service-account-key.json
OPENAI_MODEL=gpt-4o
MIN_CONFIDENCE=0.7
```

## Usage

### List resorts with wiki data

```bash
npm run dev -- --list
```

### Process a single resort (dry run)

```bash
npm run dev -- --filter vail
```

### Process multiple resorts with verbose output

```bash
npm run dev -- --limit 5 --verbose
```

### Apply changes to Supabase

```bash
npm run dev -- --filter vail --apply
```

### Process all resorts, skip existing data

```bash
npm run dev -- --apply --skip-existing
```

### Set custom confidence threshold

```bash
npm run dev -- --min-confidence 0.8
```

## CLI Options

| Option | Short | Description |
|--------|-------|-------------|
| `--filter <name>` | `-f` | Filter to resorts matching name |
| `--limit <n>` | `-l` | Process only first N resorts |
| `--skip-existing` | `-s` | Skip fields that already have values |
| `--min-confidence <n>` | `-c` | Minimum confidence threshold (default: 0.7) |
| `--apply` | `-a` | Apply changes to Supabase (default: dry run) |
| `--verbose` | `-v` | Show detailed output including skipped fields |
| `--list` | | List all resorts with wiki data and exit |
| `--help` | `-h` | Show help message |

## Output Example

```
Processing: Vail Mountain Resort
  Tokens: 2,450 (prompt: 2,100, completion: 350)

  === GENERATED CONTENT ===

  Tagline (confidence: 92%):
    "Legendary Back Bowls, World-Class Village"

  Description (confidence: 90%):
    Vail Mountain Resort stands as one of North America's most iconic ski
    destinations, renowned for its legendary Back Bowls that offer over
    3,000 acres of wide-open alpine terrain...

  === PROPOSED CHANGES ===

    tagline: null → "Legendary Back Bowls, World-Class Village" (92%)
    description: null → "Vail Mountain Resort stands as one of..." (523 chars) (90%)
    stats.skiableAcres: null → 5,317 (95%)
    stats.liftsCount: null → 31 (90%)
```

## Cost Estimate

- GPT-4o: ~$0.02-0.05 per resort
- Full run (500 resorts): ~$10-25

Token usage and cost are tracked and displayed in the summary report.

## Generated Content

### Taglines

5-10 word phrases that capture each resort's unique identity:

- "Legendary Back Bowls, World-Class Village" (Vail)
- "Where Steep Meets Deep" (Jackson Hole)
- "The Legend Lives On at 13,000 Feet" (Arapahoe Basin)
- "Ski It If You Can" (Mad River Glen)

### Descriptions

2-3 paragraph (300-500 word) descriptions covering:

- Resort history and heritage
- Unique terrain features and signature runs
- Village atmosphere
- Target audience appeal
- Notable awards or recognition

## Data Extracted

| Field | Type | Notes |
|-------|------|-------|
| `tagline` | string | 5-10 word marketing phrase |
| `description` | string | 300-500 word description |
| `stats.skiableAcres` | number | In acres |
| `stats.liftsCount` | number | Total lifts |
| `stats.runsCount` | number | Total runs/trails |
| `stats.verticalDrop` | number | In feet |
| `stats.baseElevation` | number | In feet |
| `stats.summitElevation` | number | In feet |
| `stats.avgAnnualSnowfall` | number | In inches |
| `terrain.beginner` | number | Percentage |
| `terrain.intermediate` | number | Percentage |
| `terrain.advanced` | number | Percentage |
| `terrain.expert` | number | Percentage |
| `features.hasPark` | boolean | Terrain park |
| `features.hasHalfpipe` | boolean | Halfpipe |
| `features.hasNightSkiing` | boolean | Night skiing |
| `features.hasBackcountryAccess` | boolean | Backcountry gates |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     wikidata-enricher                            │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  GCS Bucket   │    │   OpenAI API  │    │   Supabase    │
│  (read-only)  │    │   (GPT-4o)    │    │   (write)     │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
   wiki-data.json       Extraction &          resorts table
                        Formatting
```

## Related

- `wikipedia-updater` - Creates the wiki-data.json files this tool reads
