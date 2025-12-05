import { config } from './config.js';
import type { ProcessingResult, CostReport, DataQuality } from './types.js';

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Log a plain message
 */
export function log(message: string): void {
  console.log(message);
}

/**
 * Log an info message with blue icon
 */
export function info(message: string): void {
  console.log(`${colors.blue}i${colors.reset} ${message}`);
}

/**
 * Log a success message with green checkmark
 */
export function success(message: string): void {
  console.log(`${colors.green}+${colors.reset} ${message}`);
}

/**
 * Log a warning message with yellow icon
 */
export function warn(message: string): void {
  console.log(`${colors.yellow}!${colors.reset} ${message}`);
}

/**
 * Log an error message with red X
 */
export function error(message: string): void {
  console.log(`${colors.red}x${colors.reset} ${message}`);
}

/**
 * Log a debug message (only in verbose mode)
 */
export function debug(message: string, verbose: boolean): void {
  if (verbose) {
    console.log(`${colors.gray}  ${message}${colors.reset}`);
  }
}

/**
 * Print a header section
 */
export function header(text: string): void {
  const line = '='.repeat(50);
  console.log(`\n${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.cyan}${text.padStart(25 + text.length / 2)}${colors.reset}`);
  console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

/**
 * Print a section header
 */
export function section(text: string): void {
  console.log(`\n${colors.bright}${text}${colors.reset}`);
  console.log(`${'-'.repeat(40)}`);
}

/**
 * Print dry-run banner
 */
export function dryRunBanner(): void {
  console.log(`${colors.yellow}${'-'.repeat(50)}${colors.reset}`);
  console.log(`${colors.yellow}  DRY RUN MODE - No changes will be written${colors.reset}`);
  console.log(`${colors.yellow}${'-'.repeat(50)}${colors.reset}\n`);
}

/**
 * Print a field update status
 */
export function field(
  name: string,
  value: string | number | null,
  confidence: number,
  applied: boolean
): void {
  const icon = applied ? `${colors.green}+${colors.reset}` : `${colors.dim}o${colors.reset}`;
  const confStr = `(${(confidence * 100).toFixed(0)}%)`;
  const confColor = confidence >= 0.9 ? colors.green :
                    confidence >= 0.7 ? colors.yellow : colors.red;

  const displayValue = value === null ? 'null' :
    typeof value === 'string' && value.length > 40 ? `"${value.substring(0, 40)}..."` :
    typeof value === 'string' ? `"${value}"` : value;

  console.log(`  ${icon} ${name}: ${displayValue} ${confColor}${confStr}${colors.reset}`);
}

/**
 * Print cost information
 */
export function cost(amount: number): void {
  console.log(`  ${colors.cyan}$ Cost: $${amount.toFixed(4)}${colors.reset}`);
}

/**
 * Print progress indicator
 */
export function progress(current: number, total: number, name: string): void {
  const pct = ((current / total) * 100).toFixed(0);
  console.log(`\n[${current}/${total}] ${pct}% - ${colors.bright}${name}${colors.reset}`);
}

/**
 * Print data quality summary
 */
export function dataQuality(quality: DataQuality): void {
  const sources = [];
  if (quality.hasWikipedia) sources.push('Wikipedia');
  if (quality.hasLiftie) sources.push('Liftie');
  if (quality.hasOnTheSnow) sources.push('OnTheSnow');
  if (quality.hasSkiResortInfo) sources.push('SRI');

  console.log(`  Data sources: ${sources.join(', ') || 'none'}`);
  console.log(`  Files found: ${quality.fileCount}`);
  console.log(`  Quality score: ${(quality.overallScore * 100).toFixed(0)}%`);
}

/**
 * Print summary statistics
 */
export function summary(stats: {
  processed: number;
  skipped: number;
  failed: number;
  totalCost: number;
}): void {
  header('SUMMARY');
  console.log(`  ${colors.green}Processed:${colors.reset} ${stats.processed}`);
  console.log(`  ${colors.yellow}Skipped:${colors.reset}   ${stats.skipped}`);
  console.log(`  ${colors.red}Failed:${colors.reset}    ${stats.failed}`);
  console.log(`  ${colors.cyan}Total cost:${colors.reset} $${stats.totalCost.toFixed(2)}`);
}

/**
 * Print cost report
 */
export function printCostReport(report: CostReport): void {
  header('COST REPORT');

  console.log(`Model: ${report.model}`);
  console.log(`Resorts processed: ${report.totals.resortCount}`);
  console.log('');

  console.log('Token Usage:');
  console.log(`  Input tokens:  ${report.totals.totalPromptTokens.toLocaleString()}`);
  console.log(`  Output tokens: ${report.totals.totalCompletionTokens.toLocaleString()}`);
  console.log(`  Total tokens:  ${(report.totals.totalPromptTokens + report.totals.totalCompletionTokens).toLocaleString()}`);
  console.log('');

  console.log('Cost Breakdown:');
  const inputCost = (report.totals.totalPromptTokens / 1000) * 0.0025;
  const outputCost = (report.totals.totalCompletionTokens / 1000) * 0.01;
  console.log(`  Input cost:    $${inputCost.toFixed(2)}`);
  console.log(`  Output cost:   $${outputCost.toFixed(2)}`);
  console.log(`  ${'-'.repeat(20)}`);
  console.log(`  Total cost:    $${report.totals.totalCost.toFixed(2)}`);
  console.log('');

  console.log(`Average per resort: $${report.totals.avgCostPerResort.toFixed(3)}`);
  console.log('');

  const totalSec = Math.floor(report.totals.totalProcessingTimeMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  console.log('Processing Time:');
  console.log(`  Total: ${min}m ${sec}s`);
  console.log(`  Average: ${(report.totals.totalProcessingTimeMs / report.totals.resortCount / 1000).toFixed(1)}s per resort`);
}

/**
 * Format a processing result for console output
 */
export function formatResult(result: ProcessingResult, verbose: boolean): string {
  const lines: string[] = [];

  if (result.skipped) {
    lines.push(`  ${colors.dim}Skipped: ${result.skipReason || 'already processed'}${colors.reset}`);
    return lines.join('\n');
  }

  if (!result.success) {
    lines.push(`  ${colors.red}ERROR: ${result.error}${colors.reset}`);
    return lines.join('\n');
  }

  if (result.cost !== undefined) {
    lines.push(`  Cost: $${result.cost.toFixed(4)}`);
  }

  if (result.fieldsUpdated && result.fieldsUpdated.length > 0) {
    lines.push(`  ${colors.green}Updated: ${result.fieldsUpdated.length} fields${colors.reset}`);
    if (verbose) {
      result.fieldsUpdated.forEach(f => lines.push(`    + ${f}`));
    }
  }

  if (result.fieldsSkipped && result.fieldsSkipped.length > 0) {
    lines.push(`  ${colors.yellow}Skipped: ${result.fieldsSkipped.length} fields${colors.reset}`);
    if (verbose) {
      result.fieldsSkipped.forEach(f => lines.push(`    o ${f}`));
    }
  }

  if (result.processingTimeMs) {
    lines.push(`  Time: ${(result.processingTimeMs / 1000).toFixed(1)}s`);
  }

  return lines.join('\n');
}

/**
 * Format a list of resorts
 */
export function formatResortList(assetPaths: string[], title: string): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(`${title}:`);
  lines.push('');
  assetPaths.forEach(p => lines.push(`  ${p}`));
  lines.push('');
  lines.push(`Total: ${assetPaths.length}`);
  return lines.join('\n');
}
