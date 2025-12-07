/**
 * Query hooks barrel export
 */

// Resort queries
export {
  useResortsQuery,
  useAllResortsQuery,
  useAllResorts,
  useResortsByPassQuery,
  useFeaturedResortsQuery,
  useNearbyResortsQuery,
} from './useResortsQuery';

// Single resort query
export { useResortQuery, useResortByIdQuery } from './useResortQuery';

// Map pins query
export { useMapPinsQuery, useMapPins } from './useMapPinsQuery';

// Search query
export { useSearchQuery, useInstantSearchQuery } from './useSearchQuery';

// Alerts query
export { useAlertsQuery } from './useAlertsQuery';

// Themed resorts query
export {
  useThemedResortsQuery,
  useThemedResorts,
  THEMED_SECTIONS,
} from './useThemedResortsQuery';
export type { ThemedSections } from './useThemedResortsQuery';
