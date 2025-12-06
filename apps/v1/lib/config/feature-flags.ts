/**
 * Feature Flags Configuration
 *
 * Toggle UI components on/off without code changes.
 * All flags default to `true` for backward compatibility.
 *
 * Usage:
 *   import { featureFlags } from '@/lib/config/feature-flags';
 *   if (featureFlags.planYourVisitCard) { ... }
 *
 * Or use the hook:
 *   import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';
 *   const isEnabled = useFeatureFlag('planYourVisitCard');
 */

export const featureFlags = {
  // ============================================
  // Resort Detail Page Components
  // ============================================

  /** Plan Your Visit card with conditions and save button */
  planYourVisitCard: false,

  /** Trail Map card showing resort trail map image */
  trailMapCard: false,

  /** Weather Forecast card with 7-day forecast */
  weatherForecastCard: true,

  /** Social Media card with resort social links */
  socialMediaCard: true,

  /** Location Map card with interactive Leaflet map */
  locationMapCard: true,

  /** Ski Shops card showing nearby ski shops (disabled in favor of nearbyServicesCard) */
  skiShopsCard: false,

  /** Dining Venues card showing nearby restaurants and bars (disabled in favor of nearbyServicesCard) */
  diningVenuesCard: false,

  /** Consolidated Nearby Services card with toggle between shops/dining (Story 37.17) */
  nearbyServicesCard: true,

  // ============================================
  // Global Components
  // ============================================

  /** Global alert banner system (snow reports, weather alerts, etc.) */
  alertBanner: false,

  // ============================================
  // Resort Card Components
  // ============================================

  /** Star rating and review count on resort cards */
  resortCardRating: false,

  /** Distance and snowfall stats row on resort cards */
  resortCardSnowfall: false,

  /** Terrain open progress bar on resort cards */
  resortCardTerrainOpen: false,

  /** Live lift status on resort cards (Liftie integration) */
  resortCardLiftStatus: true,

  // ============================================
  // Resort Detail Page - Conditions Components
  // ============================================

  /** Live conditions section on resort detail (Liftie data) */
  liveConditions: true,

  /** Individual lift status list on resort detail */
  liftStatusList: true,

  /** Webcam gallery on resort detail */
  webcamGallery: true,

  // ============================================
  // Landing Page Features
  // ============================================

  /** Infinite scroll on landing page resort cards */
  infiniteScroll: true,

  /** Hero search form widget */
  heroSearchForm: false,

  /** "Latest from the slopes" articles section */
  contentSection: false,

  /** Intelligent resort listing with ranked ordering (Epic 24) */
  intelligentListing: true,

  /** Category chips filter buttons ("Browse by experience") */
  categoryChips: false,

  /** Engagement tracking for resort impressions/clicks (Epic 24) */
  engagementTracking: false,

  // ============================================
  // Directory Page Components
  // ============================================

  /** Filter dropdowns on directory page */
  directoryFilters: true,

  /** State filter dropdown */
  stateFilter: true,

  /** Country filter dropdown */
  countryFilter: true,

  // ============================================
  // Future Features (disabled by default)
  // ============================================

  /** User authentication system */
  userAuthentication: false,

  /** Resort reviews and ratings by users */
  resortReviews: false,

  /** Save/favorite resorts feature */
  savedResorts: false,

  /** Compare multiple resorts side-by-side */
  compareResorts: false,

  // ============================================
  // Observability & Monitoring (Epic 25)
  // ============================================

  /** Ship logs to Grafana Cloud Loki */
  observabilityLogging: false,
} as const;

/**
 * Type representing all available feature flag names
 */
export type FeatureFlag = keyof typeof featureFlags;

/**
 * Get a specific feature flag value
 */
export function getFeatureFlag(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag] === true;
}
