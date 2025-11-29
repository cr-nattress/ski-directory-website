/**
 * GCS Asset URL Utilities
 *
 * Helper functions for constructing Google Cloud Storage URLs for resort assets.
 * All assets are served from the public bucket: gs://sda-assets-prod
 */

const GCS_BUCKET = 'sda-assets-prod';
const GCS_BASE_URL = `https://storage.googleapis.com/${GCS_BUCKET}`;

export interface AssetLocation {
  country: string;
  state: string;
  slug: string;
}

/**
 * Get the base URL for a resort's assets folder
 */
export function getResortAssetBase(location: AssetLocation): string {
  return `${GCS_BASE_URL}/resorts/${location.country}/${location.state}/${location.slug}`;
}

/**
 * Get a specific asset URL for a resort
 */
export function getResortAssetUrl(location: AssetLocation, path: string): string {
  return `${getResortAssetBase(location)}/${path}`;
}

/**
 * Get the card/listing image URL for a resort
 */
export function getCardImageUrl(location: AssetLocation): string {
  return getResortAssetUrl(location, 'images/card.jpg');
}

/**
 * Get the hero/banner image URL for a resort
 */
export function getHeroImageUrl(location: AssetLocation): string {
  return getResortAssetUrl(location, 'images/hero.jpg');
}

/**
 * Get the current trail map URL for a resort
 */
export function getTrailMapUrl(location: AssetLocation): string {
  return getResortAssetUrl(location, 'trailmaps/current.jpg');
}

/**
 * Get the assets manifest URL for a resort
 */
export function getAssetsManifestUrl(location: AssetLocation): string {
  return getResortAssetUrl(location, 'assets.json');
}

/**
 * Convenience function for Colorado resorts (most common case)
 */
export function getColoradoAssetUrl(slug: string, path: string): string {
  return getResortAssetUrl({ country: 'us', state: 'colorado', slug }, path);
}

/**
 * Check if a URL is a GCS asset URL
 */
export function isGcsUrl(url: string): boolean {
  return url.startsWith(GCS_BASE_URL);
}

/**
 * Constants for external use
 */
export const GCS_CONSTANTS = {
  BUCKET: GCS_BUCKET,
  BASE_URL: GCS_BASE_URL,
} as const;
