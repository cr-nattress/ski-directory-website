-- Migration: 005_resorts_ranked_view
-- Description: Create view for ranked resorts with pre-computed engagement scores
-- Created: 2025-11-30
-- Epic: 24 - Intelligent Resort Listing & Discovery Engine

-- ============================================================================
-- RESORTS RANKED VIEW
-- Pre-computes engagement scores for efficient sorting by relevance.
-- Mirrors the TypeScript scoring algorithm in lib/scoring/resort-score.ts
-- ============================================================================

DROP VIEW IF EXISTS resorts_ranked;

CREATE VIEW resorts_ranked AS
WITH score_components AS (
  SELECT
    rf.*,

    -- ========================================================================
    -- SIZE SCORE (0-1)
    -- Normalized by thresholds: acres/5000, vertical/4000, lifts/30, runs/200
    -- ========================================================================
    (
      LEAST(1.0, COALESCE((rf.stats->>'skiableAcres')::numeric, 0) / 5000.0) * 0.15 +
      LEAST(1.0, COALESCE((rf.stats->>'verticalDrop')::numeric, 0) / 4000.0) * 0.12 +
      LEAST(1.0, COALESCE((rf.stats->>'liftsCount')::numeric, 0) / 30.0) * 0.08 +
      LEAST(1.0, COALESCE((rf.stats->>'runsCount')::numeric, 0) / 200.0) * 0.05
    ) / 0.40 AS size_score,

    -- ========================================================================
    -- TERRAIN DIVERSITY SCORE (0-1)
    -- Measures balance across difficulty levels vs ideal distribution
    -- Ideal: 20% beginner, 40% intermediate, 25% advanced, 15% expert
    -- ========================================================================
    CASE
      WHEN COALESCE((rf.terrain->>'beginner')::numeric, 0) +
           COALESCE((rf.terrain->>'intermediate')::numeric, 0) +
           COALESCE((rf.terrain->>'advanced')::numeric, 0) +
           COALESCE((rf.terrain->>'expert')::numeric, 0) = 0 THEN 0
      ELSE
        GREATEST(0, 1.0 - (
          ABS(COALESCE((rf.terrain->>'beginner')::numeric, 0) / 100.0 - 0.20) +
          ABS(COALESCE((rf.terrain->>'intermediate')::numeric, 0) / 100.0 - 0.40) +
          ABS(COALESCE((rf.terrain->>'advanced')::numeric, 0) / 100.0 - 0.25) +
          ABS(COALESCE((rf.terrain->>'expert')::numeric, 0) / 100.0 - 0.15)
        ) / 2.0) +
        -- Expert terrain bonus
        CASE WHEN COALESCE((rf.terrain->>'expert')::numeric, 0) > 5 THEN 0.1 ELSE 0 END
    END AS terrain_diversity_score,

    -- ========================================================================
    -- CONTENT COMPLETENESS SCORE (0-1)
    -- Rewards well-documented resorts
    -- ========================================================================
    (
      -- Description (20%): present and meaningful length
      CASE
        WHEN rf.description IS NOT NULL AND LENGTH(rf.description) >= 100 THEN 1.0
        WHEN rf.description IS NOT NULL AND LENGTH(rf.description) > 0 THEN LENGTH(rf.description) / 100.0
        ELSE 0
      END * 0.20 +

      -- Stats (25%): key stats filled
      (
        CASE WHEN COALESCE((rf.stats->>'skiableAcres')::numeric, 0) > 0 THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.stats->>'verticalDrop')::numeric, 0) > 0 THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.stats->>'liftsCount')::numeric, 0) > 0 THEN 1 ELSE 0 END
      ) / 3.0 * 0.25 +

      -- Terrain (15%): percentages add up properly
      CASE
        WHEN COALESCE((rf.terrain->>'beginner')::numeric, 0) +
             COALESCE((rf.terrain->>'intermediate')::numeric, 0) +
             COALESCE((rf.terrain->>'advanced')::numeric, 0) +
             COALESCE((rf.terrain->>'expert')::numeric, 0) BETWEEN 90 AND 110 THEN 1.0
        WHEN COALESCE((rf.terrain->>'beginner')::numeric, 0) +
             COALESCE((rf.terrain->>'intermediate')::numeric, 0) +
             COALESCE((rf.terrain->>'advanced')::numeric, 0) +
             COALESCE((rf.terrain->>'expert')::numeric, 0) > 0 THEN 0.5
        ELSE 0
      END * 0.15 +

      -- Features (15%): any features set
      LEAST(1.0, (
        CASE WHEN COALESCE((rf.features->>'hasPark')::boolean, false) THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.features->>'hasHalfpipe')::boolean, false) THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.features->>'hasNightSkiing')::boolean, false) THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.features->>'hasBackcountryAccess')::boolean, false) THEN 1 ELSE 0 END +
        CASE WHEN COALESCE((rf.features->>'hasSpaVillage')::boolean, false) THEN 1 ELSE 0 END
      ) / 3.0) * 0.15 +

      -- Tags (10%): has tags
      CASE
        WHEN rf.tags IS NOT NULL AND array_length(rf.tags, 1) >= 3 THEN 1.0
        WHEN rf.tags IS NOT NULL AND array_length(rf.tags, 1) > 0 THEN array_length(rf.tags, 1) / 3.0
        ELSE 0
      END * 0.10 +

      -- Website (10%): URL present
      CASE WHEN rf.website_url IS NOT NULL AND rf.website_url != '' THEN 1.0 ELSE 0 END * 0.10 +

      -- Location (5%): valid coordinates
      CASE WHEN rf.lat IS NOT NULL AND rf.lng IS NOT NULL AND rf.lat != 0 AND rf.lng != 0 THEN 1.0 ELSE 0 END * 0.05
    ) AS content_score,

    -- ========================================================================
    -- PASS AFFILIATION BOOST (0-0.1)
    -- Epic/Ikon get 0.08, Indy 0.04, Local 0.02
    -- ========================================================================
    CASE
      WHEN rf.pass_affiliations IS NOT NULL AND 'epic' = ANY(rf.pass_affiliations) THEN 0.08
      WHEN rf.pass_affiliations IS NOT NULL AND 'ikon' = ANY(rf.pass_affiliations) THEN 0.08
      WHEN rf.pass_affiliations IS NOT NULL AND 'indy' = ANY(rf.pass_affiliations) THEN 0.04
      WHEN rf.pass_affiliations IS NOT NULL AND 'local' = ANY(rf.pass_affiliations) THEN 0.02
      ELSE 0
    END AS pass_boost,

    -- ========================================================================
    -- STATUS SCORE (0-1)
    -- Active: 1.0, Lost: 0.3, Inactive: 0.5
    -- ========================================================================
    CASE
      WHEN rf.is_lost THEN 0.3
      WHEN rf.is_active THEN 1.0
      ELSE 0.5
    END AS status_score

  FROM resorts_full rf
)
SELECT
  sc.*,

  -- ========================================================================
  -- FINAL RANKING SCORE (0-100)
  -- Weighted combination of all components
  -- Weights: size=0.40, terrain=0.15, content=0.20, pass=0.10, status=0.15
  -- ========================================================================
  ROUND(
    (
      sc.size_score * 0.40 +
      sc.terrain_diversity_score * 0.15 +
      sc.content_score * 0.20 +
      sc.pass_boost * 0.10 +
      sc.status_score * 0.15
    ) * 100
  , 2) AS ranking_score

FROM score_components sc
ORDER BY ranking_score DESC, sc.name ASC;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON VIEW resorts_ranked IS 'Resort data with pre-computed engagement scores for intelligent ordering. Higher scores indicate more relevant/appealing resorts.';

-- ============================================================================
-- INDEX RECOMMENDATION
-- The view is based on resorts_full which already has necessary indexes.
-- For production, consider materializing this view if query performance becomes an issue.
-- ============================================================================
