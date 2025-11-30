/**
 * Feature Flag Hook
 *
 * React hook for checking feature flag status in components.
 *
 * Usage:
 *   const isEnabled = useFeatureFlag('planYourVisitCard');
 *   if (!isEnabled) return null;
 *
 *   // Or get all flags:
 *   const flags = useFeatureFlags();
 *   if (flags.trailMapCard) { ... }
 */

import { featureFlags, FeatureFlag } from '@/lib/config/feature-flags';

/**
 * Check if a specific feature flag is enabled
 *
 * @param flag - The feature flag name to check
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const showCard = useFeatureFlag('planYourVisitCard');
 *   if (!showCard) return null;
 *   return <div>Card content</div>;
 * }
 * ```
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}

/**
 * Get all feature flags
 *
 * @returns The complete feature flags object
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const flags = useFeatureFlags();
 *   return (
 *     <>
 *       {flags.planYourVisitCard && <PlanYourVisitCard />}
 *       {flags.trailMapCard && <TrailMapCard />}
 *     </>
 *   );
 * }
 * ```
 */
export function useFeatureFlags(): typeof featureFlags {
  return featureFlags;
}
