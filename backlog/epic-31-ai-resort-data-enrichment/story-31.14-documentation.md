# Story 31.14: Create Documentation and Usage Guide

## Description

Create comprehensive documentation for the AI enrichment pipeline, including setup instructions, usage examples, troubleshooting guide, and architecture overview.

## Acceptance Criteria

- [ ] README.md with quick start guide
- [ ] Setup instructions for all dependencies
- [ ] CLI usage with all options documented
- [ ] Architecture diagram
- [ ] Troubleshooting guide
- [ ] Cost estimation guide
- [ ] Example outputs

## Technical Details

### README.md Structure

```markdown
# AI Resort Data Enricher

Automated AI-powered enrichment of ski resort data using OpenAI GPT-4o.

## Overview

This tool aggregates data from multiple GCS sources (Wikipedia, Liftie, OnTheSnow)
and uses OpenAI to generate enriched resort information including:

- Compelling taglines and descriptions
- Terrain breakdown percentages
- Resort statistics (lifts, runs, vertical, etc.)
- Confidence scores for data quality

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run a dry-run test
npm start -- --filter vail --dry-run

# Process all resorts
npm start
```

## Prerequisites

- Node.js 18+
- OpenAI API key
- GCS service account with read/write access
- Supabase service role key

## Installation

1. Clone the repository
2. Navigate to the enricher directory:
   ```bash
   cd apps/updaters/ai-enricher
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment template:
   ```bash
   cp .env.example .env
   ```
5. Configure environment variables (see Configuration section)

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
| `DRY_RUN` | No | `false` | Enable dry-run by default |

### .env.example

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Cloud Storage
GCS_BUCKET_NAME=sda-assets-prod
GCS_KEY_FILE=./gcs-service-account.json

# Processing Options
MIN_CONFIDENCE=0.7
DRY_RUN=false
```

## Usage

### Basic Commands

```bash
# Show help
npm start -- --help

# Process all resorts (dry-run)
npm start -- --dry-run

# Process specific resort
npm start -- --filter vail

# Process resorts in a state
npm start -- --filter colorado

# Limit processing count
npm start -- --limit 10

# Skip already enriched resorts
npm start -- --skip-existing

# Resume interrupted processing
npm start -- --resume

# Verbose output
npm start -- --verbose
```

### CLI Options Reference

| Option | Short | Description |
|--------|-------|-------------|
| `--filter <pattern>` | `-f` | Filter resorts by name/slug/state |
| `--limit <number>` | `-l` | Process only N resorts |
| `--skip <number>` | `-s` | Skip first N resorts |
| `--skip-existing` | - | Skip resorts with existing enrichment |
| `--overwrite` | - | Overwrite existing enrichment files |
| `--resume` | - | Resume from last successful run |
| `--dry-run` | - | Preview without writing |
| `--min-confidence <number>` | - | Confidence threshold (0.0-1.0) |
| `--list` | - | List resorts with GCS data |
| `--list-enriched` | - | List already enriched resorts |
| `--verbose` | `-v` | Detailed output |
| `--help` | `-h` | Show help |

### Example Workflows

#### Initial Full Run

```bash
# First, list available resorts
npm start -- --list

# Dry-run to preview
npm start -- --dry-run --limit 5

# Full processing
npm start -- --skip-existing
```

#### Incremental Updates

```bash
# Process only new resorts
npm start -- --skip-existing

# Reprocess specific state
npm start -- --filter utah --overwrite
```

#### Debugging

```bash
# Single resort with verbose
npm start -- --filter vail --dry-run --verbose

# Check what would change
npm start -- --dry-run 2>&1 | grep "Would update"
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
│  Aggregator   │ │OpenAI │ │  GCS Writer   │ │   Supabase    │
│ (aggregator.ts)│ │(openai│ │  (gcs.ts)     │ │ (supabase.ts) │
└───────┬───────┘ │ .ts)  │ └───────────────┘ └───────────────┘
        │         └───────┘
┌───────▼───────────────────────────────────────────────────┐
│                     GCS Bucket                             │
│  resorts/{country}/{state}/{slug}/                        │
│    ├── wikipedia/data.json                                │
│    ├── liftie/current.json                                │
│    ├── onthesnow/ots-details.json                         │
│    └── ai-enrichment.json (output)                        │
└───────────────────────────────────────────────────────────┘
```

## Output Format

### GCS Output (ai-enrichment.json)

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

### Cost Tracking

Cost reports are saved to GCS after each run:
```
sda-assets-prod/resorts/_processing/cost-reports/2025-12-04T05-00-00Z.json
```

## Troubleshooting

### Common Issues

#### "Missing OPENAI_API_KEY"

Ensure your `.env` file exists and contains a valid API key:
```bash
cat .env | grep OPENAI
```

#### "Rate limited by OpenAI"

The tool includes automatic retry with exponential backoff. If issues persist:
- Reduce concurrent processing with `--limit 5`
- Check your OpenAI rate limits in the dashboard

#### "No Wikipedia data for resort"

Some resorts lack Wikipedia pages. The tool will skip these by default.
Check which resorts have data:
```bash
npm start -- --list
```

#### "Supabase update failed"

Verify your service role key has write permissions:
```bash
# Test connection
curl "$SUPABASE_URL/rest/v1/resorts?select=count" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
```

#### "GCS permission denied"

Ensure your service account has `storage.objects.get` and `storage.objects.create`:
```bash
# Test GCS access
gsutil ls gs://sda-assets-prod/resorts/us/colorado/vail/
```

### Debug Mode

Enable verbose logging for detailed diagnostics:
```bash
npm start -- --filter vail --verbose --dry-run
```

## Development

### Running Tests

```bash
npm test              # Run all tests
npm test:watch        # Watch mode
npm test:coverage     # With coverage report
```

### Adding New Data Sources

1. Add GCS reader function in `src/aggregator.ts`
2. Update `AggregatedResortData` type
3. Add source to prompt in `src/openai.ts`
4. Update confidence weights in `src/confidence.ts`

## License

MIT - See LICENSE file
```

## Tasks

- [ ] Create comprehensive README.md
- [ ] Document all CLI options
- [ ] Add architecture diagram (ASCII)
- [ ] Create troubleshooting guide
- [ ] Add cost estimation section
- [ ] Create .env.example template
- [ ] Add example output files
- [ ] Review and polish documentation

## Effort

**Size:** S (Small - 1-2 hours)

## Dependencies

- All previous stories (documentation covers complete feature)

## References

- [README Best Practices](https://www.makeareadme.com/)
- [Documentation Standards](https://documentation.divio.com/)
