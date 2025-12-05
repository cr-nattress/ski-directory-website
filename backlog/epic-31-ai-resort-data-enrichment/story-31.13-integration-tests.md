# Story 31.13: Write Integration Tests

## Description

Create comprehensive integration tests for the AI enrichment pipeline, including mock OpenAI responses, GCS interactions, and Supabase updates.

## Acceptance Criteria

- [ ] Tests for GCS data aggregation
- [ ] Tests for OpenAI API integration (mocked)
- [ ] Tests for Supabase update logic
- [ ] Tests for confidence filtering
- [ ] Tests for dry-run mode
- [ ] Tests for error handling
- [ ] CI-compatible test setup

## Technical Details

### Test Structure

```
apps/updaters/ai-enricher/
├── src/
│   └── ...
├── tests/
│   ├── fixtures/
│   │   ├── mock-gcs-data/
│   │   │   ├── wikipedia.json
│   │   │   ├── liftie.json
│   │   │   └── ots-details.json
│   │   ├── mock-openai-response.json
│   │   └── mock-resort-record.json
│   ├── unit/
│   │   ├── aggregator.test.ts
│   │   ├── confidence.test.ts
│   │   ├── cost.test.ts
│   │   └── parser.test.ts
│   ├── integration/
│   │   ├── openai.test.ts
│   │   ├── supabase.test.ts
│   │   └── processor.test.ts
│   └── setup.ts
├── vitest.config.ts
└── package.json
```

### Test Setup (tests/setup.ts)

```typescript
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('OPENAI_API_KEY', 'test-key');
vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('GCS_BUCKET_NAME', 'test-bucket');

// Mock GCS client
vi.mock('@google-cloud/storage', () => ({
  Storage: vi.fn().mockImplementation(() => ({
    bucket: vi.fn().mockReturnValue({
      file: vi.fn().mockReturnValue({
        download: vi.fn(),
        save: vi.fn(),
        exists: vi.fn(),
      }),
      getFiles: vi.fn(),
    }),
  })),
}));

// Mock OpenAI client
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));
```

### Aggregator Tests (tests/unit/aggregator.test.ts)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aggregateResortData } from '../src/aggregator';
import wikipediaFixture from './fixtures/mock-gcs-data/wikipedia.json';
import liftieFixture from './fixtures/mock-gcs-data/liftie.json';

describe('aggregateResortData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should aggregate Wikipedia and Liftie data', async () => {
    // Mock GCS file downloads
    const mockDownload = vi.fn()
      .mockResolvedValueOnce([Buffer.from(JSON.stringify(wikipediaFixture))])
      .mockResolvedValueOnce([Buffer.from(JSON.stringify(liftieFixture))]);

    const result = await aggregateResortData('us/colorado/vail');

    expect(result).toHaveProperty('slug', 'vail');
    expect(result.dataQuality.hasWikipedia).toBe(true);
    expect(result.dataQuality.hasLiftie).toBe(true);
  });

  it('should handle missing Wikipedia data', async () => {
    const mockDownload = vi.fn()
      .mockRejectedValueOnce(new Error('File not found'))
      .mockResolvedValueOnce([Buffer.from(JSON.stringify(liftieFixture))]);

    const result = await aggregateResortData('us/colorado/unknown');

    expect(result.dataQuality.hasWikipedia).toBe(false);
    expect(result.dataQuality.hasLiftie).toBe(true);
  });

  it('should calculate correct data quality score', async () => {
    const result = await aggregateResortData('us/colorado/vail');

    expect(result.dataQuality.overallScore).toBeGreaterThan(0.5);
    expect(result.dataQuality.fileCount).toBeGreaterThan(0);
  });
});
```

### Confidence Tests (tests/unit/confidence.test.ts)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateConfidence, filterByConfidence, EXPECTED_RANGES } from '../src/confidence';

describe('calculateConfidence', () => {
  it('should give high confidence for multiple agreeing sources', () => {
    const confidence = calculateConfidence({
      value: 3450,
      sources: [
        { name: 'wikipedia', value: 3450 },
        { name: 'onTheSnow', value: 3450 },
        { name: 'skiResortInfo', value: 3450 },
      ],
      fieldType: 'numeric',
      expectedRange: EXPECTED_RANGES.verticalDrop,
    });

    expect(confidence).toBeGreaterThan(0.85);
  });

  it('should reduce confidence for high variance', () => {
    const confidence = calculateConfidence({
      value: 3450,
      sources: [
        { name: 'wikipedia', value: 3450 },
        { name: 'onTheSnow', value: 2800 },
        { name: 'skiResortInfo', value: 4000 },
      ],
      fieldType: 'numeric',
      expectedRange: EXPECTED_RANGES.verticalDrop,
    });

    expect(confidence).toBeLessThan(0.7);
  });

  it('should reduce confidence for out-of-range values', () => {
    const confidence = calculateConfidence({
      value: 50000, // Unrealistic acres
      sources: [{ name: 'wikipedia', value: 50000 }],
      fieldType: 'numeric',
      expectedRange: EXPECTED_RANGES.skiableAcres,
    });

    expect(confidence).toBeLessThan(0.5);
  });
});

describe('filterByConfidence', () => {
  it('should filter out low confidence fields', () => {
    const fields = {
      liftsCount: { value: 31, confidence: 0.95 },
      runsCount: { value: 195, confidence: 0.62 },
      verticalDrop: { value: 3450, confidence: 0.88 },
    };

    const result = filterByConfidence(fields, {
      minConfidence: 0.7,
      logSkipped: false,
      returnSkippedInfo: true,
    });

    expect(Object.keys(result.applied)).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].field).toBe('runsCount');
  });
});
```

