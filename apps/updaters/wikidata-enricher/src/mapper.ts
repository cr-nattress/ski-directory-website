import type { Resort, ExtractedData, ProposedChange, ConfidenceValue } from './types.js';
import { config } from './config.js';

/**
 * Map extracted data to Supabase schema and generate proposed changes
 */
export function mapExtractedData(
  resort: Resort,
  extracted: ExtractedData,
  skipExisting: boolean,
  minConfidence: number = config.processing.minConfidence
): {
  proposedChanges: ProposedChange[];
  skippedFields: Array<{ field: string; reason: string; confidence?: number }>;
} {
  const proposedChanges: ProposedChange[] = [];
  const skippedFields: Array<{ field: string; reason: string; confidence?: number }> = [];

  // Helper to check if we should propose a change
  function checkField<T>(
    field: string,
    extracted: ConfidenceValue<T>,
    currentValue: T | null | undefined,
    transform?: (v: T) => unknown
  ): void {
    // Skip if no extracted value
    if (extracted.value === null || extracted.value === undefined) {
      skippedFields.push({ field, reason: 'no data extracted' });
      return;
    }

    // Skip if below confidence threshold
    if (extracted.confidence < minConfidence) {
      skippedFields.push({
        field,
        reason: `low confidence (${(extracted.confidence * 100).toFixed(0)}% < ${(minConfidence * 100).toFixed(0)}%)`,
        confidence: extracted.confidence,
      });
      return;
    }

    // Skip if existing value and skipExisting is true
    if (skipExisting && currentValue !== null && currentValue !== undefined) {
      // Check if it's a non-empty string
      if (typeof currentValue === 'string' && currentValue.trim().length > 0) {
        skippedFields.push({ field, reason: 'already has value' });
        return;
      }
      // Check if it's a non-zero number
      if (typeof currentValue === 'number' && currentValue !== 0) {
        skippedFields.push({ field, reason: 'already has value' });
        return;
      }
      // Check if it's a boolean (any boolean value counts as having data)
      if (typeof currentValue === 'boolean') {
        skippedFields.push({ field, reason: 'already has value' });
        return;
      }
    }

    // Propose the change
    proposedChanges.push({
      field,
      oldValue: currentValue ?? null,
      newValue: transform ? transform(extracted.value) : extracted.value,
      confidence: extracted.confidence,
    });
  }

  // Content fields
  // Note: tagline column may not exist yet - still generate for display but skip DB update
  // The tagline will be shown in the output but marked as skipped if column doesn't exist
  checkField('tagline', extracted.content.tagline, resort.tagline);
  checkField('description', extracted.content.description, resort.description);

  // Stats fields
  checkField('stats.skiableAcres', extracted.stats.skiableAcres, resort.stats?.skiableAcres);
  checkField('stats.liftsCount', extracted.stats.liftsCount, resort.stats?.liftsCount);
  checkField('stats.runsCount', extracted.stats.runsCount, resort.stats?.runsCount);
  checkField('stats.verticalDrop', extracted.stats.verticalDrop, resort.stats?.verticalDrop);
  checkField('stats.baseElevation', extracted.stats.baseElevation, resort.stats?.baseElevation);
  checkField('stats.summitElevation', extracted.stats.summitElevation, resort.stats?.summitElevation);
  checkField('stats.avgAnnualSnowfall', extracted.stats.avgAnnualSnowfall, resort.stats?.avgAnnualSnowfall);

  // Terrain fields
  checkField('terrain.beginner', extracted.terrain.beginner, resort.terrain?.beginner);
  checkField('terrain.intermediate', extracted.terrain.intermediate, resort.terrain?.intermediate);
  checkField('terrain.advanced', extracted.terrain.advanced, resort.terrain?.advanced);
  checkField('terrain.expert', extracted.terrain.expert, resort.terrain?.expert);

  // Feature fields
  checkField('features.hasPark', extracted.features.hasPark, resort.features?.hasPark);
  checkField('features.hasHalfpipe', extracted.features.hasHalfpipe, resort.features?.hasHalfpipe);
  checkField('features.hasNightSkiing', extracted.features.hasNightSkiing, resort.features?.hasNightSkiing);
  checkField('features.hasBackcountryAccess', extracted.features.hasBackcountryAccess, resort.features?.hasBackcountryAccess);

  // General fields
  checkField('website_url', extracted.general.websiteUrl, resort.website_url);
  checkField('nearest_city', extracted.general.nearestCity, resort.nearest_city);

  return { proposedChanges, skippedFields };
}

/**
 * Convert proposed changes to Supabase update objects
 */
export function buildSupabaseUpdates(changes: ProposedChange[]): {
  directUpdates: Record<string, unknown>;
  statsUpdates: Record<string, unknown>;
  terrainUpdates: Record<string, unknown>;
  featuresUpdates: Record<string, unknown>;
} {
  const directUpdates: Record<string, unknown> = {};
  const statsUpdates: Record<string, unknown> = {};
  const terrainUpdates: Record<string, unknown> = {};
  const featuresUpdates: Record<string, unknown> = {};

  for (const change of changes) {
    if (change.field.startsWith('stats.')) {
      const key = change.field.replace('stats.', '');
      statsUpdates[key] = change.newValue;
    } else if (change.field.startsWith('terrain.')) {
      const key = change.field.replace('terrain.', '');
      terrainUpdates[key] = change.newValue;
    } else if (change.field.startsWith('features.')) {
      const key = change.field.replace('features.', '');
      featuresUpdates[key] = change.newValue;
    } else {
      directUpdates[change.field] = change.newValue;
    }
  }

  return { directUpdates, statsUpdates, terrainUpdates, featuresUpdates };
}
