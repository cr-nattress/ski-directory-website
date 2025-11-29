#!/usr/bin/env node
/**
 * Migration CLI for uploading resort data to GCP Cloud Storage
 *
 * Usage:
 *   npx ts-node src/index.ts --state california --country us
 *   npx ts-node src/index.ts --all
 *   npx ts-node src/index.ts --state colorado --dry-run
 *   npx ts-node src/index.ts --generate-ts --state colorado --country us
 *   npx ts-node src/index.ts --generate-ts --all
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import {
  readRegionFile,
  listStates,
  listCountries,
  generateRegionMetadata,
  transformResortForExport,
} from './parser';
import {
  uploadResortJson,
  uploadResortTs,
  getPublicUrl,
} from './uploader';
import {
  generateForState,
  listStatesInGcs,
  listCountriesInGcs,
  StateGenerationResult,
} from './generator';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';
import { MigrationResult } from './types';

/**
 * Migrate a single state/province
 */
async function migrateState(
  country: string,
  state: string,
  dryRun: boolean,
  verbose: boolean
): Promise<MigrationResult> {
  const result: MigrationResult = {
    state,
    country,
    resortsProcessed: 0,
    filesUploaded: 0,
    errors: [],
    success: false,
  };

  console.log(chalk.blue(`\nMigrating ${config.stateNames[state] || state} (${country.toUpperCase()})...`));

  // Read region data
  const regionData = readRegionFile(country, state);
  if (!regionData || !regionData.resorts || regionData.resorts.length === 0) {
    console.log(chalk.yellow(`  No resort data found for ${state}`));
    result.errors.push('No resort data found');
    return result;
  }

  const resorts = regionData.resorts;
  console.log(chalk.gray(`  Found ${resorts.length} resorts`));

  // Get the state directory path for TS files
  const stateDir = path.join(config.regionsPath, country, state);

  // Upload JSON and TS files for each resort
  for (const resort of resorts) {
    const slug = resort.slug;

    // Transform and upload resort JSON
    const transformedResort = transformResortForExport(resort, country, state);
    const jsonUploaded = await uploadResortJson(country, state, slug, transformedResort, dryRun);
    if (jsonUploaded) {
      result.filesUploaded++;
    } else {
      result.errors.push(`Failed to upload JSON for ${slug}`);
    }

    // Check for and upload TS file if it exists
    const tsFilePath = path.join(stateDir, `${slug}.ts`);
    if (fs.existsSync(tsFilePath)) {
      const tsContent = fs.readFileSync(tsFilePath, 'utf-8');
      const tsUploaded = await uploadResortTs(country, state, slug, tsContent, dryRun);
      if (tsUploaded) {
        result.filesUploaded++;
      } else {
        result.errors.push(`Failed to upload TS for ${slug}`);
      }
    }

    result.resortsProcessed++;
  }

  result.success = result.errors.length === 0;

  console.log(chalk.green(`  Processed ${result.resortsProcessed} resorts, uploaded ${result.filesUploaded} files`));

  if (verbose && !dryRun && resorts.length > 0) {
    console.log(chalk.gray(`  Sample: ${getPublicUrl(`${country}/${state}/${resorts[0]?.slug}/resort.json`)}`));
  }

  return result;
}

/**
 * Migrate all states for a country
 */
async function migrateCountry(
  country: string,
  dryRun: boolean,
  verbose: boolean
): Promise<MigrationResult[]> {
  const states = listStates(country);
  console.log(chalk.blue(`\nProcessing ${config.countries[country]?.name || country} (${states.length} states)...`));

  const results: MigrationResult[] = [];
  const stateStats: Array<{ code: string; name: string; resortCount: number }> = [];

  for (const state of states) {
    const result = await migrateState(country, state, dryRun, verbose);
    results.push(result);
    if (result.resortsProcessed > 0) {
      stateStats.push({
        code: state,
        name: config.stateNames[state] || state,
        resortCount: result.resortsProcessed,
      });
    }
  }

  return results;
}

/**
 * Migrate all countries
 */
async function migrateAll(dryRun: boolean, verbose: boolean): Promise<void> {
  const countries = listCountries();
  console.log(chalk.blue(`\nMigrating all regions (${countries.length} countries)...`));

  const countryStats: Array<{ code: string; name: string; stateCount: number; resortCount: number }> = [];
  let totalResorts = 0;
  let totalFiles = 0;
  let totalErrors = 0;

  for (const country of countries) {
    const results = await migrateCountry(country, dryRun, verbose);
    const countryResorts = results.reduce((sum, r) => sum + r.resortsProcessed, 0);
    const countryFiles = results.reduce((sum, r) => sum + r.filesUploaded, 0);
    const countryErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    if (countryResorts > 0) {
      countryStats.push({
        code: country,
        name: config.countries[country]?.name || country.toUpperCase(),
        stateCount: results.filter(r => r.resortsProcessed > 0).length,
        resortCount: countryResorts,
      });
    }

    totalResorts += countryResorts;
    totalFiles += countryFiles;
    totalErrors += countryErrors;
  }

  // Summary
  console.log(chalk.blue('\n========================================'));
  console.log(chalk.blue('Migration Summary'));
  console.log(chalk.blue('========================================'));
  console.log(`Total resorts processed: ${chalk.green(totalResorts)}`);
  console.log(`Total files uploaded: ${chalk.green(totalFiles)}`);
  if (totalErrors > 0) {
    console.log(`Total errors: ${chalk.red(totalErrors)}`);
  }
  if (dryRun) {
    console.log(chalk.yellow('\nThis was a DRY RUN - no files were actually uploaded'));
  }
}

