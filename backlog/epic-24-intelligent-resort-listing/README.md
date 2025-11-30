# Epic 24: Intelligent Resort Listing & Discovery Engine

## Overview

Transform the landing page from an alphabetical infinite scroll into a **dynamic, intelligent discovery engine** that captivates users immediately and encourages deep exploration—even with zero user personalization.

**Current State:**
- Landing page lists all active/defunct ski resorts
- Sorted alphabetically (A-Z)
- Infinite scroll with category filter chips
- No ranking or scoring logic
- Static data (rating, conditions hardcoded)

**Goal State:**
- Multi-factor engagement scoring for intelligent ordering
- Netflix-style themed sections ("Top Destinations", "Hidden Gems", etc.)
- Diversity constraints to prevent Colorado/Epic domination
- Light randomness to keep discovery fresh
- Foundation for future engagement-based optimization

---

## Architecture Decisions

### New Components (Don't Modify Existing)
To minimize risk and allow A/B testing, we'll create NEW components rather than heavily modifying existing ones:

| New Component | Replaces/Augments | Purpose |
|---------------|-------------------|---------|
| `IntelligentResortSection` | `ResortSection` | New landing page orchestrator |
| `ResortRow` | (new) | Horizontal scrolling row for sections |
| `ResortRowCard` | (new) | Compact card for row display |
| `DiscoverySections` | (new) | Netflix-style themed sections container |
| `useRankedResorts` | (new hook) | Fetch resorts with scoring |
| `useThemedResorts` | (new hook) | Fetch themed section data |

### Database Changes
- Add `ranking_score` computed column or view
- Add `content_completeness_score` computed field
- Add `visual_richness_score` (requires GCS assets.json integration)
- Create `resorts_ranked` view with pre-computed scores

### Feature Flag
- `intelligentListing: false` (default off during development)
- Easy toggle between old/new landing page

---

## Phased Implementation

### Phase 1: Foundation (Stories 1-3)
Build the scoring infrastructure without changing the UI.

### Phase 2: Ranked Infinite Scroll (Stories 4-5)
Replace alphabetical sort with intelligent ranking.

### Phase 3: Themed Sections (Stories 6-8)
Add Netflix-style discovery sections above the scroll.

### Phase 4: Diversity & Polish (Stories 9-10)
Add diversity constraints, randomness, and refinements.

### Phase 5: Future Enhancements (Stories 11-12)
Engagement tracking foundation, A/B testing.

---

## User Stories

---

### Story 1: Resort Scoring Algorithm - Base Score
**Phase 1 | Priority: High | Estimate: 4 points**

**As a** developer
**I want** a scoring algorithm that computes a base engagement score for each resort
**So that** resorts can be ranked by quality/appeal rather than alphabetically

#### Acceptance Criteria
- [ ] Create `lib/scoring/resort-score.ts` with scoring functions
- [ ] Implement base score components (all normalized 0-1):
  - Size score: `skiableAcres`, `verticalDrop`, `liftsCount`
  - Terrain diversity score: balance across beginner/intermediate/advanced/expert
  - Pass affiliation boost: Epic/Ikon get small boost
  - Active status: active resorts score higher than lost
- [ ] Create TypeScript types for scoring configuration
- [ ] Unit tests for scoring functions
- [ ] Score is deterministic (same input = same output)

#### Technical Notes
```typescript
interface ResortScore {
  baseScore: number;      // 0-1
  sizeScore: number;      // 0-1
  terrainScore: number;   // 0-1
  passBoost: number;      // 0-0.1
  activeBoost: number;    // 0 or 0.1
}

function computeBaseScore(resort: Resort): ResortScore;
```

#### Verification
- [ ] Run scoring on all resorts, verify distribution
- [ ] Top-scored resorts make intuitive sense (Vail, Park City, etc.)
- [ ] Small resorts still get reasonable scores
- [ ] Lost resorts scored lower than active

---

### Story 2: Content Completeness Scoring
**Phase 1 | Priority: High | Estimate: 3 points**

**As a** developer
**I want** to score resorts based on how complete their data is
**So that** well-documented resorts rank higher and encourage data quality

#### Acceptance Criteria
- [ ] Add content completeness scoring to `resort-score.ts`
- [ ] Score based on presence/quality of:
  - Description (exists, length > 100 chars)
  - Stats filled (skiableAcres, verticalDrop, liftsCount > 0)
  - Terrain percentages (sum to ~100%)
  - Features populated (any features set to true)
  - Tags present (array length > 0)
  - Website URL present
  - Location coordinates valid
