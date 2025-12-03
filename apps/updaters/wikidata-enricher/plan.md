# Wikidata Enricher - Implementation Plan

## Overview

A new updater application that reads Wikipedia/Wikidata information from GCS and uses OpenAI's LLM to intelligently extract, format, and map data to Supabase resort table columns. This enables automated enrichment of resort data with structured information from Wikipedia articles.

## Problem Statement

The `wikipedia-updater` currently fetches raw Wikipedia data and stores it as `wiki-data.json` files in GCS. This data contains valuable information (infobox fields, extracts, coordinates, categories) but is not structured in a way that maps directly to our Supabase schema. Manual extraction is error-prone and doesn't scale.

## Solution

Use an LLM (OpenAI GPT-4) to:
1. Read and understand the raw Wikipedia data
2. Extract relevant information using natural language understanding
3. Format and normalize values (e.g., "1,200 acres" → 1200)
4. Map data to Supabase columns with confidence scores
5. Generate update payloads for Supabase

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
        │                     │                     │
   wiki-data.json       Extraction &          resorts table
   README.md            Formatting            resort_tags
                        Prompts               resort_passes
```

## Directory Structure

```
apps/updaters/wikidata-enricher/
├── src/
│   ├── index.ts              # Main entry point & CLI
│   ├── config.ts             # Environment configuration
│   ├── gcs.ts                # GCS read operations
│   ├── supabase.ts           # Supabase client & queries
│   ├── openai.ts             # OpenAI client & prompts
│   ├── extractor.ts          # Data extraction logic
│   ├── mapper.ts             # Schema mapping logic
│   └── types.ts              # TypeScript interfaces
├── prompts/
│   ├── extract-stats.txt     # Prompt for extracting statistics
│   ├── extract-features.txt  # Prompt for extracting features
│   └── extract-general.txt   # Prompt for general info extraction
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
└── plan.md                   # This file
```

## Data Flow

### Step 1: List Resorts with Wikidata

Query Supabase for all resorts, then check GCS for existence of `wiki-data.json`:

```typescript
// For each resort in Supabase:
const wikiDataPath = `resorts/${resort.asset_path}/wiki-data.json`;
const exists = await bucket.file(wikiDataPath).exists();
```

### Step 2: Read Wiki Data from GCS

Download and parse the JSON file:

```typescript
interface WikiDataFile {
  title: string;
  pageid: number;
  url: string;
  extract: string;           // Intro summary
  fullExtract: string;       // Full article text
  categories: string[];      // Wikipedia categories
  coordinates: { lat: number; lng: number } | null;
  infobox: Record<string, string>;  // Structured infobox data
  media: WikipediaMediaItem[];
  lastUpdated: string;
}
```

### Step 3: LLM Extraction

Send wiki data to OpenAI with structured extraction prompts:

```typescript
const extractionPrompt = `
You are a ski resort marketing expert and data extraction specialist.

Given the following Wikipedia data for "${resort.name}" in ${resort.state_name}:

INFOBOX DATA:
${JSON.stringify(wikiData.infobox, null, 2)}

ARTICLE EXTRACT:
${wikiData.fullExtract}

CATEGORIES:
${wikiData.categories.join(', ')}

Your task is to:
1. Extract factual data from the Wikipedia information
2. Create compelling marketing content based on what makes this resort unique

Return a JSON object with the following structure.
Use null for any field where data is not available or uncertain.
Include a confidence score (0-1) for each extracted value.

{
  "content": {
    "tagline": {
      "value": "A catchy 5-10 word phrase that captures what makes this resort special. Examples: 'Legendary Terrain, Unmatched Luxury' or 'Where Steep Meets Deep' or 'The Legend Lives On'. Make it memorable and unique to this specific resort.",
      "confidence": number
    },
    "description": {
      "value": "A detailed 2-3 paragraph (300-500 word) description for the resort's detail page. Tell the resort's story - its history, what makes the terrain unique, the village atmosphere, what type of skiers it attracts, any awards or recognition. Write in an inviting, informative tone that makes readers want to visit. Include specific details like signature runs, elevation, annual snowfall when available.",
      "confidence": number
    }
  },
  "stats": {
    "skiableAcres": { "value": number | null, "confidence": number },
    "liftsCount": { "value": number | null, "confidence": number },
    "runsCount": { "value": number | null, "confidence": number },
    "verticalDrop": { "value": number | null, "confidence": number },
    "baseElevation": { "value": number | null, "confidence": number },
    "summitElevation": { "value": number | null, "confidence": number },
    "avgAnnualSnowfall": { "value": number | null, "confidence": number }
  },
  "terrain": {
    "beginner": { "value": number | null, "confidence": number },
    "intermediate": { "value": number | null, "confidence": number },
    "advanced": { "value": number | null, "confidence": number },
    "expert": { "value": number | null, "confidence": number }
  },
  "features": {
    "hasPark": { "value": boolean | null, "confidence": number },
    "hasHalfpipe": { "value": boolean | null, "confidence": number },
    "hasNightSkiing": { "value": boolean | null, "confidence": number },
    "hasBackcountryAccess": { "value": boolean | null, "confidence": number }
  },
  "general": {
    "websiteUrl": { "value": string | null, "confidence": number },
    "nearestCity": { "value": string | null, "confidence": number }
  },
  "coordinates": {
    "lat": { "value": number | null, "confidence": number },
    "lng": { "value": number | null, "confidence": number }
  }
}

Important guidelines for content generation:
- Tagline: Be creative but authentic. Avoid generic phrases like "Fun for the whole family" unless that's truly the resort's identity. Reference specific features (elevation, snowfall, terrain type, history).
- Description: Write as if you're a passionate local sharing insider knowledge. Mention specific terrain features, historic significance, or unique characteristics. Avoid hyperbole but convey genuine enthusiasm.
`;
```

### Step 4: Mapping & Validation

Apply business rules and confidence thresholds:

```typescript
interface MappingConfig {
  minConfidence: number;        // Default: 0.7
  overwriteExisting: boolean;   // Default: false
  fields: {
    [key: string]: {
      enabled: boolean;
      minConfidence?: number;   // Override default
      transform?: (value: any) => any;
    };
  };
}
```

### Step 5: Generate Update Payload

Create Supabase update objects:

```typescript
interface ResortUpdate {
  id: string;
  changes: Partial<Resort>;
  source: 'wikidata-enricher';
  extractedAt: string;
  confidenceScores: Record<string, number>;
}
```

### Step 6: Apply Updates (Optional)

With `--apply` flag, write changes to Supabase:

```typescript
await supabase
  .from('resorts')
  .update(changes)
  .eq('id', resortId);
