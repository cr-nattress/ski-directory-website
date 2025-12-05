# Story 34.9: Test with Sample Resorts

## Priority: High

## Phase: Testing

## Context

Before running enrichment on all resorts, thoroughly test the system with a small sample to verify data quality and catch any issues.

## Requirements

1. Select diverse test resorts (different states, sizes)
2. Run enrichment and verify results
3. Check data quality in Supabase
4. Validate OpenAI response accuracy
5. Document any issues for refinement

## Test Plan

### Test Resorts Selection

Choose 5-10 resorts with diverse characteristics:

| Resort | State | Size | Why Selected |
|--------|-------|------|--------------|
| Vail | CO | Large | Major resort, many shops expected |
| Park City | UT | Large | Different state, tourist area |
| Mammoth Mountain | CA | Large | California market |
| Schweitzer | ID | Medium | Smaller market |
| Mad River Glen | VT | Small | East coast, limited shops |
| Whistler | BC | Large | Canadian resort |
| Big Sky | MT | Large | Remote location |

### Test Execution Steps

```bash
# 1. Test single resort first
npm run dev -- enrich-resort vail --verbose

# 2. Verify in Supabase
# - Check ski_shops table for new entries
# - Verify resort_ski_shops links
# - Check enrichment_logs for details

# 3. Test another resort
npm run dev -- enrich-resort park-city --verbose

# 4. Check for duplicates
# If both resorts share nearby shops, verify deduplication worked

# 5. Test a state
npm run dev -- enrich-state CO --limit 3 --verbose

# 6. Verify batch processing
# - Check progress logging
# - Verify rate limiting delays
# - Check all resorts processed
```

### Data Quality Checks

#### Verify Ski Shop Data

```sql
-- Check recently created shops
SELECT
  name, city, state,
  shop_type, services,
  website_url,
  created_at
FROM ski_shops
WHERE source = 'openai'
ORDER BY created_at DESC
LIMIT 20;

-- Check for missing data
SELECT
  name,
  CASE WHEN latitude IS NULL THEN 'missing lat' END,
  CASE WHEN longitude IS NULL THEN 'missing lng' END,
  CASE WHEN website_url IS NULL THEN 'no website' END
FROM ski_shops
WHERE source = 'openai';

-- Check coordinate bounds
SELECT name, latitude, longitude
FROM ski_shops
WHERE latitude < 24 OR latitude > 72
   OR longitude < -170 OR longitude > -50;
```

#### Verify Resort Links

```sql
-- Check resort-shop links
SELECT
  r.name as resort,
  s.name as shop,
  rs.distance_miles,
  rs.is_on_mountain
FROM resort_ski_shops rs
JOIN resorts r ON r.id = rs.resort_id
JOIN ski_shops s ON s.id = rs.ski_shop_id
ORDER BY r.name, rs.distance_miles;

-- Check for resorts with no shops
SELECT r.name
FROM resorts r
LEFT JOIN resort_ski_shops rs ON r.id = rs.resort_id
WHERE rs.id IS NULL
AND r.is_active = true;
```

#### Verify Enrichment Logs

```sql
-- Check enrichment results
SELECT
  resort_name,
  status,
  shops_found,
  shops_created,
  total_cost,
  duration_ms
FROM ski_shop_enrichment_logs
ORDER BY started_at DESC
LIMIT 20;

-- Check for errors
SELECT resort_name, error_message
FROM ski_shop_enrichment_logs
WHERE status = 'failed';
```

### Manual Verification

For each test resort, manually verify:

1. [ ] Shop names are real businesses
2. [ ] Addresses are accurate
3. [ ] Coordinates are correct location
4. [ ] Website URLs work (if provided)
5. [ ] Shop types make sense
6. [ ] Distance calculations are reasonable

### Known Issues to Watch For

1. **Hallucinated shops**: OpenAI may invent shops that don't exist
2. **Outdated information**: Shops may have closed
3. **Wrong coordinates**: Coordinates may be approximations
4. **Missing data**: Websites/phones may not be provided
5. **Duplicate variations**: "Christy Sports" vs "Christy Sports Vail"

### Prompt Refinement

Based on test results, refine the prompt:

```typescript
// If too many fake shops:
// Add: "Only include businesses you are highly confident exist."

// If missing on-mountain shops:
// Add: "Include resort-operated rental shops at the base area."

// If coordinates are inaccurate:
// Add: "Provide precise GPS coordinates, not approximations."
```

## Acceptance Criteria

- [ ] 5+ resorts tested successfully
- [ ] Data quality verified in Supabase
- [ ] No duplicate shops created
- [ ] Distance calculations accurate
- [ ] Enrichment logs captured correctly
- [ ] Any prompt refinements documented
- [ ] Known issues documented

## Test Results Template

```markdown
## Test Results - [Date]

### Resort: [Name]

**Command:** `npm run dev -- enrich-resort [slug]`

**Results:**
- Shops found: X
- Shops created: X
- Duration: Xs
- Cost: $X.XX

**Data Quality:**
- [ ] Names accurate
- [ ] Addresses verified
- [ ] Coordinates correct
- [ ] Websites working

**Issues:**
- [List any issues found]

**Notes:**
- [Additional observations]
```

## Effort: Small (2-3 hours)