- [ ] Normalize to 0-1 scale
- [ ] Add to overall base score calculation

#### Technical Notes
```typescript
interface ContentScore {
  descriptionScore: number;  // 0-1
  statsScore: number;        // 0-1
  terrainScore: number;      // 0-1
  featuresScore: number;     // 0-1
  tagsScore: number;         // 0-1
  total: number;             // 0-1 weighted average
}

function computeContentScore(resort: Resort): ContentScore;
```

#### Verification
- [ ] Resorts with complete data score higher
- [ ] Identify resorts with low content scores for data improvement
- [ ] Score distribution is reasonable (not all 0 or all 1)

---

### Story 3: Database View for Ranked Resorts
**Phase 1 | Priority: High | Estimate: 3 points**

**As a** developer
**I want** a Supabase view that includes pre-computed ranking scores
**So that** sorting by score is efficient at the database level

#### Acceptance Criteria
- [ ] Create migration `20251201_001_resorts_ranked_view.sql`
- [ ] View computes scores using SQL:
  - Size score from stats JSONB
  - Terrain diversity score
  - Content completeness indicators
  - Pass affiliation presence
  - Active/lost status
- [ ] Combined `ranking_score` column (0-100 scale for readability)
- [ ] View includes all fields from `resorts_full` plus scores
- [ ] Index on `ranking_score` for efficient sorting

#### Technical Notes
```sql
CREATE VIEW resorts_ranked AS
SELECT
  *,
  -- Size score (normalized)
  LEAST(1.0, (COALESCE((stats->>'skiableAcres')::numeric, 0) / 5000.0)) * 0.3 +
  LEAST(1.0, (COALESCE((stats->>'verticalDrop')::numeric, 0) / 4000.0)) * 0.2 +
  -- ... other components
  AS ranking_score
FROM resorts_full
ORDER BY ranking_score DESC;
```

#### Verification
- [ ] Run migration on Supabase
- [ ] Query view, verify scores are computed
- [ ] Top 20 resorts by score are reasonable
- [ ] Performance acceptable (<500ms for full query)

---

### Story 4: Ranked Resort Hook
**Phase 2 | Priority: High | Estimate: 3 points**

**As a** developer
**I want** a React hook that fetches resorts sorted by ranking score
**So that** the frontend can display intelligently ordered resorts

#### Acceptance Criteria
- [ ] Create `lib/hooks/useRankedResorts.ts`
- [ ] Hook fetches from `resorts_ranked` view
- [ ] Supports pagination (infinite scroll compatible)
- [ ] Returns resorts ordered by `ranking_score DESC`
- [ ] Includes loading/error states
- [ ] Respects feature flag (falls back to alphabetical if disabled)

#### Technical Notes
```typescript
interface UseRankedResortsOptions {
  pageSize?: number;
  enabled?: boolean;
}

interface UseRankedResortsResult {
  resorts: Resort[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  error: Error | null;
}

function useRankedResorts(options?: UseRankedResortsOptions): UseRankedResortsResult;
```

#### Verification
- [ ] Hook returns resorts in score order
- [ ] Pagination works correctly
- [ ] Feature flag toggle works
- [ ] No regression in load times

---

### Story 5: Integrate Ranked Sorting into Landing Page
**Phase 2 | Priority: High | Estimate: 2 points**

**As a** user
**I want** the landing page to show resorts in an engaging order
**So that** I see interesting resorts first rather than alphabetical

#### Acceptance Criteria
- [ ] Add feature flag `intelligentListing` to feature-flags.ts
- [ ] Update `ResortSection` to use `useRankedResorts` when flag enabled
- [ ] Maintain existing category filtering (client-side post-filter)
- [ ] Update "Showing X of Y resorts" text appropriately
- [ ] No visual changes to cards or layout

#### Technical Notes
- Minimal changes to `ResortSection.tsx`
- Just swap data source based on feature flag
- Category filtering continues to work on ranked results

#### Verification
- [ ] Flag off: alphabetical order (current behavior)
- [ ] Flag on: ranked order (Vail, Park City near top)
- [ ] Category filters work with both modes
- [ ] Infinite scroll works with both modes

---

### Story 6: Resort Row Component
**Phase 3 | Priority: Medium | Estimate: 3 points**

**As a** user
**I want** to see themed horizontal rows of resorts
**So that** I can discover resorts by category without scrolling through everything

