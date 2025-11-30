/**
 * Feature Flag Wrapper Component
 *
 * Conditionally renders children based on feature flag status.
 * Provides a declarative way to toggle UI sections.
 *
 * Usage:
 *   <FeatureFlag name="trailMapCard">
 *     <TrailMapCard resort={resort} />
 *   </FeatureFlag>
 *
 *   // With fallback:
 *   <FeatureFlag name="planYourVisitCard" fallback={<ComingSoon />}>
 *     <PlanYourVisitCard resort={resort} />
 *   </FeatureFlag>
 */

import { ReactNode } from 'react';
import { featureFlags, FeatureFlag as FeatureFlagType } from '@/lib/config/feature-flags';

interface FeatureFlagProps {
  /** The feature flag name to check */
  name: FeatureFlagType;
  /** Content to render when flag is enabled */
  children: ReactNode;
  /** Optional content to render when flag is disabled */
  fallback?: ReactNode;
}

/**
 * Conditionally render content based on a feature flag
 *
 * @example
 * ```tsx
 * // Simple usage - hide if disabled
 * <FeatureFlag name="trailMapCard">
 *   <section>
 *     <TrailMapCard resort={resort} />
 *   </section>
 * </FeatureFlag>
 *
 * // With fallback content
 * <FeatureFlag
 *   name="weatherForecastCard"
 *   fallback={<div>Weather coming soon</div>}
 * >
 *   <WeatherForecastCard resort={resort} />
 * </FeatureFlag>
 * ```
 */
export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  if (!featureFlags[name]) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
