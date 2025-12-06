/**
 * Wikipedia Data Types
 *
 * Represents the structure of data fetched from Wikipedia for ski resorts.
 * This data is stored in GCS as wiki-data.json by the wikipedia-updater.
 */

/**
 * Media item from Wikipedia's REST API media-list endpoint
 */
export interface WikipediaMediaItem {
  /** File title (e.g., "File:Vail_front_side.jpg") */
  title: string;
  /** Media type (typically "image") */
  type: string;
  /** Whether this is the lead/primary image for the article */
  leadImage: boolean;
  /** Section ID where the image appears */
  sectionId: number;
  /** Optional caption text */
  caption?: string;
  /** Available image sizes */
  srcset: Array<{
    /** Full URL to the image */
    src: string;
    /** Scale factor ("1x", "1.5x", "2x") */
    scale: string;
  }>;
}

/**
 * Infobox data extracted from Wikipedia ski resort articles
 *
 * Wikipedia ski resort infoboxes typically contain these fields,
 * though not all fields are present for every resort.
 */
export interface WikipediaInfobox {
  // === IDENTITY ===
  /** Resort name */
  name?: string;
  /** Logo filename (SVG) */
  logo?: string;
  /** Main picture filename */
  picture?: string;
  /** Picture caption */
  caption?: string;

  // === LOCATION ===
  /** Full location string (city, county, state, country) */
  location?: string;
  /** Nearest city with optional distance */
  nearest_city?: string;

  // === STATUS ===
  /** Operating status ("Operating", "Closed", etc.) */
  status?: string;
  /** Owner/operator company */
  owner?: string;

  // === ELEVATION & TERRAIN ===
  /** Vertical drop (e.g., "3450 ft") */
  vertical?: string;
  vertical_drop?: string;
  /** Summit elevation (e.g., "11570 ft") */
  top_elevation?: string;
  summit_elevation?: string;
  /** Base elevation (e.g., "8120 ft") */
  base_elevation?: string;
  /** Skiable area (e.g., "5317 acres") */
  skiable_area?: string;

  // === TRAILS & LIFTS ===
  /** Trail count and breakdown (e.g., "195 total, 18% beginner, 29% intermediate, 53% advanced") */
  number_trails?: string;
  trails?: string;
  /** Longest run name and distance */
  longest_run?: string;
  /** Lift system description */
  liftsystem?: string;
  lift_system?: string;
  lifts?: string;
  /** Hourly lift capacity */
  lift_capacity?: string;

  // === FEATURES ===
  /** Terrain parks info */
  terrainparks?: string;
  terrain_parks?: string;
  /** Snowmaking capability */
  snowmaking?: string;
  /** Night skiing availability */
  nightskiing?: string;
  night_skiing?: string;

  // === SNOW ===
  /** Average annual snowfall (e.g., "354 inches") */
  snowfall?: string;

  // === CONTACT ===
  /** Website URL */
  website?: string;

  // === OTHER ===
  /** Any additional fields that may appear */
  [key: string]: string | undefined;
}

/**
 * Complete Wikipedia data for a ski resort
 *
 * This is the structure stored in GCS at:
 * resorts/{country}/{state}/{slug}/wiki-data.json
 */
export interface WikipediaResortData {
  // === ARTICLE INFO ===
  /** Wikipedia article title */
  title: string;
  /** Wikipedia page ID */
  pageid: number;
  /** Full Wikipedia URL */
  url: string;

  // === CONTENT ===
  /** Short intro extract (first paragraph) */
  extract: string;
  /** Full article text (plain text, no HTML) */
  fullExtract: string;

  // === METADATA ===
  /** Article categories (filtered to relevant ones) */
  categories: string[];

  // === LOCATION ===
  /** Geographic coordinates from Wikipedia */
  coordinates: {
    lat: number;
    lng: number;
  } | null;

  // === STRUCTURED DATA ===
  /** Parsed infobox data */
  infobox: WikipediaInfobox;

  // === MEDIA ===
  /** Available images from the article */
  media: WikipediaMediaItem[];

  // === TIMESTAMPS ===
  /** When this data was fetched from Wikipedia */
  lastUpdated: string;
}

/**
 * Helper to get the best quality image URL from a media item
 */
export function getBestImageUrl(media: WikipediaMediaItem): string | null {
  if (!media.srcset || media.srcset.length === 0) return null;

  // Prefer 2x scale, then 1.5x, then 1x
  const scales = ['2x', '1.5x', '1x'];
  for (const scale of scales) {
    const src = media.srcset.find(s => s.scale === scale);
    if (src) return src.src;
  }

  return media.srcset[0]?.src ?? null;
}

/**
 * Helper to get the primary/lead image from Wikipedia data
 */
export function getPrimaryImage(data: WikipediaResortData): WikipediaMediaItem | null {
  if (!data.media || data.media.length === 0) return null;

  // First try to find the lead image
  const leadImage = data.media.find(m => m.leadImage);
  if (leadImage) return leadImage;

  // Fall back to first available image
  return data.media[0] ?? null;
}

/**
 * Helper to get primary image URL
 */
export function getPrimaryImageUrl(data: WikipediaResortData): string | null {
  const primaryImage = getPrimaryImage(data);
  if (!primaryImage) return null;
  return getBestImageUrl(primaryImage);
}
