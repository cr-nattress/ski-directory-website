# Story 34.10: Run Full Enrichment for All Resorts

## Priority: Medium

## Phase: Execution

## Context

After successful testing, run the enricher against all active resorts in the database to populate ski shop data.

## Requirements

1. Plan enrichment run strategy
2. Execute full enrichment
3. Monitor progress and costs
4. Handle any failures
5. Verify final results

## Pre-Execution Checklist

Before running full enrichment:

- [ ] Testing complete (Story 34.9)
- [ ] Prompt refined based on test results
- [ ] OpenAI API key has sufficient credits
- [ ] Database backups in place
- [ ] Monitoring dashboards ready
- [ ] Off-peak time selected for run

## Execution Strategy

### Option A: Full Run (Recommended for <200 resorts)

```bash
# Run all at once with logging
npm run dev -- enrich-all --verbose 2>&1 | tee enrichment-run-$(date +%Y%m%d).log
```

### Option B: Phased by State

```bash
# Run state by state for better control
npm run dev -- enrich-state CO
npm run dev -- enrich-state UT
npm run dev -- enrich-state CA
# ... etc
```

### Option C: Batched with Breaks

```bash
# First 50 resorts
npm run dev -- enrich-all --limit 50

# Wait, verify, then next 50
npm run dev -- enrich-all --limit 50 --offset 50
# ... etc
```

## Monitoring During Run

### Console Output

Watch for:
- Progress percentage
- Shops found per resort
- Any error messages
- Cost accumulation

### Database Monitoring

```sql
-- Watch enrichment progress
SELECT
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  SUM(shops_created) as total_shops_created,
  SUM(total_cost) as total_cost
FROM ski_shop_enrichment_logs
WHERE started_at > NOW() - INTERVAL '1 hour';
```

### Cost Tracking

```sql
-- Track OpenAI costs
SELECT
  SUM(total_cost) as total_cost,
  AVG(total_cost) as avg_cost_per_resort,
  COUNT(*) as resorts_processed
FROM ski_shop_enrichment_logs
WHERE started_at > NOW() - INTERVAL '1 day';
```

## Error Handling

### If Run Fails Mid-Way

```bash
# Check which resorts were already processed
SELECT resort_name
FROM ski_shop_enrichment_logs
WHERE started_at > 'YYYY-MM-DD'
AND status = 'success';

# Resume from failed resort
npm run dev -- enrich-resort <failed-resort-slug>

# Or skip processed and continue
# (Would require implementing --skip-processed flag)
```

### Common Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| Rate limit exceeded | Too many requests | Increase delay between requests |
| API timeout | Large response | Reduce max_tokens or radius |
| Invalid JSON | Parse error | Check OpenAI response format |
| Network error | Connectivity | Retry after delay |

## Post-Execution Verification

### Summary Statistics

```sql
-- Overall results
SELECT
  (SELECT COUNT(*) FROM ski_shops WHERE source = 'openai') as total_shops,
  (SELECT COUNT(DISTINCT resort_id) FROM resort_ski_shops) as resorts_with_shops,
  (SELECT COUNT(*) FROM resorts WHERE is_active = true) as total_resorts,
  (SELECT SUM(total_cost) FROM ski_shop_enrichment_logs) as total_cost;
```

### Coverage Report

```sql
-- Resorts without any shops
SELECT r.name, r.state_name
FROM resorts r
LEFT JOIN resort_ski_shops rs ON r.id = rs.resort_id
WHERE r.is_active = true
AND rs.id IS NULL
ORDER BY r.state_name, r.name;

-- Shops per resort distribution
SELECT
  r.name,
  COUNT(rs.id) as shop_count
FROM resorts r
LEFT JOIN resort_ski_shops rs ON r.id = rs.resort_id
WHERE r.is_active = true
GROUP BY r.id, r.name
ORDER BY shop_count DESC;
```

### Data Quality Spot Checks

Randomly sample 10 resorts and verify:

1. [ ] Shop names are real businesses
2. [ ] Distances are reasonable
3. [ ] On-mountain flags are correct
4. [ ] No obvious duplicates

## Final Report Template

```markdown
# Ski Shop Enrichment Report - [Date]

## Summary

| Metric | Value |
|--------|-------|
| Resorts Processed | X |
| Resorts with Shops | X |
| Total Shops Created | X |
| Total Cost | $X.XX |
| Duration | X hours |

## Coverage

- States covered: X
- Resorts with 0 shops: X
- Average shops per resort: X.X

## Issues Encountered

1. [Issue description]
2. [Issue description]

## Follow-Up Actions

- [ ] Manual review of resorts with 0 shops
- [ ] Verify high shop count resorts
- [ ] Update any incorrect data

## Notes

[Additional observations]
```

## Acceptance Criteria

- [ ] All active resorts processed
- [ ] >90% resorts have at least 1 shop
- [ ] Total cost within budget (<$15)
- [ ] No critical errors in logs
- [ ] Coverage report generated
- [ ] Data quality verified

## Effort: Medium (2-4 hours including monitoring)
