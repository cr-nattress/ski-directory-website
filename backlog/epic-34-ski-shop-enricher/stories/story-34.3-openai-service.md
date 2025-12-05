# Story 34.3: Implement OpenAI Service with Prompts

## Priority: High

## Phase: Core

## Context

Create the OpenAI service that handles communication with GPT-4 Turbo to discover ski shops near resort locations. This is the core intelligence of the enricher.

## Requirements

1. Create OpenAI client wrapper
2. Design system and user prompts
3. Handle JSON response format
4. Track token usage for cost monitoring
5. Implement retry logic for failures

## Implementation

### src/services/openai.ts

```typescript
import OpenAI from 'openai';
import { config } from '../config';
import { Resort } from '../types';
import { logger } from '../utils/logger';

export interface OpenAIShopResponse {
  resort_name: string;
  search_location: {
    latitude: number;
    longitude: number;
  };
  search_radius_miles: number;
  shops_found: number;
  ski_shops: OpenAIShop[];
  note?: string;
}

export interface OpenAIShop {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  website_url: string | null;
  phone: string | null;
  shop_type: string[];
  services: string[];
  estimated_distance_miles: number;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
}

const SYSTEM_PROMPT = `You are a ski industry expert assistant that helps find ski shops near ski resorts. You have extensive knowledge of ski shops, rental facilities, and outdoor gear stores across North America.

When asked about ski shops near a location, provide accurate, real information about actual businesses. Include only shops that you are confident exist and are currently operating.

Always respond in valid JSON format as specified. Do not include any text outside the JSON object.`;

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: config.openai.apiKey });
    this.model = config.enrichment.openaiModel;
  }

  async findSkiShops(
    resort: Resort,
    radiusMiles: number
  ): Promise<{ response: OpenAIShopResponse | null; usage: TokenUsage }> {
    const userPrompt = this.buildUserPrompt(resort, radiusMiles);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 4000,
      });

      const content = completion.choices[0]?.message?.content;
      const usage = this.calculateUsage(completion.usage);

      if (!content) {
        logger.warn(`Empty response from OpenAI for ${resort.name}`);
        return { response: null, usage };
      }

      try {
        const parsed = JSON.parse(content) as OpenAIShopResponse;
        return { response: parsed, usage };
      } catch (parseError) {
        logger.error(`Failed to parse OpenAI response for ${resort.name}`, {
          content: content.substring(0, 500),
        });
        return { response: null, usage };
      }
    } catch (error) {
      logger.error(`OpenAI API error for ${resort.name}`, { error });
      throw error;
    }
  }

  private buildUserPrompt(resort: Resort, radiusMiles: number): string {
    return `Find ski shops within ${radiusMiles} miles of ${resort.name} ski resort located at ${resort.lat}, ${resort.lng} near ${resort.nearest_city}, ${resort.state_name}.

Include:
- Ski rental shops
- Ski/snowboard retail stores
- Outdoor gear stores with ski equipment
- Resort-operated rental facilities

For each shop, provide:
1. name: Official business name
2. description: Brief 1-2 sentence description of the shop and what they offer
3. address: Full street address
4. city: City name
5. state: State abbreviation (e.g., CO, UT)
6. postal_code: ZIP code
7. latitude: Decimal latitude
8. longitude: Decimal longitude
9. website_url: Official website URL (or null if unknown)
10. phone: Phone number (or null if unknown)
11. shop_type: Array of types from: ["rental", "retail", "repair", "demo"]
12. services: Array from: ["ski_rental", "snowboard_rental", "boot_fitting", "tuning", "waxing", "repairs", "lessons"]
13. estimated_distance_miles: Approximate distance from the resort

Respond ONLY with valid JSON in this exact format:
{
  "resort_name": "${resort.name}",
  "search_location": {"latitude": ${resort.lat}, "longitude": ${resort.lng}},
  "search_radius_miles": ${radiusMiles},
  "shops_found": <number>,
  "ski_shops": [
    {
      "name": "...",
      "description": "...",
      "address": "...",
      "city": "...",
      "state": "...",
      "postal_code": "...",
      "latitude": ...,
      "longitude": ...,
      "website_url": "..." or null,
      "phone": "..." or null,
      "shop_type": [...],
      "services": [...],
      "estimated_distance_miles": ...
    }
  ]
}

If no ski shops are found within the radius, return:
{
  "resort_name": "${resort.name}",
  "search_location": {"latitude": ${resort.lat}, "longitude": ${resort.lng}},
  "search_radius_miles": ${radiusMiles},
  "shops_found": 0,
  "ski_shops": [],
  "note": "No ski shops found within the specified radius"
}`;
  }

  private calculateUsage(
    usage: OpenAI.Completions.CompletionUsage | undefined
  ): TokenUsage {
    if (!usage) {
      return {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        estimated_cost: 0,
      };
    }

    // GPT-4 Turbo pricing (as of late 2024)
    const inputCostPer1k = 0.01;
    const outputCostPer1k = 0.03;

    const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1k;
    const outputCost = (usage.completion_tokens / 1000) * outputCostPer1k;

    return {
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      estimated_cost: inputCost + outputCost,
    };
  }
}
```

## Acceptance Criteria

- [ ] OpenAI client properly initialized
- [ ] System prompt establishes expert context
- [ ] User prompt includes all required fields
- [ ] JSON response format enforced
- [ ] Token usage tracked for cost monitoring
- [ ] Parse errors handled gracefully
- [ ] API errors logged with context

## Testing

1. Test with a single resort (e.g., Vail)
2. Verify JSON response parses correctly
3. Check token usage calculation
4. Test with resort that has no nearby shops
5. Verify error handling with invalid API key

## Effort: Medium (2-3 hours)