```

## Target Supabase Columns

| Column | Source Field | Notes |
|--------|--------------|-------|
| `tagline` | LLM generated | Catchy 5-10 word marketing phrase |
| `description` | LLM generated | Detailed 2-3 paragraph description |
| `stats->skiableAcres` | infobox.skiable_area | Parse numeric value |
| `stats->liftsCount` | infobox.lifts | Count lifts from list |
| `stats->runsCount` | infobox.trails | Parse numeric value |
| `stats->verticalDrop` | infobox.vertical | Convert to feet |
| `stats->baseElevation` | infobox.base_elevation | Convert to feet |
| `stats->summitElevation` | infobox.summit_elevation | Convert to feet |
| `stats->avgAnnualSnowfall` | infobox.snowfall | Convert to inches |
| `terrain->*` | infobox.terrain or extract | Parse percentages |
| `features->*` | infobox + extract | Boolean detection |
| `website_url` | infobox.website | Validate URL |
| `nearest_city` | infobox.nearest_city | Clean string |
| `location` | coordinates | PostGIS point |

### Content Generation (Priority Fields)

#### Tagline
A catchy, memorable marketing phrase that captures the resort's unique identity:
- 5-10 words maximum
- Highlights what makes the resort special
- Appeals to target audience
- Examples:
  - Vail: "Legendary Terrain, Unmatched Luxury"
  - Telluride: "Where Adventure Meets Alpine Elegance"
  - Arapahoe Basin: "The Legend Lives On at 13,000 Feet"
  - Mad River Glen: "Ski It If You Can"

#### Description
A detailed, engaging description for the resort detail page:
- 2-3 paragraphs (300-500 words)
- Compelling narrative that tells the resort's story
- Includes:
  - History and heritage
  - Unique terrain features and signature runs
  - Village/base area atmosphere
  - What type of skier/rider it appeals to
  - Notable awards or recognition
  - Local culture and vibe
- Written in an inviting, informative tone
- SEO-friendly with natural keyword inclusion

## CLI Interface

```bash
# List all resorts with wiki data available
npm run start -- --list

# Process single resort (dry run)
npm run start -- --filter "vail"

# Process all resorts (dry run)
npm run start -- --all

# Apply changes to Supabase
npm run start -- --all --apply

# Process with custom confidence threshold
npm run start -- --all --min-confidence 0.8

# Skip resorts that already have data
npm run start -- --all --skip-existing

# Limit number of resorts (for testing)
npm run start -- --limit 10

# Show detailed extraction results
npm run start -- --filter "vail" --verbose
```

## Configuration

### Environment Variables

```bash
# Required
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
GCS_KEY_FILE=../gcp-sa-key.json

