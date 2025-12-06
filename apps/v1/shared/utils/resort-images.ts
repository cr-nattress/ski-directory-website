/**
 * Resort Image Utilities
 * Helper functions for working with resort images
 */

import type { Resort, ResortImage } from '@shared/types';

/**
 * Default placeholder image for resorts without images
 * Hosted on GCS for consistent CDN delivery
 */
export const PLACEHOLDER_IMAGE = 'https://storage.googleapis.com/sda-assets-prod/defaults/card.png';

/**
 * Get the card image for a resort (for dashboard/listing cards)
 * Returns the image marked as isCardImage, or the first image, or placeholder
 */
export function getCardImage(resort: Resort): ResortImage | undefined {
  if (!resort.images || resort.images.length === 0) return undefined;
  return resort.images.find((img) => img.isCardImage) || resort.images[0];
}

/**
 * Get the card image URL for a resort, with placeholder fallback
 */
export function getCardImageUrl(resort: Resort): string {
  const cardImage = getCardImage(resort);
  return cardImage?.url || resort.heroImage || PLACEHOLDER_IMAGE;
}

/**
 * Get the hero image for a resort (large image for detail page)
 * Returns the image marked as isHeroImage, or the first image as fallback
 */
export function getHeroImage(resort: Resort): ResortImage | undefined {
  if (!resort.images || resort.images.length === 0) return undefined;
  return resort.images.find((img) => img.isHeroImage) || resort.images[0];
}

/**
 * Get all images sorted by priority (lower priority number = higher placement)
 */
export function getSortedImages(resort: Resort): ResortImage[] {
  if (!resort.images || resort.images.length === 0) return [];
  return [...resort.images].sort((a, b) => a.priority - b.priority);
}
