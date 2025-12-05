# Story 31.7: Create Supabase Update Service

## Description

Create a service that updates Supabase resort records with the AI-enriched data, applying confidence thresholds and handling JSONB field updates.

## Acceptance Criteria

- [ ] Updates resort record with enriched data
- [ ] Only applies fields above confidence threshold
- [ ] Updates JSONB fields (stats, terrain) correctly
- [ ] Supports dry-run mode (preview without writing)
- [ ] Logs which fields were updated
- [ ] Handles update failures gracefully

## Technical Details

### Implementation (supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { AIEnrichmentResult, ScoredValue } from './types';

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

export interface UpdateResult {
  success: boolean;
  fieldsUpdated: string[];
  fieldsSkipped: string[];
  error?: string;
}

export interface UpdateOptions {
  dryRun?: boolean;
  minConfidence?: number;
  skipExisting?: boolean;
}

/**
 * Get resort by slug to check existing values
 */
export async function getResortBySlug(slug: string) {
  const { data, error } = await supabase
    .from('resorts')
    .select('id, slug, tagline, description, stats, terrain')
    .eq('slug', slug)
    .single();

  if (error) {
    throw new Error(`Failed to fetch resort: ${error.message}`);
  }

  return data;
}

/**
 * Update resort with enriched data
 */
export async function updateResortWithEnrichment(
  slug: string,
  enrichment: AIEnrichmentResult,
  options: UpdateOptions = {}
): Promise<UpdateResult> {
  const { dryRun = true, minConfidence = 0.7, skipExisting = false } = options;

  // Get current resort data
  const resort = await getResortBySlug(slug);
  if (!resort) {
    return { success: false, fieldsUpdated: [], fieldsSkipped: [], error: 'Resort not found' };
  }

  const fieldsUpdated: string[] = [];
  const fieldsSkipped: string[] = [];
  const updates: Record<string, unknown> = {};

  // Helper to check and add field
  const addField = <T>(
    fieldName: string,
    scored: ScoredValue<T>,
    currentValue: T | null | undefined
  ) => {
    if (scored.confidence < minConfidence) {
      fieldsSkipped.push(`${fieldName} (confidence: ${scored.confidence.toFixed(2)})`);
      return;
    }

    if (skipExisting && currentValue != null && currentValue !== '') {
      fieldsSkipped.push(`${fieldName} (existing value)`);
      return;
    }

    updates[fieldName] = scored.value;
    fieldsUpdated.push(fieldName);
  };

  // Content fields
  addField('tagline', enrichment.content.tagline, resort.tagline);
  addField('description', enrichment.content.description, resort.description);

  // Stats JSONB - merge with existing
  const existingStats = resort.stats || {};
  const statsUpdates: Record<string, unknown> = { ...existingStats };
  let statsChanged = false;

  for (const [key, scored] of Object.entries(enrichment.stats)) {
    if (scored.confidence >= minConfidence) {
      if (!skipExisting || existingStats[key] == null) {
        statsUpdates[key] = scored.value;
        fieldsUpdated.push(`stats.${key}`);
        statsChanged = true;
      } else {
        fieldsSkipped.push(`stats.${key} (existing value)`);
      }
    } else {
      fieldsSkipped.push(`stats.${key} (confidence: ${scored.confidence.toFixed(2)})`);
    }
  }

  if (statsChanged) {
    updates.stats = statsUpdates;
  }

  // Terrain JSONB - merge with existing
  const existingTerrain = resort.terrain || {};
  const terrainUpdates: Record<string, unknown> = { ...existingTerrain };
  let terrainChanged = false;

  for (const [key, scored] of Object.entries(enrichment.terrain)) {
    if (scored.confidence >= minConfidence) {
      if (!skipExisting || existingTerrain[key] == null) {
        terrainUpdates[key] = scored.value;
        fieldsUpdated.push(`terrain.${key}`);
        terrainChanged = true;
      } else {
        fieldsSkipped.push(`terrain.${key} (existing value)`);
      }
    } else {
      fieldsSkipped.push(`terrain.${key} (confidence: ${scored.confidence.toFixed(2)})`);
    }
  }

  if (terrainChanged) {
    updates.terrain = terrainUpdates;
  }

  // If no updates, return early
  if (Object.keys(updates).length === 0) {
    return { success: true, fieldsUpdated, fieldsSkipped };
  }

  // Dry run - just return what would be updated
  if (dryRun) {
    console.log('DRY RUN - Would update:', updates);
    return { success: true, fieldsUpdated, fieldsSkipped };
  }

  // Apply updates
  const { error } = await supabase
    .from('resorts')
    .update(updates)
    .eq('id', resort.id);

  if (error) {
    return {
      success: false,
      fieldsUpdated,
      fieldsSkipped,
      error: error.message,
    };
  }

  return { success: true, fieldsUpdated, fieldsSkipped };
}

/**
 * Batch update multiple resorts
 */
export async function batchUpdateResorts(
  updates: Array<{ slug: string; enrichment: AIEnrichmentResult }>,
  options: UpdateOptions = {}
): Promise<Map<string, UpdateResult>> {
  const results = new Map<string, UpdateResult>();

  for (const { slug, enrichment } of updates) {
    const result = await updateResortWithEnrichment(slug, enrichment, options);
    results.set(slug, result);

    // Small delay between updates
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
```

### Console Output Example

```
Updating resort: vail
  ✓ tagline (confidence: 0.95)
  ✓ description (confidence: 0.92)
  ✓ stats.liftsCount (confidence: 0.95)
  ✓ stats.verticalDrop (confidence: 0.95)
  ✓ stats.summitElevation (confidence: 0.95)
  ✓ stats.baseElevation (confidence: 0.95)
  ✓ stats.skiableAcres (confidence: 0.95)
  ✗ stats.avgAnnualSnowfall (existing value)
  ✓ terrain.beginner (confidence: 0.90)
  ✓ terrain.intermediate (confidence: 0.90)
  ✓ terrain.advanced (confidence: 0.90)
  ✗ terrain.expert (confidence: 0.65)

  Updated 10 fields, skipped 2
```

## Tasks

- [ ] Create `src/supabase.ts`
- [ ] Implement `getResortBySlug()`
- [ ] Implement `updateResortWithEnrichment()`
- [ ] Add confidence threshold filtering
- [ ] Add skip-existing logic
- [ ] Add dry-run support
- [ ] Implement `batchUpdateResorts()`
- [ ] Test with sample updates

## Effort

**Size:** M (Medium - 2-4 hours)

## Dependencies

- Story 31.1: Project structure
- Story 31.5: Type definitions

## References

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Existing Supabase implementation](../../apps/updaters/wikidata-enricher/src/supabase.ts)
