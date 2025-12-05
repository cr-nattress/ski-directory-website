# Story 31.4: Implement OpenAI Integration with Structured Output

## Description

Implement the OpenAI API integration that sends aggregated resort data to GPT-4o and receives structured JSON responses with confidence scores.

## Acceptance Criteria

- [ ] OpenAI client configured with API key from environment
- [ ] JSON mode enabled for reliable structured output
- [ ] Rate limiting to avoid API throttling
- [ ] Error handling with retries
- [ ] Token usage and cost tracking
- [ ] Response validation against expected schema

## Technical Details

### Implementation (openai.ts)

```typescript
import OpenAI from 'openai';
import { config } from './config';
import { AggregatedResortData } from './types';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Cost per 1K tokens (GPT-4o pricing as of 2024)
const COST_PER_1K_INPUT = 0.0025;
const COST_PER_1K_OUTPUT = 0.01;

export interface EnrichmentResult {
  tagline: { value: string; confidence: number };
  description: { value: string; confidence: number };
  terrain: {
    beginner: { value: number; confidence: number };
    intermediate: { value: number; confidence: number };
    advanced: { value: number; confidence: number };
    expert: { value: number; confidence: number };
  };
  stats: {
    liftsCount: { value: number; confidence: number };
    verticalDrop: { value: number; confidence: number };
    summitElevation: { value: number; confidence: number };
    baseElevation: { value: number; confidence: number };
    skiableAcres: { value: number; confidence: number };
    avgAnnualSnowfall: { value: number; confidence: number };
    runsCount: { value: number; confidence: number };
  };
  sources: string[];
  notes: string;
}

export interface EnrichmentResponse {
  result: EnrichmentResult;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}

export async function enrichResortData(
  data: AggregatedResortData
): Promise<EnrichmentResponse> {
  const systemPrompt = getSystemPrompt();
  const userPrompt = getUserPrompt(data);

  const response = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  const result = JSON.parse(content) as EnrichmentResult;
  const usage = response.usage!;

  return {
    result,
    usage: {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      estimatedCost:
        (usage.prompt_tokens / 1000) * COST_PER_1K_INPUT +
        (usage.completion_tokens / 1000) * COST_PER_1K_OUTPUT,
    },
  };
}

function getSystemPrompt(): string {
  return `You are a ski resort data analyst...`; // From Story 31.3
}

function getUserPrompt(data: AggregatedResortData): string {
  return `Analyze this ski resort data...`; // From Story 31.3
}
```

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        // Exponential backoff
        await delay(delayMs * Math.pow(2, attempt - 1));
      }
    }
  }

  throw lastError;
}
```

### Rate Limiting

```typescript
let lastCallTime = 0;
const MIN_DELAY_MS = 500;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastCallTime;

  if (elapsed < MIN_DELAY_MS) {
    await delay(MIN_DELAY_MS - elapsed);
  }

  lastCallTime = Date.now();
}

export async function enrichResortDataWithRateLimit(
  data: AggregatedResortData
): Promise<EnrichmentResponse> {
  await rateLimit();
  return withRetry(() => enrichResortData(data));
}
```

## Tasks

- [ ] Create `src/openai.ts`
- [ ] Implement OpenAI client initialization
- [ ] Implement `enrichResortData()` function
- [ ] Add JSON parsing and validation
- [ ] Implement retry logic with exponential backoff
- [ ] Implement rate limiting
- [ ] Add token usage and cost tracking
- [ ] Test with sample resort data

## Effort

**Size:** M (Medium - 2-4 hours)

## Dependencies

- Story 31.1: Project structure
- Story 31.3: Prompt design

## References

- [OpenAI Node SDK](https://github.com/openai/openai-node)
- [OpenAI JSON Mode](https://platform.openai.com/docs/guides/json-mode)
