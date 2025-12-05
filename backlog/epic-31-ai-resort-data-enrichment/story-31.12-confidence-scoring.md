# Story 31.12: Add Confidence Scoring and Threshold Filtering

## Description

Implement a robust confidence scoring system that evaluates the reliability of each AI-generated field and filters out low-confidence values before they reach Supabase.

## Acceptance Criteria

- [ ] Each field has an individual confidence score (0.0-1.0)
- [ ] Configurable minimum confidence threshold
- [ ] Fields below threshold are logged but not applied
- [ ] Source quality affects confidence scores
- [ ] Consistent values across sources boost confidence
- [ ] Numeric outliers reduce confidence

## Technical Details

### Confidence Factors

```typescript
interface ConfidenceFactors {
  // Source reliability weights
  sourceWeights: {
    wikipedia: 0.9,     // High reliability
    liftie: 0.95,       // Real-time, very reliable
    onTheSnow: 0.8,     // Good but sometimes outdated
    skiResortInfo: 0.75, // Variable quality
    official: 1.0,      // Official sources are trusted
  };

  // Cross-source agreement bonus
  agreementBonus: 0.1;  // Add when multiple sources agree

  // Recency factor
  recencyWeight: {
    under1Year: 1.0,
    under2Years: 0.9,
    under3Years: 0.8,
    older: 0.7,
  };
}
```

### Confidence Calculation (confidence.ts)

```typescript
export interface ConfidenceInput {
  value: string | number;
  sources: Array<{
    name: string;
    value: string | number;
    date?: string;
  }>;
  fieldType: 'numeric' | 'text' | 'percentage';
  expectedRange?: { min: number; max: number };
}

export function calculateConfidence(input: ConfidenceInput): number {
  let confidence = 0.5; // Base confidence

  const { sources, fieldType, expectedRange } = input;

  // Factor 1: Source count and quality
  if (sources.length >= 2) {
    confidence += 0.15;
  }
  if (sources.length >= 3) {
    confidence += 0.1;
  }

  // Factor 2: Source agreement
  if (fieldType === 'numeric') {
    const values = sources.map((s) => Number(s.value));
    const variance = calculateVariance(values);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    if (coefficientOfVariation < 0.05) {
      confidence += 0.2; // Very consistent
    } else if (coefficientOfVariation < 0.15) {
      confidence += 0.1; // Reasonably consistent
    } else if (coefficientOfVariation > 0.3) {
      confidence -= 0.2; // High variance, reduce confidence
    }
  }

  // Factor 3: Range validation
  if (expectedRange && fieldType === 'numeric') {
    const numValue = Number(input.value);
    if (numValue < expectedRange.min || numValue > expectedRange.max) {
      confidence -= 0.3; // Out of expected range
    }
  }

  // Factor 4: Source reliability
  const avgSourceWeight = sources.reduce((sum, s) => {
    const weight = SOURCE_WEIGHTS[s.name] || 0.5;
    return sum + weight;
  }, 0) / sources.length;
  confidence = confidence * avgSourceWeight;

  // Clamp to 0-1
  return Math.max(0, Math.min(1, confidence));
}

// Expected ranges for ski resort stats
export const EXPECTED_RANGES = {
  liftsCount: { min: 1, max: 100 },
  runsCount: { min: 1, max: 500 },
  verticalDrop: { min: 100, max: 6000 }, // feet
  summitElevation: { min: 1000, max: 15000 }, // feet
  baseElevation: { min: 0, max: 12000 }, // feet
  skiableAcres: { min: 10, max: 10000 },
  avgAnnualSnowfall: { min: 50, max: 700 }, // inches
  terrain: {
    beginner: { min: 0, max: 100 },
    intermediate: { min: 0, max: 100 },
    advanced: { min: 0, max: 100 },
    expert: { min: 0, max: 100 },
  },
};
```

### Threshold Filtering

```typescript
export interface FilterOptions {
  minConfidence: number;
  logSkipped: boolean;
  returnSkippedInfo: boolean;
}

export interface FilterResult<T> {
  applied: Record<string, T>;
  skipped: Array<{
    field: string;
    value: T;
    confidence: number;
    reason: string;
  }>;
}

export function filterByConfidence<T>(
  fields: Record<string, ScoredValue<T>>,
  options: FilterOptions
): FilterResult<T> {
  const result: FilterResult<T> = {
    applied: {},
    skipped: [],
  };

  for (const [field, scored] of Object.entries(fields)) {
    if (scored.confidence >= options.minConfidence) {
      result.applied[field] = scored.value;
    } else {
      if (options.logSkipped) {
        console.log(
          `  ⚠ Skipping ${field}: confidence ${scored.confidence.toFixed(2)} < ${options.minConfidence}`
        );
      }
      result.skipped.push({
        field,
        value: scored.value,
        confidence: scored.confidence,
        reason: `Below threshold (${scored.confidence.toFixed(2)} < ${options.minConfidence})`,
      });
    }
  }

  return result;
}
```

### CLI Configuration

```bash
# Default threshold (0.7)
npm start

# Higher threshold for production
npm start -- --min-confidence 0.85

# Lower threshold for testing
npm start -- --min-confidence 0.5

# Environment variable
MIN_CONFIDENCE=0.8 npm start
```

### Console Output

```
Processing: vail

Confidence Scores:
  ✓ tagline: 0.92 (applied)
  ✓ description: 0.88 (applied)
  ✓ stats.liftsCount: 0.95 (applied)
  ✓ stats.verticalDrop: 0.95 (applied)
  ⚠ stats.runsCount: 0.62 (skipped - below 0.70)
  ✓ terrain.beginner: 0.85 (applied)
  ⚠ terrain.expert: 0.58 (skipped - high variance)

Applied: 5 fields | Skipped: 2 fields
```

## Tasks

- [ ] Create `src/confidence.ts` with scoring functions
- [ ] Implement source weighting system
- [ ] Add cross-source agreement detection
- [ ] Add range validation for numeric fields
- [ ] Implement threshold filtering
- [ ] Add CLI option for min-confidence
- [ ] Add environment variable support
- [ ] Log skipped fields with reasons
- [ ] Test with various data scenarios

## Effort

**Size:** M (Medium - 2-4 hours)

## Dependencies

- Story 31.4: OpenAI integration (provides raw confidence from AI)
- Story 31.5: Type definitions (ScoredValue type)

## References

- [Confidence Interval Estimation](https://en.wikipedia.org/wiki/Confidence_interval)
