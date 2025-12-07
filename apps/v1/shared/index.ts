// Shared barrel export

// Types (full export)
export * from './types';

// Utils (explicit exports to avoid conflict with formatDistance in types/dining.ts)
export {
  cn,
  formatNumber,
  formatSnowfall,
  formatRating,
  // Note: formatDistance is intentionally not re-exported here
  // Use @shared/utils for the general formatDistance
  // Use @shared/types (from dining.ts) for the proximity-aware formatDistance
  getDismissedAlertIds,
  addDismissedAlertId,
  clearDismissedAlerts,
  PLACEHOLDER_IMAGE,
  getCardImage,
  getCardImageUrl,
  getHeroImage,
  getSortedImages,
  getRelatedResortsByPass,
  getResortsInState,
  getNearbyResorts,
  generateResortFAQs,
} from './utils';

export type { FAQItem } from './utils';

// Config (full export - no conflicts)
export * from './config';

// Hooks (full export - no conflicts)
export * from './hooks';

// API (TanStack Query infrastructure)
export * from './api';

// State (Zustand stores)
export * from './state';