/**
 * Generate TypeScript files for a single state
 */
async function generateTsForState(
  country: string,
  state: string,
  dryRun: boolean,
  verbose: boolean,
  force: boolean
): Promise<StateGenerationResult> {
  console.log(chalk.blue(`\nGenerating TypeScript for ${config.stateNames[state] || state} (${country.toUpperCase()})...`));

  const result = await generateForState(country, state, dryRun, verbose, force);

  console.log(chalk.green(`  Total: ${result.totalResorts} resorts`));
  console.log(chalk.green(`  Generated: ${result.generated} files`));
  console.log(chalk.gray(`  Skipped: ${result.skipped} (already exist)`));

  if (result.errors.length > 0) {
    console.log(chalk.red(`  Errors: ${result.errors.length}`));
    for (const error of result.errors) {
      console.log(chalk.red(`    - ${error}`));
    }
  }

  return result;
}

/**
 * Generate TypeScript files for a country
 */
async function generateTsForCountry(
  country: string,
  dryRun: boolean,
  verbose: boolean,
  force: boolean
): Promise<StateGenerationResult[]> {
  const states = await listStatesInGcs(country);
  console.log(chalk.blue(`\nProcessing ${config.countries[country]?.name || country} (${states.length} states)...`));

  const results: StateGenerationResult[] = [];

  for (const state of states) {
    const result = await generateTsForState(country, state, dryRun, verbose, force);
    results.push(result);
  }

  return results;
}

/**
 * Generate TypeScript files for all resorts
 */
async function generateTsForAll(
  dryRun: boolean,
  verbose: boolean,
  force: boolean
): Promise<void> {
  const countries = await listCountriesInGcs();
  console.log(chalk.blue(`\nGenerating TypeScript for all regions (${countries.length} countries)...`));

  let totalResorts = 0;
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const country of countries) {
    const results = await generateTsForCountry(country, dryRun, verbose, force);

    for (const result of results) {
      totalResorts += result.totalResorts;
      totalGenerated += result.generated;
      totalSkipped += result.skipped;
      totalErrors += result.errors.length;
    }
  }

  // Summary
  console.log(chalk.blue('\n========================================'));
  console.log(chalk.blue('TypeScript Generation Summary'));
  console.log(chalk.blue('========================================'));
  console.log(`Total resorts: ${chalk.green(totalResorts)}`);
  console.log(`Generated: ${chalk.green(totalGenerated)}`);
  console.log(`Skipped: ${chalk.gray(totalSkipped)}`);
  if (totalErrors > 0) {
    console.log(`Errors: ${chalk.red(totalErrors)}`);
  }
  if (dryRun) {
    console.log(chalk.yellow('\nThis was a DRY RUN - no files were actually uploaded'));
  }
}

// CLI setup
program
  .name('migrate-regions')
  .description('Migrate ski resort data to GCP Cloud Storage')
  .version('1.0.0')
  .option('-s, --state <state>', 'Migrate a specific state/province (e.g., colorado, british-columbia)')
  .option('-c, --country <country>', 'Country code (us or ca)', 'us')
  .option('-a, --all', 'Process all regions')
  .option('-d, --dry-run', 'Dry run (no actual uploads)')
  .option('-v, --verbose', 'Verbose output')
  .option('-g, --generate-ts', 'Generate resort.ts files from resort.json data in GCS')
  .option('-f, --force', 'Force regeneration even if resort.ts exists')
  .action(async (options) => {
    const spinner = ora('Starting...').start();

    try {
      // Generate TypeScript mode
      if (options.generateTs) {
        spinner.text = 'Generating TypeScript files...';
        spinner.stop();

        if (options.all) {
          await generateTsForAll(options.dryRun, options.verbose, options.force);
        } else if (options.state) {
          await generateTsForState(
            options.country,
            options.state,
            options.dryRun,
            options.verbose,
            options.force
          );
        } else {
          spinner.fail('Please specify --state <state> or --all with --generate-ts');
          process.exit(1);
        }

        spinner.succeed('TypeScript generation complete!');
        return;
      }

      // Migration mode (default)
      spinner.text = 'Starting migration...';

      if (options.all) {
        spinner.stop();
        await migrateAll(options.dryRun, options.verbose);
      } else if (options.state) {
        spinner.stop();
        await migrateState(options.country, options.state, options.dryRun, options.verbose);
      } else {
        spinner.fail('Please specify --state <state> or --all');
        process.exit(1);
      }

      spinner.succeed('Migration complete!');
    } catch (error) {
      spinner.fail('Operation failed');
      console.error(chalk.red(error));
      process.exit(1);
    }
  });

program.parse();