# Optional
GCS_BUCKET_NAME=sda-assets-prod
OPENAI_MODEL=gpt-4o
MIN_CONFIDENCE=0.7
DRY_RUN=true
```

## Dependencies

```json
{
  "dependencies": {
    "@google-cloud/storage": "^7.x",
    "@supabase/supabase-js": "^2.x",
    "openai": "^4.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tsx": "^4.x",
    "@types/node": "^20.x"
  }
}
```

## Output Modes

### 1. Dry Run (Default)

Outputs proposed changes without modifying Supabase:

```
Processing: Vail Mountain Resort
  Wiki data found: resorts/us/colorado/vail/wiki-data.json
  Extracted 14 fields with avg confidence 0.87

  === GENERATED CONTENT ===

  Tagline (confidence: 0.92):
    "Legendary Back Bowls, World-Class Village"

  Description (confidence: 0.90):
    Vail Mountain Resort stands as one of North America's most iconic ski
    destinations, renowned for its legendary Back Bowls that offer over
    3,000 acres of wide-open alpine terrain. Founded in 1962 by Pete
    Seibert and Earl Eaton, Vail quickly established itself as a premier
    destination, combining European-style village ambiance with Colorado's
    famous champagne powder.

    The front side of Vail delivers meticulously groomed cruisers perfect
    for intermediate skiers, while the Back Bowls—China Bowl, Sun Down Bowl,
    and the rest—provide an almost endless playground for advanced riders
    seeking fresh tracks. With a summit elevation of 11,570 feet and an
    average annual snowfall of 354 inches, conditions here are consistently
    exceptional throughout the season.

    Beyond the slopes, Vail Village offers a pedestrian-friendly alpine
    experience with world-class dining, boutique shopping, and après-ski
    culture that rivals any European resort. Whether you're carving groomers
    at dawn or exploring the legendary Blue Sky Basin, Vail delivers an
    unforgettable mountain experience.

  === STATISTICS ===

  Proposed changes:
    stats.skiableAcres: null → 5317 (confidence: 0.95)
    stats.liftsCount: null → 31 (confidence: 0.90)
    stats.verticalDrop: null → 3450 (confidence: 0.92)
    features.hasNightSkiing: null → false (confidence: 0.85)

  Skipped (low confidence):
    terrain.expert: 25 (confidence: 0.45)

  Skipped (already has value):
    website_url: "https://vail.com" (existing)
```

### 2. Apply Mode

Actually updates Supabase and logs changes:

```
Applied 6 changes to resort:vail
  - tagline: "Legendary Back Bowls, World-Class Village"
  - description: "Vail Mountain Resort stands as one of..." (523 chars)
  - stats.skiableAcres: 5317
  - stats.liftsCount: 31
  - stats.verticalDrop: 3450
  - features.hasNightSkiing: false
```

### 3. Report Mode

Generates summary report:

```
=== Wikidata Enricher Report ===
Processed: 450 resorts
With wiki data: 312 (69%)
Extracted successfully: 298 (96%)

Content Generation:
  Taglines generated:     298/312 (96%)
  Descriptions generated: 298/312 (96%)
  Avg tagline confidence: 0.88
  Avg description conf:   0.85

Field Coverage:
  skiableAcres:    245/312 (79%)
  liftsCount:      289/312 (93%)
  runsCount:       201/312 (64%)
  verticalDrop:    267/312 (86%)
  ...

Average Confidence by Field:
  tagline:         0.88
  description:     0.85
  skiableAcres:    0.89
  liftsCount:      0.91
  ...
```

## Error Handling

1. **Missing wiki-data.json**: Skip resort, log warning
2. **OpenAI API error**: Retry with exponential backoff (max 3 attempts)
3. **Invalid extraction**: Log error, skip resort
4. **Supabase error**: Log error, continue with next resort

## Cost Considerations

- OpenAI GPT-4o: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- Estimated cost per resort: ~$0.02-0.05
- Full run (500 resorts): ~$10-25

Optimization strategies:
- Cache extractions in GCS as `enriched-data.json`
- Only re-process if wiki-data.json is newer
- Use GPT-4o-mini for initial pass, GPT-4o for low-confidence retries

## Future Enhancements

1. **Batch Processing**: Process multiple resorts in single LLM call
2. **Human Review Queue**: Flag low-confidence extractions for review
3. **Change History**: Track all enrichment updates with timestamps
4. **Incremental Updates**: Only process resorts with updated wiki data
5. **Multi-source Enrichment**: Add support for other data sources (OpenSnow, OnTheSnow)

## Testing Strategy

1. **Unit Tests**: Test extraction logic with mock wiki data
2. **Integration Tests**: Test against real wiki-data.json files
3. **Golden File Tests**: Compare extraction results against known-good outputs
4. **Confidence Calibration**: Verify confidence scores correlate with accuracy

## Database Schema Requirements

The following columns must exist in the Supabase `resorts` table:

| Column | Type | Status |
|--------|------|--------|
| `tagline` | text | **EXISTS** - Short marketing phrase |
| `description` | text | **EXISTS** - Long-form description |
| `stats` | jsonb | **EXISTS** - Statistics object |
| `terrain` | jsonb | **EXISTS** - Terrain percentages |
| `features` | jsonb | **EXISTS** - Boolean features |
| `website_url` | text | **EXISTS** - Resort website |
| `nearest_city` | text | **EXISTS** - Nearest town |
| `location` | geography(Point) | **EXISTS** - Lat/lng coordinates |

No database migrations required - all target columns already exist.

## Implementation Order

1. Project setup (package.json, tsconfig, config)
2. GCS read operations (list files, download wiki-data.json)
3. OpenAI client and prompts
4. Extraction logic with confidence scoring
5. Mapping and validation
6. Dry run output formatting
7. Supabase update logic
8. CLI argument parsing
9. Report generation
10. Error handling and retries
