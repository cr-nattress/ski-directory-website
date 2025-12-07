/**
 * Query hooks barrel export
 */

// Resort queries
export {
  useResortsQuery,
  useAllResortsQuery,
  useResortsByPassQuery,
  useFeaturedResortsQuery,
  useNearbyResortsQuery,
} from './useResortsQuery';

// Single resort query
export { useResortQuery, useResortByIdQuery } from './useResortQuery';

// Map pins query
export { useMapPinsQuery } from './useMapPinsQuery';

// Search query
export { useSearchQuery, useInstantSearchQuery } from './useSearchQuery';

// Alerts query
export { useAlertsQuery } from './useAlertsQuery';
