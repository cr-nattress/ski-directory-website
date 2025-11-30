/**
 * Scoring Configuration
 *
 * Centralized configuration for the resort ranking algorithm.
 * All weights and thresholds can be adjusted here without changing
 * the scoring logic.
 */

/**
 * Weight configuration for different scoring components.
 * All weights should sum to approximately 1.0 for the base score.
 */
export const SCORING_WEIGHTS = {
  // Size and stature (40% of base score)
  size: {
    skiableAcres: 0.15,
    verticalDrop: 0.12,
    liftsCount: 0.08,
    runsCount: 0.05,
  },

  // Terrain diversity (15% of base score)
  terrainDiversity: 0.15,

  // Content completeness (20% of base score)
  contentCompleteness: 0.20,

  // Pass affiliation boost (10% of base score)
  passAffiliation: 0.10,

  // Active/operational status (15% of base score)
  activeStatus: 0.15,
} as const;

/**
 * Normalization thresholds for size metrics.
 * Values at or above these thresholds receive a score of 1.0.
 * These represent "top tier" benchmarks based on major resorts.
 */
export const SIZE_THRESHOLDS = {
  // Skiable acres: Vail has ~5,300, Park City ~7,300
  skiableAcres: 5000,

  // Vertical drop: Revelstoke has 5,620ft, Jackson Hole 4,139ft
  verticalDrop: 4000,

  // Lifts: Large resorts have 30-40 lifts
  liftsCount: 30,

  // Runs: Major resorts have 150-300+ runs
  runsCount: 200,
} as const;

/**
 * Pass affiliation boost values.
 * Major passes get a small boost to reflect market relevance.
 */
export const PASS_BOOSTS = {
  epic: 0.08,
  ikon: 0.08,
  indy: 0.04,
  local: 0.02,
  // No pass = 0 boost
} as const;

/**
 * Content completeness field weights.
 * Fields are weighted by their importance to user experience.
 */
export const CONTENT_WEIGHTS = {
  description: 0.20,      // Description present and meaningful
  stats: 0.25,            // Key stats filled (acres, vertical, lifts)
  terrain: 0.15,          // Terrain breakdown provided
  features: 0.15,         // Feature flags populated
  tags: 0.10,             // Tags array has entries
  websiteUrl: 0.10,       // Website URL present
  location: 0.05,         // Valid coordinates
} as const;

/**
 * Minimum content thresholds
 */
export const CONTENT_THRESHOLDS = {
  // Minimum description length to be considered "complete"
  descriptionMinLength: 100,

  // Minimum number of tags to get full tag score
  minTags: 3,
} as const;

/**
 * Status scoring values
 */
export const STATUS_SCORES = {
  // Active, operating resorts
  active: 1.0,

  // Lost/defunct resorts (historical value but not operational)
  lost: 0.3,

  // Inactive but not lost (seasonal closure, etc.)
  inactive: 0.5,
} as const;

/**
 * Terrain diversity ideal distribution.
 * A "perfectly diverse" resort matches this distribution.
 * Deviation from this reduces the terrain diversity score.
 */
export const IDEAL_TERRAIN_DISTRIBUTION = {
  beginner: 0.20,
  intermediate: 0.40,
  advanced: 0.25,
  expert: 0.15,
} as const;

/**
 * Random noise configuration for light randomness.
 */
export const RANDOMNESS_CONFIG = {
  // Enable/disable randomness
  enabled: true,

  // Maximum deviation (+/-) from base score
  maxDeviation: 0.03,

  // Seed changes daily to provide consistent ordering within a day
  seedType: 'daily' as const,
} as const;
