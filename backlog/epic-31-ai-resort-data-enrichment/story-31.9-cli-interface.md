# Story 31.9: Add CLI Interface with Filtering Options

## Description

Create a command-line interface with argument parsing for the AI enricher, following the patterns established by other updaters.

## Acceptance Criteria

- [ ] Supports all processing options via CLI flags
- [ ] Help text with all available options
- [ ] Filter by resort name, state, or country
- [ ] Limit number of resorts to process
- [ ] Skip N resorts for pagination

## Technical Details

### CLI Options

```
Usage: npm start -- [options]

Options:
  --filter, -f <pattern>     Filter resorts by name/slug/state
  --limit, -l <number>       Process only N resorts
  --skip, -s <number>        Skip first N resorts
  --skip-existing            Skip resorts that already have enrichment
  --overwrite                Overwrite existing enrichment files
  --resume                   Resume from last run
  --dry-run                  Preview changes without writing
  --min-confidence <number>  Minimum confidence threshold (default: 0.7)
  --list                     List resorts with GCS data (no processing)
  --list-enriched            List resorts with existing enrichment
  --verbose, -v              Verbose output
  --help, -h                 Show help
```

### Implementation (index.ts)

```typescript
import { processAllResorts } from './processor';
import { listResortsWithData, listEnrichedResorts } from './gcs';
import { config } from './config';

interface CliOptions {
  filter?: string;
  limit?: number;
  skip?: number;
  skipExisting?: boolean;
  overwrite?: boolean;
  resume?: boolean;
  dryRun?: boolean;
  minConfidence?: number;
  list?: boolean;
  listEnriched?: boolean;
  verbose?: boolean;
  help?: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--filter':
      case '-f':
        options.filter = args[++i];
        break;
      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--skip':
      case '-s':
        options.skip = parseInt(args[++i], 10);
        break;
      case '--skip-existing':
        options.skipExisting = true;
        break;
      case '--overwrite':
        options.overwrite = true;
        break;
      case '--resume':
        options.resume = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--min-confidence':
        options.minConfidence = parseFloat(args[++i]);
        break;
      case '--list':
        options.list = true;
        break;
      case '--list-enriched':
        options.listEnriched = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
AI Resort Data Enricher

Usage: npm start -- [options]

Processing Options:
  --filter, -f <pattern>     Filter resorts by name/slug/state
  --limit, -l <number>       Process only N resorts
  --skip, -s <number>        Skip first N resorts
  --skip-existing            Skip resorts with existing enrichment
  --overwrite                Overwrite existing enrichment files
  --resume                   Resume from last successful run
  --dry-run                  Preview without writing to GCS/Supabase

Quality Options:
  --min-confidence <number>  Minimum confidence threshold (default: 0.7)

Listing Options:
  --list                     List all resorts with GCS data
  --list-enriched            List resorts with existing enrichment

Other:
  --verbose, -v              Show detailed output
  --help, -h                 Show this help message

Examples:
  # Process all Colorado resorts
  npm start -- --filter colorado

  # Process 10 resorts with verbose output
  npm start -- --limit 10 --verbose

  # Dry run for testing
  npm start -- --filter vail --dry-run

  # Resume interrupted processing
  npm start -- --resume

  # Skip already enriched resorts
  npm start -- --skip-existing

Environment Variables:
  OPENAI_API_KEY             OpenAI API key (required)
  OPENAI_MODEL               Model to use (default: gpt-4o)
  SUPABASE_URL               Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY  Supabase service role key
  GCS_BUCKET_NAME            GCS bucket (default: sda-assets-prod)
  GCS_KEY_FILE               Path to GCS service account key
  MIN_CONFIDENCE             Default confidence threshold (0.0-1.0)
  DRY_RUN                    Default to dry-run mode (true/false)
`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  console.log('═══════════════════════════════════════════');
  console.log('     AI Resort Data Enricher v1.0.0        ');
  console.log('═══════════════════════════════════════════');
  console.log();

  // List mode
  if (options.list) {
    const resorts = await listResortsWithData();
    console.log(`Found ${resorts.length} resorts with GCS data:\n`);
    resorts.forEach((r) => console.log(`  - ${r}`));
    return;
  }

  if (options.listEnriched) {
    const resorts = await listEnrichedResorts();
    console.log(`Found ${resorts.length} resorts with existing enrichment:\n`);
    resorts.forEach((r) => console.log(`  - ${r}`));
    return;
  }

  // Processing mode
  console.log('Configuration:');
  console.log(`  Model: ${config.openai.model}`);
  console.log(`  Min confidence: ${options.minConfidence ?? config.minConfidence}`);
  console.log(`  Dry run: ${options.dryRun ?? config.dryRun}`);
  console.log();

  const results = await processAllResorts({
    filter: options.filter,
    limit: options.limit,
    skip: options.skip,
    skipExisting: options.skipExisting,
    overwrite: options.overwrite,
    resume: options.resume,
    dryRun: options.dryRun ?? config.dryRun,
  });

  // Summary
  console.log('\n═══════════════════════════════════════════');
  console.log('                 SUMMARY                    ');
  console.log('═══════════════════════════════════════════');

  const successful = results.filter((r) => r.success && !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  const failed = results.filter((r) => !r.success);
  const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0);

  console.log(`  Processed: ${successful.length}`);
  console.log(`  Skipped:   ${skipped.length}`);
  console.log(`  Failed:    ${failed.length}`);
  console.log(`  Total cost: $${totalCost.toFixed(2)}`);

  if (failed.length > 0) {
    console.log('\nFailed resorts:');
    failed.forEach((r) => console.log(`  - ${r.slug}: ${r.error}`));
  }
}

main().catch(console.error);
```

## Tasks

- [ ] Create `src/index.ts` with CLI parsing
- [ ] Implement `parseArgs()` function
- [ ] Implement `showHelp()` function
- [ ] Add environment variable documentation
- [ ] Test all CLI options
- [ ] Update package.json scripts

## Effort

**Size:** S (Small - 1-2 hours)

## Dependencies

- Story 31.8: Processor implementation

## References

- [Existing CLI implementations](../../apps/updaters/wikidata-enricher/src/index.ts)
