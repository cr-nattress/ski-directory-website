# Weather Sync

Syncs detailed mountain weather forecasts from [Open-Meteo](https://open-meteo.com/) to the `resort_conditions` table in Supabase.

## Features

- **Current Conditions**: Temperature, feels-like, humidity, wind, precipitation
- **Snowfall Predictions**: 24h, 48h, and 72h forecasts (critical for ski resorts!)
- **Daily Forecast**: 7-day outlook with highs, lows, and conditions
- **Hourly Forecast**: Next 24 hours in detail
- **Elevation-Aware**: Uses summit elevation for accurate mountain weather
- **Free**: No API key required (Open-Meteo is free and open source)

## Data Source

[Open-Meteo](https://open-meteo.com/) provides free weather data with:
- High resolution (1-11km)
- Hourly updates
- Global coverage
- No rate limits for reasonable usage

## Usage

```bash
# Install dependencies
npm install

# Run in dry-run mode (no database writes)
DRY_RUN=true npm run dev

# Run with verbose output
VERBOSE=true npm run dev

# Filter to specific resort(s)
FILTER=vail npm run dev

# Production run
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `DRY_RUN` | No | Set to `true` to skip database writes |
| `VERBOSE` | No | Set to `true` for detailed logging |
| `FILTER` | No | Filter to resorts matching pattern |
| `BATCH_SIZE` | No | Resorts per batch (default: 10) |
| `BATCH_DELAY_MS` | No | Delay between batches (default: 1000) |

## Database Schema

Extends the `resort_conditions` table with additional columns. Run the migration:

```bash
# Apply migration
psql $DATABASE_URL < supabase/migrations/001_add_detailed_weather.sql
```

### Key Fields Added

| Column | Type | Description |
|--------|------|-------------|
| `current_temp` | numeric | Current temperature (°F) |
| `current_feels_like` | numeric | Feels-like temperature (°F) |
| `current_wind_speed` | numeric | Wind speed (mph) |
| `snow_next_24h` | numeric | Predicted snowfall next 24h (inches) |
| `snow_next_48h` | numeric | Predicted snowfall next 48h (inches) |
| `snow_next_72h` | numeric | Predicted snowfall next 72h (inches) |
| `daily_forecast` | jsonb | 7-day forecast array |
| `hourly_forecast` | jsonb | 24-hour forecast array |

### Views Created

- **`powder_alerts`**: Resorts with upcoming snowfall, ranked by amount

## Scheduling

Recommended: Run every 30-60 minutes via cron or Cloud Scheduler.

```bash
# Example cron (every 30 minutes)
*/30 * * * * cd /path/to/weather-sync && npm start
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Supabase      │────▶│   Weather Sync  │◀────│   Open-Meteo    │
│   (resorts)     │     │                 │     │   API           │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   Supabase      │
                        │ (conditions)    │
                        └─────────────────┘
```

## Related

- **liftie-sync**: Syncs lift status from Liftie.info
- **trail-sync**: (Coming soon) Trail status scraping
