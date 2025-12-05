# Story 34.8: Build CLI Interface

## Priority: Medium

## Phase: CLI

## Context

Create a command-line interface for running enrichment operations with various options for targeting specific resorts, states, or full runs.

## Requirements

1. Parse command-line arguments
2. Support multiple commands (enrich-all, enrich-resort, enrich-state)
3. Support configuration flags (--radius, --dry-run)
4. Display help text
5. Handle graceful shutdown

## Implementation

### src/index.ts

```typescript
import { config, validateConfig } from './config';
import { SkiShopEnricher } from './enricher/ski-shop-enricher';
import { logger } from './utils/logger';

interface CLIOptions {
  command: string;
  target?: string;
  radius?: number;
  dryRun: boolean;
  limit?: number;
  verbose: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    command: args[0] || 'help',
    dryRun: false,
    verbose: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--radius':
      case '-r':
        options.radius = parseInt(nextArg);
        i++;
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--limit':
      case '-l':
        options.limit = parseInt(nextArg);
        i++;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      default:
        if (!arg.startsWith('-') && !options.target) {
          options.target = arg;
        }
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Ski Shop Enricher CLI
=====================

Usage: npm run dev -- <command> [target] [options]

Commands:
  enrich-all                    Enrich all active resorts
  enrich-resort <slug>          Enrich a single resort by slug
  enrich-state <state-code>     Enrich all resorts in a state (e.g., CO, UT)
  status                        Show enrichment status summary
  help                          Show this help message

Options:
  --radius, -r <miles>          Search radius in miles (default: 20)
  --dry-run, -d                 Show what would be done without making changes
  --limit, -l <number>          Limit number of resorts to process
  --verbose, -v                 Enable verbose logging

Examples:
  npm run dev -- enrich-all --radius 15
  npm run dev -- enrich-resort vail
  npm run dev -- enrich-state CO --limit 5
  npm run dev -- enrich-all --dry-run

Environment Variables:
  SUPABASE_URL                  Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Supabase service role key
  OPENAI_API_KEY                OpenAI API key
  SEARCH_RADIUS_MILES           Default search radius (default: 20)
  OPENAI_MODEL                  OpenAI model (default: gpt-4-turbo-preview)
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.verbose) {
    logger.setLevel('debug');
  }

  if (options.command === 'help') {
    printHelp();
    return;
  }

  // Validate configuration
  try {
    validateConfig();
  } catch (error) {
    logger.error('Configuration error', { error });
    process.exit(1);
  }

  // Override config with CLI options
  if (options.radius) {
    config.enrichment.searchRadiusMiles = options.radius;
  }

  const enricher = new SkiShopEnricher({
    ...config.enrichment,
    dryRun: options.dryRun,
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('\nReceived SIGINT. Gracefully shutting down...');
    process.exit(0);
  });

  try {
    switch (options.command) {
      case 'enrich-all':
        await enricher.enrichAll({ limit: options.limit });
        break;

      case 'enrich-resort':
        if (!options.target) {
          logger.error('Missing resort slug. Usage: enrich-resort <slug>');
          process.exit(1);
        }
        await enricher.enrichResortBySlug(options.target);
        break;

      case 'enrich-state':
        if (!options.target) {
          logger.error('Missing state code. Usage: enrich-state <state-code>');
          process.exit(1);
        }
        await enricher.enrichState(options.target.toLowerCase(), { limit: options.limit });
        break;

      case 'status':
        await enricher.showStatus();
        break;

      default:
        logger.error(`Unknown command: ${options.command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    logger.error('Enrichment failed', { error });
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Fatal error', { error });
  process.exit(1);
});
```

### Extended Enricher Methods

```typescript
// In ski-shop-enricher.ts

async enrichAll(options?: { limit?: number }): Promise<void> {
  const resorts = await this.supabase.getResortsToEnrich({
    limit: options?.limit,
  });

  this.enrichmentLogger.start();
  logger.info(`Starting enrichment for ${resorts.length} resorts`);

  for (let i = 0; i < resorts.length; i++) {
    const resort = resorts[i];
    logger.progress(i + 1, resorts.length, resort.name);

    await this.enrichResort(resort);
    await this.delay(this.config.delayBetweenRequests);
  }

  this.enrichmentLogger.printSummary();
}

async enrichResortBySlug(slug: string): Promise<void> {
  const resorts = await this.supabase.getResortsToEnrich({ slug });

  if (resorts.length === 0) {
    logger.error(`Resort not found: ${slug}`);
    return;
  }

  this.enrichmentLogger.start();
  await this.enrichResort(resorts[0]);
  this.enrichmentLogger.printSummary();
}

async enrichState(state: string, options?: { limit?: number }): Promise<void> {
  const resorts = await this.supabase.getResortsToEnrich({
    state,
    limit: options?.limit,
  });

  if (resorts.length === 0) {
    logger.error(`No resorts found in state: ${state.toUpperCase()}`);
    return;
  }

  this.enrichmentLogger.start();
  logger.info(`Starting enrichment for ${resorts.length} resorts in ${state.toUpperCase()}`);

  for (let i = 0; i < resorts.length; i++) {
    const resort = resorts[i];
    logger.progress(i + 1, resorts.length, resort.name);

    await this.enrichResort(resort);
    await this.delay(this.config.delayBetweenRequests);
  }

  this.enrichmentLogger.printSummary();
}

async showStatus(): Promise<void> {
  const { data: logs } = await this.supabase.client
    .from('ski_shop_enrichment_logs')
    .select('status, count(*)')
    .group('status');

  const { count: totalShops } = await this.supabase.client
    .from('ski_shops')
    .select('*', { count: 'exact', head: true });

  const { count: linkedShops } = await this.supabase.client
    .from('resort_ski_shops')
    .select('*', { count: 'exact', head: true });

  console.log('\n' + '='.repeat(50));
  console.log('ENRICHMENT STATUS');
  console.log('='.repeat(50));
  console.log(`Total Ski Shops:    ${totalShops}`);
  console.log(`Resort-Shop Links:  ${linkedShops}`);
  console.log('-'.repeat(50));
  console.log('Enrichment Runs by Status:');
  logs?.forEach((log: any) => {
    console.log(`  ${log.status}: ${log.count}`);
  });
  console.log('='.repeat(50));
}
```

## Acceptance Criteria

- [ ] `enrich-all` processes all resorts
- [ ] `enrich-resort <slug>` processes single resort
- [ ] `enrich-state <code>` processes state resorts
- [ ] `--radius` flag overrides default
- [ ] `--dry-run` shows actions without executing
- [ ] `--limit` restricts number of resorts
- [ ] `--verbose` enables debug logging
- [ ] `help` shows usage information
- [ ] Ctrl+C gracefully shuts down

## Testing

1. Run `npm run dev -- help`
2. Run `npm run dev -- enrich-resort vail --dry-run`
3. Run `npm run dev -- enrich-state CO --limit 2`
4. Test Ctrl+C during run
5. Test with missing arguments

## Effort: Small (1-2 hours)
