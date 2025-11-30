/**
 * Diversity Constraints for Resort Listings
 *
 * Ensures variety in resort listings by applying constraints:
 * - State diversity: No more than N resorts from the same state in top results
 * - Size diversity: Mix of large, medium, and small resorts
 * - Pass diversity: Not dominated by a single pass program
 *
 * Applied primarily to "Top Destinations" section to prevent
 * Colorado/Epic domination and encourage discovery.
 */

import type { Resort } from '@/lib/types';

/**
 * Configuration for diversity constraints
 */
export interface DiversityConfig {
  // Maximum resorts from same state in result set
  maxPerState: number;

  // Maximum resorts with same primary pass in result set
  maxPerPass: number;

  // Target distribution of resort sizes
  sizeTargets: {
    large: number;   // Min large resorts (3000+ acres)
    medium: number;  // Min medium resorts (1000-3000 acres)
    small: number;   // Min small resorts (<1000 acres)
  };

  // Total results to return
  resultLimit: number;
}

/**
 * Default diversity config for Top Destinations (12 resorts)
 */
export const DEFAULT_DIVERSITY_CONFIG: DiversityConfig = {
  maxPerState: 3,      // Max 3 from any single state
  maxPerPass: 5,       // Max 5 from Epic or Ikon
  sizeTargets: {
    large: 4,          // At least 4 large resorts
    medium: 3,         // At least 3 medium resorts
    small: 2,          // At least 2 small resorts
  },
  resultLimit: 12,
};

/**
 * Size category thresholds (skiable acres)
 */
const SIZE_CATEGORIES = {
  large: 3000,   // 3000+ acres = large
  medium: 1000,  // 1000-2999 acres = medium
  // < 1000 acres = small
} as const;

/**
 * Get the size category of a resort
 */
function getSizeCategory(resort: Resort): 'large' | 'medium' | 'small' {
  const acres = resort.stats?.skiableAcres || 0;
  if (acres >= SIZE_CATEGORIES.large) return 'large';
  if (acres >= SIZE_CATEGORIES.medium) return 'medium';
  return 'small';
}

/**
 * Get the primary pass affiliation (first one, or 'none')
 */
function getPrimaryPass(resort: Resort): string {
  const passes = resort.passAffiliations || [];
  // Prioritize major passes
  if (passes.includes('epic')) return 'epic';
  if (passes.includes('ikon')) return 'ikon';
  if (passes.length > 0) return passes[0];
  return 'none';
}

/**
 * Apply diversity constraints to a list of resorts.
 *
 * Algorithm:
 * 1. Start with empty result set
 * 2. Iterate through ranked resorts
 * 3. For each resort, check if adding it violates constraints
 * 4. If not, add it; if yes, skip to next
 * 5. Continue until result limit reached
 *
 * This preserves the general ranking order while ensuring diversity.
 *
 * @param resorts - Resorts pre-sorted by ranking score (highest first)
 * @param config - Diversity configuration
 * @returns Diversified subset of resorts
 */
export function applyDiversityConstraints(
  resorts: Resort[],
  config: DiversityConfig = DEFAULT_DIVERSITY_CONFIG
): Resort[] {
  const result: Resort[] = [];

  // Track counts for constraints
  const stateCounts: Record<string, number> = {};
  const passCounts: Record<string, number> = {};
  const sizeCounts: Record<string, number> = { large: 0, medium: 0, small: 0 };

  // Track which resorts we've added
  const addedIds = new Set<string>();

  // First pass: fill slots while respecting max constraints
  for (const resort of resorts) {
    if (result.length >= config.resultLimit) break;

    const state = resort.stateCode || 'unknown';
    const pass = getPrimaryPass(resort);
    const size = getSizeCategory(resort);

    // Check state constraint
    const stateCount = stateCounts[state] || 0;
    if (stateCount >= config.maxPerState) continue;

    // Check pass constraint
    const passCount = passCounts[pass] || 0;
    if (pass !== 'none' && passCount >= config.maxPerPass) continue;

    // Add resort
    result.push(resort);
    addedIds.add(resort.id);
    stateCounts[state] = stateCount + 1;
    passCounts[pass] = passCount + 1;
    sizeCounts[size]++;
  }

  // Check if we need more diversity in size categories
  // If we haven't hit result limit but are missing size categories,
  // do a second pass to fill gaps
  if (result.length < config.resultLimit) {
    const needLarge = Math.max(0, config.sizeTargets.large - sizeCounts.large);
    const needMedium = Math.max(0, config.sizeTargets.medium - sizeCounts.medium);
    const needSmall = Math.max(0, config.sizeTargets.small - sizeCounts.small);

    // Second pass: fill size gaps (relax other constraints slightly)
    for (const resort of resorts) {
      if (result.length >= config.resultLimit) break;
      if (addedIds.has(resort.id)) continue;

      const state = resort.stateCode || 'unknown';
      const size = getSizeCategory(resort);
      const stateCount = stateCounts[state] || 0;

      // Still respect state constraint but be slightly more lenient
      if (stateCount >= config.maxPerState + 1) continue;

      // Only add if we need this size category
      const needed =
        (size === 'large' && needLarge > sizeCounts.large - config.sizeTargets.large) ||
        (size === 'medium' && needMedium > sizeCounts.medium - config.sizeTargets.medium) ||
        (size === 'small' && needSmall > sizeCounts.small - config.sizeTargets.small);

      if (needed) {
        result.push(resort);
        addedIds.add(resort.id);
        stateCounts[state] = stateCount + 1;
        sizeCounts[size]++;
      }
    }
  }

  // Final pass: fill remaining slots if we still haven't hit limit
  if (result.length < config.resultLimit) {
    for (const resort of resorts) {
      if (result.length >= config.resultLimit) break;
      if (addedIds.has(resort.id)) continue;

      const state = resort.stateCode || 'unknown';
      const stateCount = stateCounts[state] || 0;

      // Only check state constraint on final pass
      if (stateCount < config.maxPerState + 2) {
        result.push(resort);
        addedIds.add(resort.id);
        stateCounts[state] = stateCount + 1;
      }
    }
  }

  return result;
}

/**
 * Get diversity statistics for a set of resorts
 * Useful for debugging and verification
 */
export function getDiversityStats(resorts: Resort[]): {
  stateDistribution: Record<string, number>;
  passDistribution: Record<string, number>;
  sizeDistribution: Record<string, number>;
  uniqueStates: number;
} {
  const stateDistribution: Record<string, number> = {};
  const passDistribution: Record<string, number> = {};
  const sizeDistribution: Record<string, number> = { large: 0, medium: 0, small: 0 };

  for (const resort of resorts) {
    // State
    const state = resort.stateCode || 'unknown';
    stateDistribution[state] = (stateDistribution[state] || 0) + 1;

    // Pass
    const pass = getPrimaryPass(resort);
    passDistribution[pass] = (passDistribution[pass] || 0) + 1;

    // Size
    const size = getSizeCategory(resort);
    sizeDistribution[size]++;
  }

  return {
    stateDistribution,
    passDistribution,
    sizeDistribution,
    uniqueStates: Object.keys(stateDistribution).length,
  };
}
