# Story 34.7: Add Enrichment Logging and Monitoring

## Priority: Medium

## Phase: Core

## Context

Implement comprehensive logging for enrichment runs to track progress, debug issues, and monitor costs.

## Requirements

1. Create logger utility with levels
2. Log enrichment progress to console
3. Store enrichment results in database
4. Track OpenAI token usage and costs
5. Generate summary reports

## Implementation

### src/utils/logger.ts

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${levelStr} ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
    }
  }

  // Progress logging for batch operations
  progress(current: number, total: number, message: string): void {
    const percent = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
    process.stdout.write(`\r[${bar}] ${percent}% - ${message}`);
    if (current === total) {
      console.log(); // New line at end
    }
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || 'info'
);
```

### src/enricher/enrichment-logger.ts

```typescript
import { SupabaseService } from '../services/supabase';
import { EnrichmentResult } from '../types';
import { logger } from '../utils/logger';

export interface EnrichmentLogEntry {
  resort_id: string;
  resort_name: string;
  search_radius_miles: number;
  search_lat: number;
  search_lng: number;
  status: string;
  shops_found: number;
  shops_created: number;
  shops_updated: number;
  shops_linked: number;
  error_message?: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost: number;
  raw_response: unknown;
  duration_ms: number;
}

export interface EnrichmentSummary {
  total_resorts: number;
  successful: number;
  failed: number;
  no_results: number;
  total_shops_found: number;
  total_shops_created: number;
  total_shops_updated: number;
  total_shops_linked: number;
  total_tokens: number;
  total_cost: number;
  total_duration_ms: number;
  errors: Array<{ resort: string; error: string }>;
}

export class EnrichmentLogger {
  private supabase: SupabaseService;
  private results: EnrichmentResult[] = [];
  private startTime: number = 0;

  constructor(supabase: SupabaseService) {
    this.supabase = supabase;
  }

  start(): void {
    this.startTime = Date.now();
    this.results = [];
    logger.info('Starting enrichment run');
  }

  async logResult(entry: EnrichmentLogEntry): Promise<void> {
    // Store in database
    await this.supabase.logEnrichment(entry);

    // Track for summary
    this.results.push({
      resort_id: entry.resort_id,
      resort_name: entry.resort_name,
      status: entry.status as EnrichmentResult['status'],
      shops_found: entry.shops_found,
      shops_created: entry.shops_created,
      shops_updated: entry.shops_updated,
      shops_linked: entry.shops_linked,
      error: entry.error_message,
      duration_ms: entry.duration_ms,
    });

    // Console log
    const statusIcon = entry.status === 'success' ? '✓' : entry.status === 'failed' ? '✗' : '○';
    logger.info(
      `${statusIcon} ${entry.resort_name}: ${entry.shops_found} shops found, ${entry.shops_created} created`,
      { duration_ms: entry.duration_ms, cost: `$${entry.total_cost.toFixed(4)}` }
    );
  }

  getSummary(): EnrichmentSummary {
    const totalDuration = Date.now() - this.startTime;

    const summary: EnrichmentSummary = {
      total_resorts: this.results.length,
      successful: this.results.filter((r) => r.status === 'success').length,
      failed: this.results.filter((r) => r.status === 'failed').length,
      no_results: this.results.filter((r) => r.status === 'no_results').length,
      total_shops_found: this.results.reduce((sum, r) => sum + r.shops_found, 0),
      total_shops_created: this.results.reduce((sum, r) => sum + r.shops_created, 0),
      total_shops_updated: this.results.reduce((sum, r) => sum + r.shops_updated, 0),
      total_shops_linked: this.results.reduce((sum, r) => sum + r.shops_linked, 0),
      total_tokens: 0, // Would need to track separately
      total_cost: 0, // Would need to track separately
      total_duration_ms: totalDuration,
      errors: this.results
        .filter((r) => r.error)
        .map((r) => ({ resort: r.resort_name, error: r.error! })),
    };

    return summary;
  }

  printSummary(): void {
    const summary = this.getSummary();

    console.log('\n' + '='.repeat(60));
    console.log('ENRICHMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Resorts:     ${summary.total_resorts}`);
    console.log(`  Successful:      ${summary.successful}`);
    console.log(`  Failed:          ${summary.failed}`);
    console.log(`  No Results:      ${summary.no_results}`);
    console.log('-'.repeat(60));
    console.log(`Shops Found:       ${summary.total_shops_found}`);
    console.log(`Shops Created:     ${summary.total_shops_created}`);
    console.log(`Shops Updated:     ${summary.total_shops_updated}`);
    console.log(`Shops Linked:      ${summary.total_shops_linked}`);
    console.log('-'.repeat(60));
    console.log(`Total Duration:    ${(summary.total_duration_ms / 1000).toFixed(1)}s`);
    console.log('='.repeat(60));

    if (summary.errors.length > 0) {
      console.log('\nERRORS:');
      summary.errors.forEach(({ resort, error }) => {
        console.log(`  - ${resort}: ${error}`);
      });
    }
  }
}
```

## Acceptance Criteria

- [ ] Logger supports debug/info/warn/error levels
- [ ] Progress bar shows batch progress
- [ ] Each enrichment result stored in database
- [ ] Token usage and costs tracked
- [ ] Summary report generated at end
- [ ] Errors collected and displayed

## Testing

1. Run enrichment with debug logging
2. Verify progress bar updates correctly
3. Check database logs after run
4. Verify summary matches actual results
5. Test with intentional failures

## Effort: Small (1-2 hours)
