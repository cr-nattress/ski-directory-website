import { Storage } from '@google-cloud/storage';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface DiningVenuesJsonData {
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
    venues_found: number;
    venues_valid: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_cost: number;
  };
  raw_response: unknown;
  venues: Array<{
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
    venue_type: string[];
    cuisine_type: string[];
    price_range: string;
    serves_breakfast: boolean;
    serves_lunch: boolean;
    serves_dinner: boolean;
    serves_drinks: boolean;
    has_full_bar: boolean;
    ambiance: string[];
    features: string[];
    is_on_mountain: boolean;
    mountain_location: string | null;
    is_ski_in_ski_out: boolean;
    hours_notes: string | null;
    distance_miles: number;
  }>;
}

export class GCSService {
  private storage: Storage | null = null;
  private bucket: string;
  private enabled: boolean;

  constructor() {
    this.enabled = config.gcs.enabled;
    this.bucket = config.gcs.bucketName;

    if (this.enabled) {
      this.storage = new Storage({
        keyFilename: config.gcs.keyFile,
      });
      logger.debug('GCS service initialized', { bucket: this.bucket });
    } else {
      logger.debug('GCS service disabled');
    }
  }

  async saveDiningVenuesJson(
    assetPath: string,
    data: DiningVenuesJsonData,
    dryRun: boolean = false
  ): Promise<string | null> {
    if (!this.enabled || !this.storage) {
      logger.debug('GCS disabled, skipping save');
      return null;
    }

    const filePath = `resorts/${assetPath}/dining-venues.json`;
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
          metadata: {
            enricher: 'dining-enricher',
            version: data.version,
            enrichedAt: data.enriched_at,
            model: data.model,
            venuesFound: String(data.statistics.venues_found),
            venuesValid: String(data.statistics.venues_valid),
          },
        },
      });

      const publicUrl = `https://storage.googleapis.com/${this.bucket}/${filePath}`;
      logger.info('Saved dining venues JSON to GCS', {
        path: filePath,
        resort: data.resort.name,
        venuesValid: data.statistics.venues_valid,
      });

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
    if (!this.enabled || !this.storage) return false;

    const filePath = `resorts/${assetPath}/dining-venues.json`;

    try {
      const [exists] = await this.storage.bucket(this.bucket).file(filePath).exists();
      return exists;
    } catch {
      return false;
    }
  }

  async getExistingEnrichment(assetPath: string): Promise<DiningVenuesJsonData | null> {
    if (!this.enabled || !this.storage) return null;

    const filePath = `resorts/${assetPath}/dining-venues.json`;

    try {
      const [content] = await this.storage.bucket(this.bucket).file(filePath).download();
      return JSON.parse(content.toString()) as DiningVenuesJsonData;
    } catch {
      return null;
    }
  }
}
