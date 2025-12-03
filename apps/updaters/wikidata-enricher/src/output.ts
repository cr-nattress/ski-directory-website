import type { ProcessingResult, ProcessingStats, ProposedChange } from './types.js';
import { config } from './config.js';

/**
 * Format a single processing result for console output
 */
export function formatResult(result: ProcessingResult, verbose: boolean): string {
  const lines: string[] = [];

  lines.push(`\nProcessing: ${result.resortName}`);

  if (!result.hasWikiData) {
    lines.push('  No wiki-data.json found, skipping');
    return lines.join('\n');
  }

  if (!result.success) {
    lines.push(`  ERROR: ${result.error}`);
    return lines.join('\n');
  }

  if (!result.extractedData) {
    lines.push('  No data extracted');
    return lines.join('\n');
  }

  // Token usage
  if (result.tokenUsage) {
    lines.push(`  Tokens: ${result.tokenUsage.totalTokens} (prompt: ${result.tokenUsage.promptTokens}, completion: ${result.tokenUsage.completionTokens})`);
  }

  // Show generated content
  const tagline = result.extractedData.content.tagline;
  const description = result.extractedData.content.description;

  lines.push('');
  lines.push('  === GENERATED CONTENT ===');
  lines.push('');

  if (tagline.value) {
    lines.push(`  Tagline (confidence: ${(tagline.confidence * 100).toFixed(0)}%):`);
    lines.push(`    "${tagline.value}"`);
  }

  if (description.value) {
    lines.push('');
    lines.push(`  Description (confidence: ${(description.confidence * 100).toFixed(0)}%):`);
    // Show truncated description
    const truncated = description.value.length > 500
      ? description.value.substring(0, 500) + '...'
      : description.value;
    // Indent each line of the description
    const descLines = truncated.split('\n').map(l => `    ${l}`);
    lines.push(...descLines);
  }

  // Show proposed changes
  if (result.proposedChanges.length > 0) {
    lines.push('');
    lines.push('  === PROPOSED CHANGES ===');
    lines.push('');

    for (const change of result.proposedChanges) {
      const oldVal = formatValue(change.oldValue);
      const newVal = formatValue(change.newValue);
      lines.push(`    ${change.field}: ${oldVal} → ${newVal} (${(change.confidence * 100).toFixed(0)}%)`);
    }
  }

  // Show skipped fields in verbose mode
  if (verbose && result.skippedFields.length > 0) {
    lines.push('');
    lines.push('  === SKIPPED FIELDS ===');
    lines.push('');

    for (const skipped of result.skippedFields) {
      const confStr = skipped.confidence !== undefined
        ? ` (${(skipped.confidence * 100).toFixed(0)}%)`
        : '';
      lines.push(`    ${skipped.field}: ${skipped.reason}${confStr}`);
    }
  }

  // Show apply status
  if (!config.processing.dryRun && result.proposedChanges.length > 0) {
    lines.push('');
    lines.push(`  ✓ Applied ${result.proposedChanges.length} changes to Supabase`);
  }

  return lines.join('\n');
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    if (value.length > 50) {
      return `"${value.substring(0, 50)}..." (${value.length} chars)`;
    }
    return `"${value}"`;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}

/**
 * Format the final summary report
 */
