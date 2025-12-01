# Wikipedia Updater

Fetches Wikipedia data for all ski resorts in the database and generates README files that are uploaded to Google Cloud Storage.

## What it does

1. Fetches all ski resorts from Supabase
2. For each resort:
   - Searches Wikipedia for a matching article
   - Extracts summary, infobox data, categories, and coordinates
   - Formats the data into a markdown README
   - Uploads the README to GCS at `resorts/{asset_path}/README.md`
   - Also uploads raw Wikipedia data as JSON for future use

## Setup

### 1. Install dependencies

```bash
cd apps/updaters/wikipedia-updater
npm install
```

### 2. Configure environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for full database access
- `GCS_BUCKET_NAME` - GCS bucket name (default: `sda-assets-prod`)
- `GCS_KEY_FILE` - Path to GCS service account key JSON

### 3. Ensure GCS credentials are available

The service account key should be at `gcp/service-account-key.json` (or update `GCS_KEY_FILE`).

## Usage

### Run the updater

```bash
# Development (with tsx)
npm run dev

# Production (build first)
npm run build
npm start
```

### Command line options

```bash
# Limit processing to N resorts
npm run dev -- --limit=10

# Skip first N resorts
npm run dev -- --skip=20

# Filter by name, state, or slug
npm run dev -- --filter=vail
npm run dev -- --filter=colorado

# Combine options
npm run dev -- --filter=utah --limit=5
```

### Dry run mode

Set `DRY_RUN=true` in `.env` to test without uploading to GCS:

```bash
DRY_RUN=true npm run dev -- --limit=5
```

## Output

For each resort, the updater creates:

1. **README.md** - Markdown file with:
   - Resort name and location
   - Wikipedia summary
   - Quick facts table (from infobox)
   - Detailed information (full article)
   - Categories
   - Coordinates
   - Links (website, Wikipedia, Ski Directory)

2. **wiki-data.json** - Raw Wikipedia data:
   - Page title and ID
   - Article URL
   - Full text extract
   - Infobox data
   - Categories
   - Coordinates
   - Timestamp

## File locations

Files are uploaded to:
```
gs://sda-assets-prod/resorts/{state}/{slug}/README.md
gs://sda-assets-prod/resorts/{state}/{slug}/wiki-data.json
```

For example:
```
gs://sda-assets-prod/resorts/colorado/vail/README.md
gs://sda-assets-prod/resorts/colorado/vail/wiki-data.json
```

## Rate limiting

The Wikipedia API requests are rate-limited (default: 500ms between requests) to be a good API citizen. Adjust with:

```env
WIKIPEDIA_RATE_LIMIT_MS=1000
```

## Notes

- The updater uses Wikipedia's search API to find relevant articles
- Not all resorts will have Wikipedia articles
- Lost ski areas often have historical information on Wikipedia
- The infobox parsing extracts common ski resort fields but may miss some