#### Acceptance Criteria
- [ ] Create `components/discovery/ResortRow.tsx`
- [ ] Horizontal scrolling row with:
  - Section title (e.g., "Top Destinations Right Now")
  - Left/right scroll arrows (desktop)
  - Touch swipe support (mobile)
  - "View All" link
- [ ] Create `components/discovery/ResortRowCard.tsx`
  - Compact card design (smaller than main ResortCard)
  - Shows: image, name, location, pass badges
  - Hover effect
- [ ] Responsive: 2 cards mobile, 4 tablet, 6 desktop visible

#### Technical Notes
```typescript
interface ResortRowProps {
  title: string;
  icon?: string;
  resorts: Resort[];
  viewAllHref?: string;
  maxVisible?: number;
}
```

#### Verification
- [ ] Row scrolls smoothly
- [ ] Cards are clickable, link to resort detail
- [ ] Responsive breakpoints work
- [ ] Accessible (keyboard navigation)

---

### Story 7: Themed Section Data Queries
**Phase 3 | Priority: Medium | Estimate: 4 points**

**As a** developer
**I want** efficient queries for themed resort sections
**So that** the discovery sections load quickly

#### Acceptance Criteria
- [ ] Create `lib/api/themed-resorts-service.ts`
- [ ] Implement themed queries:
  - `getTopDestinations(limit)` - highest ranked active resorts
  - `getHiddenGems(limit)` - high score + small/medium size
  - `getNightAndPark(limit)` - hasNightSkiing OR hasPark features
  - `getPowderAndSteeps(limit)` - high expert% + high snowfall
  - `getLostSkiAreas(limit)` - isLost = true, by score
- [ ] Each query returns max 12 resorts
- [ ] Create `useThemedResorts` hook for frontend

#### Technical Notes
```typescript
interface ThemedSections {
  topDestinations: Resort[];
  hiddenGems: Resort[];
  nightAndPark: Resort[];
  powderAndSteeps: Resort[];
  lostSkiAreas: Resort[];
}

function useThemedResorts(): {
  sections: ThemedSections | null;
  isLoading: boolean;
  error: Error | null;
};
```

#### Verification
- [ ] Each section returns appropriate resorts
- [ ] No duplicates across sections (or acceptable overlap)
- [ ] Query performance acceptable (<1s total)

---

### Story 8: Discovery Sections Component
**Phase 3 | Priority: Medium | Estimate: 3 points**

**As a** user
**I want** to see curated discovery sections on the landing page
**So that** I can quickly find resorts that match my interests

#### Acceptance Criteria
- [ ] Create `components/discovery/DiscoverySections.tsx`
- [ ] Renders themed ResortRows:
  1. "Top Destinations Right Now" (top ranked)
  2. "Hidden Gems" (small mountains, high appeal)
  3. "Night Skiing & Terrain Parks"
  4. "Powder & Steeps" (expert terrain)
  5. "Lost Ski Areas" (historical curiosity)
- [ ] Sections collapse gracefully if empty
- [ ] Loading skeleton state
- [ ] Feature flag controlled

#### Technical Notes
- Component uses `useThemedResorts` hook
- Each section is a `ResortRow`
- Consider lazy loading sections below fold

#### Verification
- [ ] All 5 sections render with appropriate resorts
- [ ] Sections are visually distinct
- [ ] Loading state shows skeletons
- [ ] Mobile layout works well

---

### Story 9: Intelligent Landing Page Integration
**Phase 3 | Priority: Medium | Estimate: 3 points**

**As a** user
**I want** a landing page that combines discovery sections with infinite scroll
**So that** I get both curated picks and full browsing capability

#### Acceptance Criteria
- [ ] Create `components/IntelligentResortSection.tsx`
- [ ] Layout structure:
  1. Category chips (existing)
  2. Discovery sections (new - when no category selected)
  3. "All Resorts" heading
  4. Infinite scroll (ranked order)
- [ ] When category selected: hide discovery sections, show filtered results
- [ ] Feature flag toggles between old/new section component
- [ ] Update `app/page.tsx` to use new component when flag enabled

#### Technical Notes
- New component, doesn't modify `ResortSection.tsx`
- Can A/B test by toggling feature flag
- Discovery sections only show when viewing "All"

#### Verification
- [ ] Discovery sections appear above infinite scroll
- [ ] Selecting category hides sections, shows filtered
- [ ] "All Resorts" returns to full view with sections
- [ ] Performance acceptable (no double-fetching)

