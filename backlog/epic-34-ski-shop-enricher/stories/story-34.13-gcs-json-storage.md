# Story 34.13: Save Ski Shop JSON to GCS Before Supabase

## Priority: High

## Phase: Core Enhancement

## Context

Following the established pattern from other enrichers (ai-enricher, wikipedia-updater), the ski shop enricher should save the raw OpenAI response and parsed data to GCS before writing to Supabase. This provides:

1. **Audit trail** - Raw AI responses preserved for debugging
2. **Data recovery** - Can re-process from JSON if Supabase write fails
3. **Consistency** - Follows existing enricher patterns
4. **Version history** - GCS versioning keeps old enrichment data

## Requirements

1. Add Google Cloud Storage service to write JSON files
2. Save `ski-shops.json` to each resort's GCS folder
3. Include both raw OpenAI response and parsed shop data
4. Write to GCS before Supabase (fail-safe approach)
5. Support dry-run mode (log without writing)
6. Add metadata for tracking (timestamp, model, version)

## GCS File Structure

```
gs://sda-assets-prod/resorts/{country}/{state}/{slug}/
├── ski-shops.json          # New file from this enricher
├── ai-enrichment.json      # Existing from ai-enricher
├── wiki-data.json          # Existing from wikipedia-updater
└── ...
```

## Implementation

### 1. Add Dependencies

```bash
npm install @google-cloud/storage
npm install -D @types/node
```

### 2. Update package.json

```json
{
  "dependencies": {
    "@google-cloud/storage": "^7.7.0"
  }
}
```

### 3. Update .env.example

```bash
# GCS Configuration
GCS_BUCKET_NAME=sda-assets-prod
GCS_KEY_FILE=../../../gcp/service-account-key.json
GCS_ENABLED=true
```

### 4. Create GCS Service: `src/services/gcs.ts`

