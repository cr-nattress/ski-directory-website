/**
 * Resort Scoring Algorithm
 *
 * Computes an engagement score for each resort based on multiple factors:
 * - Size and stature (skiable acres, vertical drop, lifts, runs)
 * - Terrain diversity (balance across difficulty levels)
 * - Content completeness (how well-documented the resort is)
 * - Pass affiliations (Epic, Ikon, Indy boost)
 * - Operational status (active vs lost)
 *
 * All scores are normalized to 0-1 range.
 * Final score is deterministic: same input = same output.
 */

import type { Resort } from '@/lib/types';
import {
  SCORING_WEIGHTS,
  SIZE_THRESHOLDS,
  PASS_BOOSTS,
  CONTENT_WEIGHTS,
  CONTENT_THRESHOLDS,
  STATUS_SCORES,
  IDEAL_TERRAIN_DISTRIBUTION,
  RANDOMNESS_CONFIG,
} from './scoring-config';

// ============================================================================
// Types
// ============================================================================

/**
 * Detailed breakdown of a resort's score
 */
export interface ResortScoreBreakdown {
  // Component scores (0-1)
  sizeScore: number;
  terrainDiversityScore: number;
  contentScore: number;
  passBoost: number;
  statusScore: number;

  // Final scores
  baseScore: number;        // Weighted combination of components (0-1)
  finalScore: number;       // Base score + randomness (0-1)
  displayScore: number;     // Scaled for display (0-100)
}

/**
 * Minimal resort data needed for scoring
 */
export interface ScorableResort {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  isLost: boolean;
  stats: {
    skiableAcres: number;
    verticalDrop: number;
    liftsCount: number;
    runsCount: number;
    avgAnnualSnowfall?: number;
  };
  terrain: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  features: {
    hasPark: boolean;
    hasHalfpipe: boolean;
    hasNightSkiing: boolean;
    hasBackcountryAccess: boolean;
    hasSpaVillage: boolean;
  };
  passAffiliations: string[];
  tags: string[];
  websiteUrl?: string;
  location: {
    lat: number;
    lng: number;
  };
}

// ============================================================================
// Size Scoring
// ============================================================================

/**
 * Normalize a value to 0-1 range based on a threshold.
 * Values at or above threshold = 1.0
 * Values below threshold = proportional
 */
function normalize(value: number, threshold: number): number {
  if (threshold <= 0) return 0;
  return Math.min(1, Math.max(0, value / threshold));
}

/**
 * Compute size score based on resort statistics.
 * Larger resorts score higher, with diminishing returns above thresholds.
 */
export function computeSizeScore(resort: ScorableResort): number {
  const { stats } = resort;
  const weights = SCORING_WEIGHTS.size;
  const thresholds = SIZE_THRESHOLDS;

  const acresScore = normalize(stats.skiableAcres || 0, thresholds.skiableAcres);
  const verticalScore = normalize(stats.verticalDrop || 0, thresholds.verticalDrop);
  const liftsScore = normalize(stats.liftsCount || 0, thresholds.liftsCount);
  const runsScore = normalize(stats.runsCount || 0, thresholds.runsCount);

  // Weighted sum, then normalize to account for total weight
  const totalWeight = weights.skiableAcres + weights.verticalDrop + weights.liftsCount + weights.runsCount;

  const weightedSum =
    acresScore * weights.skiableAcres +
    verticalScore * weights.verticalDrop +
    liftsScore * weights.liftsCount +
    runsScore * weights.runsCount;

  return weightedSum / totalWeight;
}

// ============================================================================
// Terrain Diversity Scoring
// ============================================================================

/**
 * Compute terrain diversity score.
 * A balanced distribution across difficulty levels scores higher.
 * Single-difficulty resorts (e.g., all beginner) score lower.
 */