export function formatSummaryReport(
  stats: ProcessingStats,
  results: ProcessingResult[]
): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('='.repeat(50));
  lines.push('  WIKIDATA ENRICHER REPORT');
  lines.push('='.repeat(50));
  lines.push('');

  // Processing stats
  lines.push('PROCESSING SUMMARY');
  lines.push('-'.repeat(30));
  lines.push(`  Total resorts:        ${stats.total}`);
  lines.push(`  Processed:            ${stats.processed}`);
  lines.push(`  With wiki data:       ${stats.withWikiData} (${pct(stats.withWikiData, stats.total)})`);
  lines.push(`  Extracted:            ${stats.extractedSuccessfully} (${pct(stats.extractedSuccessfully, stats.withWikiData)})`);
  lines.push(`  Failed:               ${stats.failed}`);
  lines.push(`  Skipped:              ${stats.skipped}`);
  lines.push('');

  // Content generation stats
  const contentResults = results.filter(r => r.extractedData);
  const taglinesGenerated = contentResults.filter(r =>
    r.extractedData?.content.tagline.value &&
    r.extractedData.content.tagline.confidence >= config.processing.minConfidence
  ).length;
  const descriptionsGenerated = contentResults.filter(r =>
    r.extractedData?.content.description.value &&
    r.extractedData.content.description.confidence >= config.processing.minConfidence
  ).length;

  lines.push('CONTENT GENERATION');
  lines.push('-'.repeat(30));
  lines.push(`  Taglines generated:   ${taglinesGenerated}/${stats.extractedSuccessfully} (${pct(taglinesGenerated, stats.extractedSuccessfully)})`);
  lines.push(`  Descriptions:         ${descriptionsGenerated}/${stats.extractedSuccessfully} (${pct(descriptionsGenerated, stats.extractedSuccessfully)})`);
  lines.push('');

  // Field coverage
  const fieldCoverage = calculateFieldCoverage(results);
  lines.push('FIELD COVERAGE (above confidence threshold)');
  lines.push('-'.repeat(30));
  for (const [field, count] of Object.entries(fieldCoverage)) {
    lines.push(`  ${field.padEnd(22)} ${count}/${stats.extractedSuccessfully} (${pct(count, stats.extractedSuccessfully)})`);
  }
  lines.push('');

  // Cost
  lines.push('COST');
  lines.push('-'.repeat(30));
  lines.push(`  Total tokens:         ${stats.totalTokens.toLocaleString()}`);
  lines.push(`  Estimated cost:       $${stats.estimatedCost.toFixed(2)}`);
  lines.push('');

  // Mode indicator
  if (config.processing.dryRun) {
    lines.push('MODE: DRY RUN (no changes applied)');
    lines.push('Run with --apply to apply changes to Supabase');
  } else {
    lines.push(`MODE: APPLY (${stats.applied} changes applied)`);
  }

  lines.push('');
  lines.push('='.repeat(50));

  return lines.join('\n');
}

/**
 * Calculate field coverage from results
 */
function calculateFieldCoverage(results: ProcessingResult[]): Record<string, number> {
  const coverage: Record<string, number> = {
    tagline: 0,
    description: 0,
    skiableAcres: 0,
    liftsCount: 0,
    runsCount: 0,
    verticalDrop: 0,
    baseElevation: 0,
    summitElevation: 0,
    avgAnnualSnowfall: 0,
  };

  for (const result of results) {
    if (!result.extractedData) continue;

    const e = result.extractedData;
    const minConf = config.processing.minConfidence;

    if (e.content.tagline.value && e.content.tagline.confidence >= minConf) coverage.tagline++;
    if (e.content.description.value && e.content.description.confidence >= minConf) coverage.description++;
    if (e.stats.skiableAcres.value && e.stats.skiableAcres.confidence >= minConf) coverage.skiableAcres++;
    if (e.stats.liftsCount.value && e.stats.liftsCount.confidence >= minConf) coverage.liftsCount++;
    if (e.stats.runsCount.value && e.stats.runsCount.confidence >= minConf) coverage.runsCount++;
    if (e.stats.verticalDrop.value && e.stats.verticalDrop.confidence >= minConf) coverage.verticalDrop++;
    if (e.stats.baseElevation.value && e.stats.baseElevation.confidence >= minConf) coverage.baseElevation++;
    if (e.stats.summitElevation.value && e.stats.summitElevation.confidence >= minConf) coverage.summitElevation++;
    if (e.stats.avgAnnualSnowfall.value && e.stats.avgAnnualSnowfall.confidence >= minConf) coverage.avgAnnualSnowfall++;
  }

  return coverage;
}

/**
 * Format percentage
 */
function pct(num: number, total: number): string {
  if (total === 0) return '0%';
  return `${((num / total) * 100).toFixed(0)}%`;
}

/**
 * List resorts with wiki data
 */
export function formatResortList(assetPaths: string[]): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(`Found ${assetPaths.length} resorts with wiki-data.json:`);
  lines.push('');

  for (const path of assetPaths) {
    lines.push(`  ${path}`);
  }

  lines.push('');

  return lines.join('\n');
}