```typescript
import { Storage } from '@google-cloud/storage';
import { config } from '../config';
import { logger } from '../utils/logger';

interface SkiShopsJson {
  version: string;
  enriched_at: string;
  model: string;
  resort: {
    id: string;
    name: string;
    slug: string;
    asset_path: string;
  };
  search: {
    radius_miles: number;
    latitude: number;
    longitude: number;
  };
  statistics: {
    shops_found: number;
    shops_valid: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_cost: number;
  };
  raw_response: unknown;
  shops: Array<{
    name: string;
    slug: string;
    description: string | null;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    phone: string | null;
    website_url: string | null;
    shop_type: string[];
    services: string[];
    distance_miles: number;
    is_on_mountain: boolean;
  }>;
}

export class GCSService {
  private storage: Storage;
  private bucket: string;
  private enabled: boolean;

  constructor() {
    this.enabled = config.gcs.enabled;
    this.bucket = config.gcs.bucketName;

    if (this.enabled) {
      this.storage = new Storage({
        keyFilename: config.gcs.keyFile,
      });
    }
  }

  async saveSkiShopsJson(
    assetPath: string,
    data: SkiShopsJson,
    dryRun: boolean = false
  ): Promise<string | null> {
    if (!this.enabled) {
      logger.debug('GCS disabled, skipping save');
      return null;
    }

    const filePath = `resorts/${assetPath}/ski-shops.json`;
    const content = JSON.stringify(data, null, 2);

    if (dryRun) {
      logger.info(`[DRY RUN] Would save to gs://${this.bucket}/${filePath}`);
      return null;
    }

    try {
      const file = this.storage.bucket(this.bucket).file(filePath);

      await file.save(content, {
        contentType: 'application/json',
        metadata: {
          cacheControl: 'public, max-age=300',
          customMetadata: {
            enricher: 'ski-shop-enricher',
            version: data.version,
            enrichedAt: data.enriched_at,
            model: data.model,
          },
        },
      });

      const publicUrl = `https://storage.googleapis.com/${this.bucket}/${filePath}`;
      logger.debug('Saved ski shops JSON to GCS', { path: filePath, url: publicUrl });

      return publicUrl;
    } catch (error) {
      logger.error('Failed to save to GCS', {
        path: filePath,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async hasExistingEnrichment(assetPath: string): Promise<boolean> {
    if (!this.enabled) return false;

    const filePath = `resorts/${assetPath}/ski-shops.json`;

    try {
      const [exists] = await this.storage
        .bucket(this.bucket)
        .file(filePath)
        .exists();
      return exists;
    } catch {
      return false;
    }
  }
}
```

### 5. Update Config: `src/config.ts`

```typescript
// Add to config object
gcs: {
  enabled: process.env.GCS_ENABLED === 'true',
  bucketName: process.env.GCS_BUCKET_NAME || 'sda-assets-prod',
  keyFile: process.env.GCS_KEY_FILE || '../../../gcp/service-account-key.json',
},

// Add to validateConfig if GCS is enabled
if (config.gcs.enabled) {
  const gcsRequired = ['GCS_BUCKET_NAME', 'GCS_KEY_FILE'];
  const gcsMissing = gcsRequired.filter((key) => !process.env[key]);
  if (gcsMissing.length > 0) {
    throw new Error(`GCS enabled but missing: ${gcsMissing.join(', ')}`);
  }
}
```

### 6. Update Types: `src/types.ts`

```typescript
export interface Resort {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  nearest_city: string;
  state: string;
  state_name: string;
  asset_path: string;  // Add this field
}
```

### 7. Update Supabase Service: `src/services/supabase.ts`

```typescript
// Update getResortsToEnrich query to include asset_path
async getResortsToEnrich(options?: {...}): Promise<Resort[]> {
  let query = this.client
    .from('resorts')
    .select('id, name, slug, lat, lng, nearest_city, state, state_name, asset_path')
    //                                                              ^^^^^^^^^^
    .eq('is_active', true)
    // ...rest of query
}
```

### 8. Update Enricher: `src/enricher/ski-shop-enricher.ts`

```typescript
import { GCSService } from '../services/gcs';

// In constructor
private gcs: GCSService;

constructor(enrichmentConfig?: Partial<EnrichmentConfig>) {
  // ...existing code
  this.gcs = new GCSService();
}

// In enrichResort method, after parsing response and before Supabase writes:
async enrichResort(resort: Resort): Promise<EnrichmentResult> {
  // ...existing OpenAI call and parsing...

  // Save to GCS first
  if (resort.asset_path) {
    const gcsData = {
      version: '1.0.0',
      enriched_at: new Date().toISOString(),
      model: this.config.openaiModel,
      resort: {
        id: resort.id,
        name: resort.name,
        slug: resort.slug,
        asset_path: resort.asset_path,
      },
      search: {
        radius_miles: this.config.searchRadiusMiles,
        latitude: resort.lat,
        longitude: resort.lng,
      },
      statistics: {
        shops_found: openaiResponse.shops.length,
        shops_valid: parseResult.validShops.length,
        prompt_tokens: openaiResponse.promptTokens,
        completion_tokens: openaiResponse.completionTokens,
        total_cost: openaiResponse.totalCost,
      },
      raw_response: openaiResponse.rawResponse,
      shops: parseResult.validShops.map(shop => ({
        ...shop,
        distance_miles: calculateDistance(resort.lat, resort.lng, shop.latitude, shop.longitude),
        is_on_mountain: isOnMountain(calculateDistance(resort.lat, resort.lng, shop.latitude, shop.longitude)),
      })),
    };

    await this.gcs.saveSkiShopsJson(resort.asset_path, gcsData, this.config.dryRun);
  }

  // ...existing Supabase writes...
}
```

### 9. Update CLI Help Text

Add note about GCS configuration in help output.

## Example ski-shops.json Output

```json
{
  "version": "1.0.0",
  "enriched_at": "2024-12-04T15:30:00.000Z",
  "model": "gpt-4-turbo-preview",
  "resort": {
    "id": "vail",
    "name": "Vail",
    "slug": "vail",
    "asset_path": "us/colorado/vail"
  },
  "search": {
    "radius_miles": 20,
    "latitude": 39.6403,
    "longitude": -106.3742
  },
  "statistics": {
    "shops_found": 8,
    "shops_valid": 7,
    "prompt_tokens": 850,
    "completion_tokens": 2100,
    "total_cost": 0.0715
  },
  "raw_response": {
    "shops": [...]
  },
  "shops": [
    {
      "name": "Vail Sports",
      "slug": "vail-sports-vail-co",
      "description": "Full-service ski shop at Vail Village",
      "address": "141 E Meadow Dr",
      "city": "Vail",
      "state": "CO",
      "postal_code": "81657",
      "latitude": 39.6426,
      "longitude": -106.3781,
      "phone": "970-476-5656",
      "website_url": "https://vailsports.com",
      "shop_type": ["rental", "retail", "repair"],
      "services": ["ski_rental", "snowboard_rental", "boot_fitting", "tuning"],
      "distance_miles": 0.3,
      "is_on_mountain": true
    }
  ]
}
```

## Acceptance Criteria

- [ ] GCS service created with save/check methods
- [ ] Config updated with GCS settings
- [ ] Resort type includes asset_path
- [ ] Supabase query fetches asset_path
- [ ] Enricher saves to GCS before Supabase
- [ ] Dry-run mode logs without writing
- [ ] JSON includes raw response and parsed data
- [ ] Metadata attached to GCS object
- [ ] Error handling doesn't block Supabase writes

## Testing

1. Set up `.env` with GCS credentials
2. Run `npm run dev -- enrich-resort vail --verbose`
3. Verify `ski-shops.json` created in GCS at `resorts/us/colorado/vail/`
4. Check JSON structure matches specification
5. Verify Supabase still receives data
6. Test dry-run: `npm run dev -- enrich-resort vail --dry-run`

## Effort: Medium (2-3 hours)