export function computeTerrainDiversityScore(resort: ScorableResort): number {
  const { terrain } = resort;
  const ideal = IDEAL_TERRAIN_DISTRIBUTION;

  // Calculate total terrain percentage (should be ~100)
  const total = terrain.beginner + terrain.intermediate + terrain.advanced + terrain.expert;

  // If no terrain data, return 0
  if (total === 0) return 0;

  // Normalize terrain percentages
  const normalized = {
    beginner: terrain.beginner / total,
    intermediate: terrain.intermediate / total,
    advanced: terrain.advanced / total,
    expert: terrain.expert / total,
  };

  // Calculate deviation from ideal distribution
  // Lower deviation = higher score
  const deviation =
    Math.abs(normalized.beginner - ideal.beginner) +
    Math.abs(normalized.intermediate - ideal.intermediate) +
    Math.abs(normalized.advanced - ideal.advanced) +
    Math.abs(normalized.expert - ideal.expert);

  // Max possible deviation is 2.0 (all terrain in one category)
  // Convert to score: 0 deviation = 1.0, 2.0 deviation = 0
  const diversityScore = Math.max(0, 1 - deviation / 2);

  // Also reward having some expert terrain (differentiator)
  const expertBonus = normalized.expert > 0.05 ? 0.1 : 0;

  return Math.min(1, diversityScore + expertBonus);
}

// ============================================================================
// Content Completeness Scoring
// ============================================================================

/**
 * Compute content completeness score.
 * Resorts with more complete data score higher.
 */
export function computeContentScore(resort: ScorableResort): number {
  const weights = CONTENT_WEIGHTS;
  const thresholds = CONTENT_THRESHOLDS;

  // Description score
  const descLength = resort.description?.length || 0;
  const descriptionScore = descLength >= thresholds.descriptionMinLength ? 1.0 :
    descLength > 0 ? descLength / thresholds.descriptionMinLength : 0;

  // Stats score (key stats filled)
  const statsPresent = [
    resort.stats.skiableAcres > 0,
    resort.stats.verticalDrop > 0,
    resort.stats.liftsCount > 0,
  ];
  const statsScore = statsPresent.filter(Boolean).length / statsPresent.length;

  // Terrain score (percentages add up to ~100)
  const terrainTotal = resort.terrain.beginner + resort.terrain.intermediate +
    resort.terrain.advanced + resort.terrain.expert;
  const terrainScore = terrainTotal >= 90 && terrainTotal <= 110 ? 1.0 :
    terrainTotal > 0 ? 0.5 : 0;

  // Features score (any features set)
  const featuresSet = Object.values(resort.features).filter(Boolean).length;
  const featuresScore = featuresSet > 0 ? Math.min(1, featuresSet / 3) : 0;

  // Tags score
  const tagsCount = resort.tags?.length || 0;
  const tagsScore = tagsCount >= thresholds.minTags ? 1.0 :
    tagsCount > 0 ? tagsCount / thresholds.minTags : 0;

  // Website URL score
  const websiteScore = resort.websiteUrl ? 1.0 : 0;

  // Location score
  const locationScore = (resort.location.lat !== 0 && resort.location.lng !== 0) ? 1.0 : 0;

  // Weighted sum
  return (
    descriptionScore * weights.description +
    statsScore * weights.stats +
    terrainScore * weights.terrain +
    featuresScore * weights.features +
    tagsScore * weights.tags +
    websiteScore * weights.websiteUrl +
    locationScore * weights.location
  );
}

// ============================================================================
// Pass Affiliation Scoring
// ============================================================================

/**
 * Compute pass affiliation boost.
 * Resorts with major passes get a small visibility boost.
 */
export function computePassBoost(resort: ScorableResort): number {
  const affiliations = resort.passAffiliations || [];

  // Take the highest boost if multiple passes
  let maxBoost = 0;

  for (const pass of affiliations) {
    const boost = PASS_BOOSTS[pass as keyof typeof PASS_BOOSTS] || 0;
    maxBoost = Math.max(maxBoost, boost);
  }

  return maxBoost;
}

// ============================================================================
// Status Scoring
// ============================================================================

/**
 * Compute status score based on operational state.
 * Active resorts score highest, lost resorts lower.
 */
export function computeStatusScore(resort: ScorableResort): number {
  if (resort.isLost) {
    return STATUS_SCORES.lost;
  }
  if (resort.isActive) {
    return STATUS_SCORES.active;
  }
  return STATUS_SCORES.inactive;
}

// ============================================================================
// Randomness
// ============================================================================

/**
 * Simple seeded random number generator (mulberry32)
 */
