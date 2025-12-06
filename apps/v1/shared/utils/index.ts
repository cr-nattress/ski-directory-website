/**
 * Shared Utils barrel export
 * All utility functions available from @shared/utils
 */

// Core utilities
export { cn } from './cn';

// Formatters
export {
  formatNumber,
  formatSnowfall,
  formatDistance,
  formatRating,
} from './formatters';

// Alert utilities
export {
  getDismissedAlertIds,
  addDismissedAlertId,
  clearDismissedAlerts,
} from './alerts';

// Resort image utilities
export {
  PLACEHOLDER_IMAGE,
  getCardImage,
  getCardImageUrl,
  getHeroImage,
  getSortedImages,
} from './resort-images';

// Related resorts utilities
export {
  getRelatedResortsByPass,
  getResortsInState,
  getNearbyResorts,
} from './related-resorts';

// FAQ generation
export { generateResortFAQs } from './generate-resort-faqs';
export type { FAQItem } from './generate-resort-faqs';
