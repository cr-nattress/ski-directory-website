---
title: "Data Updaters"
description: "Wikipedia, Liftie, and data synchronization tools for the Ski Resort Directory"
tags:
  - updaters
  - wikipedia
  - liftie
  - data-sync
  - gcs
---

# Data Updaters

Tools for syncing external data to the Ski Resort Directory.

## Table of Contents

- [Overview](#overview)
- [Liftie Sync](#liftie-sync)
- [Wikipedia Updater](#wikipedia-updater)
- [Wikidata Enricher](#wikidata-enricher)

## Overview

The updaters are standalone Node.js scripts that fetch data from external sources and write to Supabase or Google Cloud Storage.

```
apps/updaters/
├── liftie-sync/          # Real-time lift/weather from Liftie.info
├── wikipedia-updater/    # Wikipedia content and summaries
└── wikidata-enricher/    # Structured metadata from Wikidata
```

## Liftie Sync

Syncs real-time lift status, weather forecasts, and webcam data from Liftie.info to the `resort_conditions` table.

### Setup

```bash
cd apps/updaters/liftie-sync
npm install
cp .env.example .env
```

### Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GCS_BUCKET=sda-assets-prod
GOOGLE_APPLICATION_CREDENTIALS=../../../gcp/service-account-key.json
```

### Usage

```bash
# Sync all resorts
npm run dev

# Preview changes (dry run)
npm run dev -- --dry-run

# Sync specific resort
npm run dev -- --filter vail

# Verbose output
npm run dev -- --verbose

# Combine options
npm run dev -- --filter mammoth --dry-run -v
```

### Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview without writing to database |
| `--filter <pattern>` | Only process matching resorts |
| `--verbose`, `-v` | Show detailed output |
| `--help`, `-h` | Show help |

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `lifts_open` | INTEGER | Lifts currently operating |
| `lifts_total` | INTEGER | Total lift count |
| `lifts_percentage` | NUMERIC | Percentage open (0-100) |
| `lifts_status` | JSONB | Map of lift name → status |
| `weather_high` | INTEGER | Forecasted high (°F) |
| `weather_condition` | TEXT | Condition summary |
| `weather_text` | TEXT | Full NOAA forecast |
| `webcams` | JSONB | Array of webcam objects |
| `updated_at` | TIMESTAMPTZ | Sync timestamp |

### Scheduling

Recommended run frequency:
- **Ski season:** Every 15-30 minutes
- **Off-season:** Daily or weekly

Set up as cron job or Cloud Scheduler task.

### Current Coverage

As of December 2025: 86 resorts with Liftie data, primarily major destinations with modern lift reporting systems.

---

## Wikipedia Updater

Fetches Wikipedia articles for all resorts and generates markdown README files uploaded to GCS.

### Setup

```bash
cd apps/updaters/wikipedia-updater
npm install
cp .env.example .env
```

### Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GCS_BUCKET_NAME=sda-assets-prod
GCS_KEY_FILE=../../../gcp/service-account-key.json
WIKIPEDIA_RATE_LIMIT_MS=500
DRY_RUN=false
```

### Usage

```bash
# Update all resorts
npm run dev

# Limit to N resorts
npm run dev -- --limit=10

# Skip first N resorts
npm run dev -- --skip=20

# Filter by state or name
npm run dev -- --filter=colorado
npm run dev -- --filter=vail

# Dry run (no uploads)
DRY_RUN=true npm run dev -- --limit=5
```

### Output Files

For each resort, creates:

**1. README.md** - Markdown file with:
- Resort name and location
- Wikipedia summary
- Quick facts table (from infobox)
- Detailed information
- Categories and coordinates
- External links

**2. wiki-data.json** - Raw Wikipedia data:
- Page title and ID
- Article URL
- Full text extract
- Infobox data
- Categories and coordinates
- Timestamp

### File Locations

```
gs://sda-assets-prod/resorts/{country}/{state}/{slug}/README.md
gs://sda-assets-prod/resorts/{country}/{state}/{slug}/wiki-data.json
```

Example:
```
gs://sda-assets-prod/resorts/us/colorado/vail/README.md
gs://sda-assets-prod/resorts/us/colorado/vail/wiki-data.json
```

### Rate Limiting

Default 500ms between Wikipedia API requests. Adjust with `WIKIPEDIA_RATE_LIMIT_MS`.

---

## Wikidata Enricher

Enriches resort data with structured metadata from Wikidata (elevation, coordinates, official website, etc.).

### Setup

```bash
cd apps/updaters/wikidata-enricher
npm install
cp .env.example .env
```

### Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Usage

```bash
# Enrich all resorts
npm run dev

# Filter by state
npm run dev -- --filter=utah

# Dry run
npm run dev -- --dry-run
```

### Enriched Fields

| Field | Wikidata Property | Description |
|-------|-------------------|-------------|
| `elevation` | P2044 | Summit elevation |
| `coordinates` | P625 | Lat/lng location |
| `website` | P856 | Official website |
| `inception` | P571 | Year founded |
| `operator` | P137 | Operating company |

---

## Common Patterns

### Running Multiple Updaters

```bash
# Sequential
cd apps/updaters/liftie-sync && npm run dev
cd ../wikipedia-updater && npm run dev

# Or via root scripts (if configured)
npm run sync:liftie
npm run sync:wikipedia
```

### Error Handling

All updaters:
- Log errors to console
- Continue processing on individual resort failures
- Return summary with success/error counts

### Monitoring

Check Grafana dashboards for:
- Sync job completion
- Error rates
- Data freshness

## Related

- [Architecture](./architecture.md) - System design
- [Data Model](./data-model.md) - Database schema
- [Development Guide](./development.md) - Setup instructions