function seededRandom(seed: number): number {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

/**
 * Generate a hash from a string (for seeding)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get the daily seed for randomness.
 * Changes once per day for consistent ordering within a day.
 */
function getDailySeed(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

/**
 * Add light randomness to a score.
 * Deterministic based on resort ID and daily seed.
 */
export function addRandomness(score: number, resortId: string): number {
  if (!RANDOMNESS_CONFIG.enabled) {
    return score;
  }

  const seed = hashString(resortId + getDailySeed());
  const random = seededRandom(seed);

  // Map random [0,1] to [-maxDeviation, +maxDeviation]
  const deviation = (random * 2 - 1) * RANDOMNESS_CONFIG.maxDeviation;

  return Math.max(0, Math.min(1, score + deviation));
}

// ============================================================================
// Main Scoring Function
// ============================================================================

/**
 * Compute the full score breakdown for a resort.
 * Returns all component scores and the final weighted score.
 */
export function computeResortScore(resort: ScorableResort): ResortScoreBreakdown {
  // Compute component scores
  const sizeScore = computeSizeScore(resort);
  const terrainDiversityScore = computeTerrainDiversityScore(resort);
  const contentScore = computeContentScore(resort);
  const passBoost = computePassBoost(resort);
  const statusScore = computeStatusScore(resort);

  // Compute weighted base score
  const weights = SCORING_WEIGHTS;

  // Size contributes its full weighted amount
  const sizeWeight = weights.size.skiableAcres + weights.size.verticalDrop +
    weights.size.liftsCount + weights.size.runsCount;

  const baseScore =
    sizeScore * sizeWeight +
    terrainDiversityScore * weights.terrainDiversity +
    contentScore * weights.contentCompleteness +
    passBoost * weights.passAffiliation +
    statusScore * weights.activeStatus;

  // Add randomness for final score
  const finalScore = addRandomness(baseScore, resort.id);

  // Scale to 0-100 for display
  const displayScore = Math.round(finalScore * 100);

  return {
    sizeScore,
    terrainDiversityScore,
    contentScore,
    passBoost,
    statusScore,
    baseScore,
    finalScore,
    displayScore,
  };
}

/**
 * Compute just the final score (for sorting).
 * More efficient when you don't need the breakdown.
 */
export function computeFinalScore(resort: ScorableResort): number {
  return computeResortScore(resort).finalScore;
}

/**
 * Sort resorts by their computed score (highest first).
 */
export function sortResortsByScore<T extends ScorableResort>(resorts: T[]): T[] {
  return [...resorts].sort((a, b) => {
    const scoreA = computeFinalScore(a);
    const scoreB = computeFinalScore(b);
    return scoreB - scoreA;
  });
}

/**
 * Adapter to convert a Resort type to ScorableResort.
 * Handles missing/optional fields gracefully.
 */
export function toScorableResort(resort: Resort): ScorableResort {
  return {
    id: resort.id,
    slug: resort.slug,
    name: resort.name,
    description: resort.description,
    isActive: resort.isActive,
    isLost: resort.isLost,
    stats: {
      skiableAcres: resort.stats?.skiableAcres || 0,
      verticalDrop: resort.stats?.verticalDrop || 0,
      liftsCount: resort.stats?.liftsCount || 0,
      runsCount: resort.stats?.runsCount || 0,
      avgAnnualSnowfall: resort.stats?.avgAnnualSnowfall,
    },
    terrain: {
      beginner: resort.terrain?.beginner || 0,
      intermediate: resort.terrain?.intermediate || 0,
      advanced: resort.terrain?.advanced || 0,
      expert: resort.terrain?.expert || 0,
    },
    features: {
      hasPark: resort.features?.hasPark || false,
      hasHalfpipe: resort.features?.hasHalfpipe || false,
      hasNightSkiing: resort.features?.hasNightSkiing || false,
      hasBackcountryAccess: resort.features?.hasBackcountryAccess || false,
      hasSpaVillage: resort.features?.hasSpaVillage || false,
    },
    passAffiliations: resort.passAffiliations || [],
    tags: resort.tags || [],
    websiteUrl: resort.websiteUrl,
    location: {
      lat: resort.location?.lat || 0,
      lng: resort.location?.lng || 0,
    },
  };
}