---

### Story 10: Diversity Constraints
**Phase 4 | Priority: Medium | Estimate: 3 points**

**As a** user
**I want** the landing page to show variety
**So that** I discover resorts from different states/sizes, not just Colorado mega-resorts

#### Acceptance Criteria
- [ ] Implement diversity algorithm in scoring:
  - State diversity: no more than 3 from same state in top 12
  - Size diversity: mix of large/medium/small in top 20
  - Pass diversity: not all Epic/Ikon in top 10
- [ ] Apply to "Top Destinations" section primarily
- [ ] Document algorithm in code comments

#### Technical Notes
```typescript
function applyDiversityConstraints(
  resorts: Resort[],
  constraints: DiversityConfig
): Resort[];
```

Could be done:
- Client-side post-processing
- Or in SQL with window functions

#### Verification
- [ ] Top 12 has resorts from at least 4 different states
- [ ] Mix of resort sizes visible
- [ ] Not dominated by single pass program

---

### Story 11: Light Randomness
**Phase 4 | Priority: Low | Estimate: 2 points**

**As a** user
**I want** slight variation in resort order between visits
**So that** I discover new resorts over time

#### Acceptance Criteria
- [ ] Add small random factor to final score: ±3%
- [ ] Randomness seeded by date (changes daily, not per-request)
- [ ] Configurable via scoring config
- [ ] Can be disabled via config

#### Technical Notes
```typescript
function addRandomness(score: number, seed: string): number {
  // Deterministic random based on resort ID + date seed
  const noise = seededRandom(seed) * 0.06 - 0.03; // -3% to +3%
  return score + noise;
}
```

#### Verification
- [ ] Same day = same order
- [ ] Different day = slightly different order
- [ ] Top resorts stay near top (randomness is small)

---

### Story 12: Engagement Tracking Foundation (Future)
**Phase 5 | Priority: Low | Estimate: 5 points**

**As a** developer
**I want** to track user engagement with resorts
**So that** we can improve rankings based on actual behavior

#### Acceptance Criteria
- [ ] Create `resort_impressions` table in Supabase
- [ ] Track: resort_id, timestamp, event_type (impression, click, dwell)
- [ ] Create API endpoint for logging events
- [ ] Add client-side impression tracking (IntersectionObserver)
- [ ] Privacy-conscious: no user ID, aggregate only

#### Technical Notes
This is foundation work for future multi-armed bandit optimization.
Not connected to ranking initially—just data collection.

#### Verification
- [ ] Events logged to database
- [ ] Can query impression counts per resort
- [ ] No PII collected

---

## Implementation Order

```
Phase 1 (Foundation):
  Story 1 → Story 2 → Story 3

Phase 2 (Ranked Scroll):
  Story 4 → Story 5
  [VERIFY: Landing page shows ranked resorts]

Phase 3 (Themed Sections):
  Story 6 → Story 7 → Story 8 → Story 9
  [VERIFY: Discovery sections working]

Phase 4 (Polish):
  Story 10 → Story 11
  [VERIFY: Good variety, slight randomness]

Phase 5 (Future):
  Story 12 (can be deferred)
```

---

## Rollback Plan

If issues arise:
1. Set `intelligentListing: false` in feature flags
2. Landing page reverts to current alphabetical infinite scroll
3. No data loss, no breaking changes

---

## Success Metrics

- **Engagement**: Users scroll further, click more resorts
- **Discovery**: Clicks distributed across more resorts (not just top alphabetical)
- **Performance**: Page load time < 2s, no regressions
- **Diversity**: Top 20 visible resorts span 5+ states

---

## Files to Create (New)

```
lib/scoring/
  resort-score.ts
  scoring-config.ts
  diversity.ts

lib/hooks/
  useRankedResorts.ts
  useThemedResorts.ts

lib/api/
  themed-resorts-service.ts

components/discovery/
  ResortRow.tsx
  ResortRowCard.tsx
  DiscoverySections.tsx

components/
  IntelligentResortSection.tsx

supabase/migrations/
  20251201_001_resorts_ranked_view.sql
```

## Files to Modify (Minimal)

```
lib/config/feature-flags.ts  - Add intelligentListing flag
app/page.tsx                 - Conditionally use new section component
```

---

## Dependencies

- Epic 23 (Infinite Scroll) - COMPLETED
- Epic 22 (Feature Flags) - COMPLETED
- Supabase database access
- Current resort data quality (stats, features, tags)
