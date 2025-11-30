/**
 * Resort Image Utilities
 * Helper functions for working with resort images
 */

import type { Resort, ResortImage } from '@/lib/types';

/**
 * Get the card image for a resort (for dashboard/listing cards)
 * Returns the image marked as isCardImage, or the first image as fallback
 */
export function getCardImage(resort: Resort): ResortImage | undefined {
  if (!resort.images || resort.images.length === 0) return undefined;
  return resort.images.find((img) => img.isCardImage) || resort.images[0];
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
