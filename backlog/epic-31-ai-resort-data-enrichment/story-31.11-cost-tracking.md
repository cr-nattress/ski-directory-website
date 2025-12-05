# Story 31.11: Create Cost Tracking and Reporting

## Description

Implement comprehensive cost tracking for OpenAI API usage, including per-resort costs, cumulative costs, and reporting.

## Acceptance Criteria

- [ ] Track token usage for each API call
- [ ] Calculate estimated cost per resort
- [ ] Track cumulative cost across processing run
- [ ] Report cost in summary
- [ ] Save cost data to GCS for auditing
- [ ] Support different pricing for different models

## Technical Details

### Cost Configuration (config.ts)

```typescript
// OpenAI pricing (as of 2024)
export const MODEL_PRICING = {
  'gpt-4o': {
    input: 0.0025,   // per 1K tokens
    output: 0.01,    // per 1K tokens
  },
  'gpt-4o-mini': {
    input: 0.00015,
    output: 0.0006,
  },
  'gpt-4-turbo': {
    input: 0.01,
    output: 0.03,
  },
} as const;

export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING]
    || MODEL_PRICING['gpt-4o'];

  return (
    (promptTokens / 1000) * pricing.input +
    (completionTokens / 1000) * pricing.output
  );
}
```

### Cost Tracking Data Structure

```typescript
export interface CostReport {
  runId: string;
  startedAt: string;
  completedAt: string;
  model: string;
  resorts: Array<{
    slug: string;
    promptTokens: number;
    completionTokens: number;
    cost: number;
    processingTimeMs: number;
  }>;
  totals: {
    resortCount: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalCost: number;
    avgCostPerResort: number;
    totalProcessingTimeMs: number;
  };
}
```

### Cost Report File

Save to GCS after each run:

```
sda-assets-prod/resorts/_processing/cost-reports/2025-12-04T05-00-00Z.json
```

```json
{
  "runId": "2025-12-04T05-00-00Z",
  "startedAt": "2025-12-04T05:00:00Z",
  "completedAt": "2025-12-04T05:45:00Z",
  "model": "gpt-4o",
  "resorts": [
    {
      "slug": "vail",
      "promptTokens": 1523,
      "completionTokens": 842,
      "cost": 0.0275,
      "processingTimeMs": 3500
    },
    {
      "slug": "breckenridge",
      "promptTokens": 1412,
      "completionTokens": 756,
      "cost": 0.0249,
      "processingTimeMs": 3200
    }
  ],
  "totals": {
    "resortCount": 50,
    "totalPromptTokens": 75000,
    "totalCompletionTokens": 40000,
    "totalCost": 1.38,
    "avgCostPerResort": 0.0276,
    "totalProcessingTimeMs": 175000
  }
}
```

### Console Output

```
═══════════════════════════════════════════════════
                  COST REPORT
═══════════════════════════════════════════════════

Model: gpt-4o
Resorts processed: 50

Token Usage:
  Input tokens:  75,000
  Output tokens: 40,000
  Total tokens:  115,000

Cost Breakdown:
  Input cost:    $0.19 (75K × $0.0025)
  Output cost:   $1.19 (40K × $0.0100)
  ─────────────────────
  Total cost:    $1.38

Average per resort: $0.028

Processing Time:
  Total: 2m 55s
  Average: 3.5s per resort
```

### Implementation (cost.ts)

```typescript
import { CostReport } from './types';
import { calculateCost } from './config';
import { saveToGCS } from './gcs';

class CostTracker {
  private resorts: CostReport['resorts'] = [];
  private startedAt: Date;
  private model: string;

  constructor(model: string) {
    this.model = model;
    this.startedAt = new Date();
  }

  addResort(
    slug: string,
    promptTokens: number,
    completionTokens: number,
    processingTimeMs: number
  ): void {
    const cost = calculateCost(this.model, promptTokens, completionTokens);
    this.resorts.push({
      slug,
      promptTokens,
      completionTokens,
      cost,
      processingTimeMs,
    });
  }

  getReport(): CostReport {
    const totals = this.resorts.reduce(
      (acc, r) => ({
        resortCount: acc.resortCount + 1,
        totalPromptTokens: acc.totalPromptTokens + r.promptTokens,
        totalCompletionTokens: acc.totalCompletionTokens + r.completionTokens,
        totalCost: acc.totalCost + r.cost,
        totalProcessingTimeMs: acc.totalProcessingTimeMs + r.processingTimeMs,
        avgCostPerResort: 0,
      }),
      {
        resortCount: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalCost: 0,
        totalProcessingTimeMs: 0,
        avgCostPerResort: 0,
      }
    );

    totals.avgCostPerResort = totals.resortCount > 0
      ? totals.totalCost / totals.resortCount
      : 0;

    return {
      runId: this.startedAt.toISOString(),
      startedAt: this.startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      model: this.model,
      resorts: this.resorts,
      totals,
    };
  }

  async saveReport(): Promise<void> {
    const report = this.getReport();
    const filename = `_processing/cost-reports/${report.runId.replace(/:/g, '-')}.json`;
    await saveToGCS(filename, JSON.stringify(report, null, 2));
  }

  printSummary(): void {
    const report = this.getReport();
    // Print formatted summary (see console output above)
  }
}

export { CostTracker };
```

## Tasks

- [ ] Create `src/cost.ts` with CostTracker class
- [ ] Add model pricing configuration
- [ ] Implement cost calculation
- [ ] Implement cost report generation
- [ ] Save cost reports to GCS
- [ ] Add cost summary to console output
- [ ] Test with different models

## Effort

**Size:** S (Small - 1-2 hours)

## Dependencies

- Story 31.4: OpenAI integration (for token usage data)

## References

- [OpenAI Pricing](https://openai.com/pricing)
