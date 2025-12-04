---
title: "Liftie Sync"
description: "Syncs real-time lift status, weather, and webcam data to Supabase"
parent: "ski-resort-directory"
tags:
  - updater
  - liftie
  - conditions
  - sync
  - supabase
---

# Liftie Sync

Syncs real-time lift status, weather, and webcam data from Liftie.info to the Supabase `resort_conditions` table.

## Overview

This updater reads Liftie data that has already been collected and stored in GCS at `resorts/{country}/{state}/{slug}/liftie/`. It maps this data to the `resort_conditions` table for display on the frontend.

## Data Sources

The updater reads four JSON files from GCS for each resort:

| File | Content |
|------|---------|
| `summary.json` | Overall stats and feature flags |
| `lifts.json` | Individual lift statuses |
| `weather.json` | NOAA weather forecast |
| `webcams.json` | Webcam URLs and images |

## Setup

1. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

2. Set environment variables:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key for write access
   - `GCS_BUCKET` - GCS bucket containing resort data
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCP service account JSON

3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

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

## Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without writing to database |
| `--filter <pattern>` | Only process resorts matching slug/name pattern |
| `--verbose`, `-v` | Show detailed output for each resort |
| `--help`, `-h` | Show help message |

## Database Schema

The updater writes to the `resort_conditions` table with these fields:

| Column | Type | Description |
|--------|------|-------------|
| `resort_id` | UUID | Foreign key to resorts |
| `lifts_open` | INTEGER | Number of lifts open |
| `lifts_total` | INTEGER | Total number of lifts |
| `lifts_percentage` | NUMERIC | Percentage open (0-100) |
| `lifts_status` | JSONB | Map of lift name to status |
| `weather_high` | INTEGER | Forecasted high (°F) |
| `weather_condition` | TEXT | Condition summary |
| `weather_text` | TEXT | Full NOAA forecast |
| `weather_icon` | TEXT[] | Icon class names |
| `webcams` | JSONB | Array of webcam objects |
| `has_webcams` | BOOLEAN | Whether webcams exist |
| `has_lifts` | BOOLEAN | Whether lift data exists |
| `has_weather` | BOOLEAN | Whether weather data exists |
| `source_timestamp` | TIMESTAMPTZ | When Liftie collected data |
| `updated_at` | TIMESTAMPTZ | When we synced |

## Example Output

```
============================================================
Liftie Sync - Real-time Conditions Updater
============================================================

Fetching all resorts from Supabase...
Fetched 789 resorts from Supabase

Processing 789 resorts...

============================================================
Sync Complete
============================================================
Total resorts:      789
Updated:            86
Skipped:            703
  - No Liftie data: 703
Errors:             0
```

## Current Coverage

As of December 2025, Liftie data is available for 86 resorts, primarily:
- Major destination resorts (Vail, Mammoth, etc.)
- Resorts with modern lift reporting systems
- Resorts in well-covered regions

## Scheduling

This sync should run periodically to keep conditions current:
- Recommended: Every 15-30 minutes during ski season
- Off-season: Daily or weekly

Set up as a cron job or Cloud Scheduler task.
