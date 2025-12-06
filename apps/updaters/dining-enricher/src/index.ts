import { config, validateConfig } from './config';
import { DiningEnricher } from './enricher/dining-enricher';
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
Dining Enricher CLI
===================

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
  MAX_VENUES_PER_RESORT         Max venues to fetch per resort (default: 15)
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
    logger.error('Configuration error', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }

  // Override config with CLI options
  const enrichmentConfig = {
    ...config.enrichment,
    ...(options.radius && { searchRadiusMiles: options.radius }),
    dryRun: options.dryRun,
  };

  const enricher = new DiningEnricher(enrichmentConfig);

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
    logger.error('Enrichment failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Fatal error', { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
