# Story 31.10: Add Dry-Run Mode and Logging

## Description

Implement comprehensive dry-run mode that previews all changes without writing, and add structured logging throughout the application.

## Acceptance Criteria

- [ ] Dry-run mode shows exactly what would be written
- [ ] No writes to GCS or Supabase in dry-run mode
- [ ] Colored console output for readability
- [ ] Structured logging with timestamps
- [ ] Log levels (info, warn, error, debug)
- [ ] Optional verbose mode for debugging

## Technical Details

### Console Output Formatting (output.ts)

```typescript
// ANSI color codes
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

export function log(message: string): void {
  console.log(message);
}

export function info(message: string): void {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

export function success(message: string): void {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

export function warn(message: string): void {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

export function error(message: string): void {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

export function debug(message: string, verbose: boolean): void {
  if (verbose) {
    console.log(`${colors.gray}  ${message}${colors.reset}`);
  }
}

export function header(text: string): void {
  const line = '═'.repeat(50);
  console.log(`\n${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.cyan}${text.padStart(25 + text.length / 2)}${colors.reset}`);
  console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

export function section(text: string): void {
  console.log(`\n${colors.bright}${text}${colors.reset}`);
  console.log(`${'─'.repeat(40)}`);
}

export function dryRunBanner(): void {
  console.log(`${colors.yellow}${'─'.repeat(50)}${colors.reset}`);
  console.log(`${colors.yellow}  DRY RUN MODE - No changes will be written${colors.reset}`);
  console.log(`${colors.yellow}${'─'.repeat(50)}${colors.reset}\n`);
}

export function field(
  name: string,
  value: string | number,
  confidence: number,
  applied: boolean
): void {
  const icon = applied ? `${colors.green}✓${colors.reset}` : `${colors.dim}○${colors.reset}`;
  const confStr = `(${(confidence * 100).toFixed(0)}%)`;
  const confColor = confidence >= 0.9 ? colors.green :
                    confidence >= 0.7 ? colors.yellow : colors.red;

  console.log(`  ${icon} ${name}: ${value} ${confColor}${confStr}${colors.reset}`);
}

export function cost(amount: number): void {
  console.log(`  ${colors.cyan}💰 Cost: $${amount.toFixed(4)}${colors.reset}`);
}

export function progress(current: number, total: number, name: string): void {
  const pct = ((current / total) * 100).toFixed(0);
  console.log(`\n[${current}/${total}] ${pct}% - ${colors.bright}${name}${colors.reset}`);
}

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
```

### Dry-Run Output Example

```
──────────────────────────────────────────────────
  DRY RUN MODE - No changes will be written
──────────────────────────────────────────────────

[1/10] 10% - vail
  1. Aggregating GCS data...
     ✓ Wikipedia data found
     ✓ Liftie data found
     5 files total

  2. Calling OpenAI for enrichment...
     💰 Cost: $0.0275

  3. Would save to GCS:
     → resorts/us/colorado/vail/ai-enrichment.json

  4. Would update Supabase:
     ✓ tagline: "Colorado's premier powder destination..." (95%)
     ✓ description: "Vail Mountain stands as one of..." (92%)
     ✓ stats.liftsCount: 31 (95%)
     ✓ stats.verticalDrop: 3450 (95%)
     ✓ stats.summitElevation: 11570 (95%)
     ✓ stats.baseElevation: 8120 (95%)
     ✓ stats.skiableAcres: 5317 (95%)
     ○ stats.avgAnnualSnowfall: 354 (skipped - existing value)
     ✓ terrain.beginner: 18 (90%)
     ✓ terrain.intermediate: 29 (90%)
     ✓ terrain.advanced: 53 (90%)
     ○ terrain.expert: 0 (65% - below threshold)

  Updated: 10 fields | Skipped: 2 fields

═══════════════════════════════════════════════════
                    SUMMARY
═══════════════════════════════════════════════════
  Processed: 10
  Skipped:   0
  Failed:    0
  Total cost: $0.28

  ⚠ DRY RUN - No changes were written
```

## Tasks

- [ ] Create `src/output.ts` with formatting functions
- [ ] Add color-coded output
- [ ] Implement dry-run banner
- [ ] Add field status display
- [ ] Add progress indicators
- [ ] Add summary display
- [ ] Integrate throughout processor

## Effort

**Size:** S (Small - 1-2 hours)

## Dependencies

- Story 31.8: Processor (to integrate logging)

## References

- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)
