# Story 37.17: Run Initial Enrichment

## Description

Execute the dining enricher for all active ski resorts to populate the database with initial dining venue data.

## Acceptance Criteria

- [ ] Enricher script runs successfully
- [ ] All active resorts processed
- [ ] Minimum 5 venues per resort (average)
- [ ] Audit trail saved to GCS
- [ ] Cost tracking logged
- [ ] Error handling for failed resorts
- [ ] Summary report generated

## Execution Plan

### 1. Pre-flight Checks

```bash
# Verify environment variables
cd apps/updaters/dining-enricher
cat .env | grep -E "(SUPABASE|OPENAI|GCS)"

# Verify database connection
npm run dev -- stats

# Dry run first resort
npm run dev -- enrich-resort vail --dry-run
```

### 2. Run by State (Recommended)

Process states one at a time to monitor progress and catch issues early:

```bash
# High-priority states first (most resorts)
npm run dev -- enrich-state colorado --limit 5  # Test first 5
npm run dev -- enrich-state colorado            # Full state

npm run dev -- enrich-state utah
npm run dev -- enrich-state california
npm run dev -- enrich-state vermont
npm run dev -- enrich-state montana

# Continue with remaining states...
npm run dev -- enrich-all --force  # Catch any missed
```

### 3. Monitor Progress

```bash
# Check stats during run
npm run dev -- stats

# View pending resorts
npm run dev -- list-pending

# Check enrichment logs in database
# SELECT resort_name, status, venues_found, total_cost
# FROM dining_enrichment_logs
# ORDER BY created_at DESC LIMIT 20;
```

### 4. Verify Results

```sql
-- Total venues created
SELECT COUNT(*) FROM dining_venues;

-- Venues per resort (average)
SELECT AVG(venue_count) FROM (
  SELECT resort_id, COUNT(*) as venue_count
  FROM resort_dining_venues
  GROUP BY resort_id
) sub;

-- Resorts without venues
SELECT r.name, r.slug
FROM resorts r
LEFT JOIN resort_dining_venues rdv ON r.id = rdv.resort_id
WHERE rdv.id IS NULL AND r.is_active = true;

-- Total cost
SELECT SUM(total_cost) as total_cost FROM dining_enrichment_logs;

-- Success rate
SELECT
  status,
  COUNT(*) as count,
  AVG(venues_found) as avg_venues
FROM dining_enrichment_logs
GROUP BY status;
```

### 5. Fix Failed Resorts

```bash
# Re-run failed resorts
npm run dev -- enrich-resort <failed-slug> --force

# Or re-run entire state
npm run dev -- enrich-state <state> --force
```

## Expected Results

| Metric | Target |
|--------|--------|
| Resorts processed | 300+ |
| Success rate | > 95% |
| Avg venues/resort | 5-15 |
| Total venues | 2,000-4,000 |
| Total cost | < $20 |
| Duration | 2-4 hours |

## Cost Estimation

```
Assumptions:
- 300 resorts
- ~1,500 tokens per request (prompt + response)
- GPT-4-turbo pricing: $0.01/1K input + $0.03/1K output

Estimate:
- Input: 300 * 500 tokens * $0.01/1K = $1.50
- Output: 300 * 1,000 tokens * $0.03/1K = $9.00
- Total: ~$10-15

With buffer for retries: ~$15-20
```

## Post-Enrichment Tasks

1. **Data Quality Check**
   - Spot check venue details for accuracy
   - Verify coordinates are reasonable
   - Check for obvious duplicates

2. **Enable Feature Flags**
   - Enable `diningVenues` in staging
   - Test UI components with real data
   - Verify map pins display correctly

3. **Performance Testing**
   - Test API response times
   - Verify page load with dining data
   - Check mobile performance

4. **Documentation**
   - Update README with enrichment stats
   - Document any manual corrections needed
   - Log lessons learned for future enrichments

## Effort

Medium (2-3 hours)