### OpenAI Integration Test (tests/integration/openai.test.ts)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrichResortData } from '../src/openai';
import mockOpenAIResponse from './fixtures/mock-openai-response.json';

describe('enrichResortData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse OpenAI JSON response correctly', async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockOpenAIResponse) } }],
      usage: { prompt_tokens: 1500, completion_tokens: 800 },
    });

    const result = await enrichResortData({
      slug: 'vail',
      name: 'Vail',
      // ... aggregated data
    });

    expect(result.result.content.tagline.value).toBeTruthy();
    expect(result.result.stats.liftsCount.confidence).toBeGreaterThan(0);
    expect(result.usage.estimatedCost).toBeGreaterThan(0);
  });

  it('should handle rate limiting with retry', async () => {
    const mockCreate = vi.fn()
      .mockRejectedValueOnce({ status: 429, message: 'Rate limited' })
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockOpenAIResponse) } }],
        usage: { prompt_tokens: 1500, completion_tokens: 800 },
      });

    const result = await enrichResortData({
      slug: 'vail',
      name: 'Vail',
    });

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(result.result).toBeDefined();
  });

  it('should throw on invalid JSON response', async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'not valid json' } }],
      usage: { prompt_tokens: 1500, completion_tokens: 800 },
    });

    await expect(enrichResortData({ slug: 'vail', name: 'Vail' }))
      .rejects.toThrow('Invalid JSON response');
  });
});
```

### Processor Integration Test (tests/integration/processor.test.ts)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processAllResorts } from '../src/processor';

describe('processAllResorts', () => {
  it('should process resorts in dry-run mode without writes', async () => {
    const mockGCSSave = vi.fn();
    const mockSupabaseUpdate = vi.fn();

    const results = await processAllResorts({
      filter: 'vail',
      limit: 1,
      dryRun: true,
    });

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(mockGCSSave).not.toHaveBeenCalled();
    expect(mockSupabaseUpdate).not.toHaveBeenCalled();
  });

  it('should skip already processed resorts in resume mode', async () => {
    // Mock progress file
    vi.mocked(loadProgress).mockResolvedValue({
      processedResorts: ['us/colorado/vail'],
      failedResorts: {},
      stats: { processed: 1, failed: 0, skipped: 0, total: 2 },
    });

    const results = await processAllResorts({
      resume: true,
      limit: 2,
    });

    const skipped = results.filter((r) => r.skipped);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].slug).toBe('vail');
  });

  it('should handle graceful shutdown on SIGINT', async () => {
    const processSpy = vi.spyOn(process, 'on');

    processAllResorts({ limit: 100 });

    // Simulate SIGINT
    process.emit('SIGINT');

    expect(processSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
  });
});
```

### Vitest Config (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
    },
    testTimeout: 30000,
  },
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run tests/integration"
  }
}
```

## Tasks

- [ ] Set up Vitest configuration
- [ ] Create test fixtures (mock GCS data, OpenAI responses)
- [ ] Write unit tests for aggregator
- [ ] Write unit tests for confidence scoring
- [ ] Write unit tests for cost calculation
- [ ] Write integration tests for OpenAI (mocked)
- [ ] Write integration tests for Supabase (mocked)
- [ ] Write integration tests for processor
- [ ] Add coverage reporting
- [ ] Verify all tests pass

## Effort

**Size:** M (Medium - 2-4 hours)

## Dependencies

- All previous stories (tests validate complete pipeline)

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Node.js with Vitest](https://vitest.dev/guide/)
