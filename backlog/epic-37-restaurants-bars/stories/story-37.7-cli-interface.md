# Story 37.7: Dining Enricher - CLI Interface

## Description

Create a CLI interface using Commander.js for running the dining enricher with various options and modes.

## Acceptance Criteria

- [ ] `enrich-all` command for all resorts
- [ ] `enrich-state <state>` command for resorts in a state
- [ ] `enrich-resort <slug>` command for a single resort
- [ ] `--dry-run` flag to preview without saving
- [ ] `--limit` flag to cap number of resorts
- [ ] `--radius` flag to override search radius
- [ ] `--max-venues` flag to limit venues per resort
- [ ] `--force` flag to re-enrich already processed resorts
- [ ] Progress output with stats
- [ ] Summary report on completion

## CLI Commands

```bash
# Enrich all resorts
npm run enrich-all
npm run enrich-all -- --dry-run
npm run enrich-all -- --limit 10

# Enrich by state
npm run enrich-state colorado
npm run enrich-state utah -- --radius 10

# Enrich single resort
npm run enrich-resort vail
npm run enrich-resort vail -- --force --max-venues 50
```

## Implementation

```typescript
// index.ts
import { Command } from 'commander';
import { DiningEnricher } from './enricher/dining-enricher';
import { config } from './config';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('dining-enricher')
  .description('Enrich ski resorts with dining venue data using OpenAI')
  .version('1.0.0');

// Common options
const addCommonOptions = (cmd: Command) => {
  return cmd
    .option('--dry-run', 'Preview changes without saving to database')
    .option('--radius <miles>', 'Search radius in miles', parseFloat, config.defaultSearchRadius)
    .option('--max-venues <count>', 'Maximum venues per resort', parseInt, config.maxVenuesPerResort)
    .option('--force', 'Re-enrich resorts that were already processed');
};

// enrich-all command
addCommonOptions(
  program
    .command('enrich-all')
    .description('Enrich all active resorts')
    .option('--limit <count>', 'Limit number of resorts to process', parseInt)
)
  .action(async (options) => {
    const enricher = new DiningEnricher(options);
    const result = await enricher.enrichAll({
      limit: options.limit,
      force: options.force,
    });
    printSummary(result);
  });

// enrich-state command
addCommonOptions(
  program
    .command('enrich-state <state>')
    .description('Enrich all resorts in a state (e.g., colorado, utah)')
    .option('--limit <count>', 'Limit number of resorts to process', parseInt)
)
  .action(async (state, options) => {
    const enricher = new DiningEnricher(options);
    const result = await enricher.enrichByState(state, {
      limit: options.limit,
      force: options.force,
    });
    printSummary(result);
  });

// enrich-resort command
addCommonOptions(
  program
    .command('enrich-resort <slug>')
    .description('Enrich a single resort by slug')
)
  .action(async (slug, options) => {
    const enricher = new DiningEnricher(options);
    const result = await enricher.enrichResort(slug);
    printSummary({ resorts: [result] });
  });

// list-pending command
program
  .command('list-pending')
  .description('List resorts that need enrichment')
  .option('--state <state>', 'Filter by state')
  .action(async (options) => {
    const enricher = new DiningEnricher({});
    const pending = await enricher.listPending(options.state);
    console.log(`\nPending resorts: ${pending.length}`);
    pending.forEach(r => console.log(`  - ${r.name} (${r.state})`));
  });

// stats command
program
  .command('stats')
  .description('Show enrichment statistics')
  .action(async () => {
    const enricher = new DiningEnricher({});
    const stats = await enricher.getStats();
    console.log('\n=== Dining Enrichment Stats ===');
    console.log(`Resorts processed: ${stats.resortsProcessed}/${stats.totalResorts}`);
    console.log(`Total venues: ${stats.totalVenues}`);
    console.log(`Venues per resort (avg): ${stats.avgVenuesPerResort.toFixed(1)}`);
    console.log(`Total cost: $${stats.totalCost.toFixed(2)}`);
  });

function printSummary(result: EnrichmentSummary) {
  console.log('\n=== Enrichment Complete ===');
  console.log(`Resorts processed: ${result.resorts.length}`);
  console.log(`Venues created: ${result.totalCreated}`);
  console.log(`Venues updated: ${result.totalUpdated}`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Total cost: $${result.totalCost.toFixed(4)}`);
  console.log(`Duration: ${(result.durationMs / 1000).toFixed(1)}s`);
}

program.parse();
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "enrich-all": "tsx src/index.ts enrich-all",
    "enrich-state": "tsx src/index.ts enrich-state",
    "enrich-resort": "tsx src/index.ts enrich-resort",
    "stats": "tsx src/index.ts stats",
    "list-pending": "tsx src/index.ts list-pending"
  }
}
```

## Progress Output

```
[1/50] Enriching: Vail (Colorado)
  ✓ Found 23 venues
  ✓ Created: 18, Updated: 5, Skipped: 0
  ✓ Cost: $0.0234 (1,245 tokens)

[2/50] Enriching: Aspen Mountain (Colorado)
  ✓ Found 31 venues
  ✓ Created: 28, Updated: 3, Skipped: 0
  ✓ Cost: $0.0312 (1,567 tokens)
...
```

## Effort

Medium (2-3 hours)
