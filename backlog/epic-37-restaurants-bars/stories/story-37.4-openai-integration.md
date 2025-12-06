# Story 37.4: Dining Enricher - OpenAI Integration

## Description

Implement the OpenAI service that constructs detailed prompts for discovering restaurants and bars near ski resorts, and parses the JSON responses.

## Acceptance Criteria

- [ ] OpenAI service with prompt construction
- [ ] Detailed prompt template for dining venue discovery
- [ ] JSON response format specification
- [ ] Token usage tracking and cost calculation
- [ ] Error handling for API failures
- [ ] Temperature and model configuration
- [ ] Support for gpt-4-turbo and gpt-4o models

## OpenAI Prompt Template

```typescript
const DINING_PROMPT = `
You are a ski resort dining expert. Find restaurants, bars, breweries, and dining venues near the following ski resort.

Resort: {resortName}
Location: {nearestCity}, {stateName}
Coordinates: {latitude}, {longitude}
Search Radius: {radiusMiles} miles

Find ALL dining venues within the search radius. Include:
- On-mountain restaurants (base lodges, mid-mountain, summit)
- Village restaurants and bars
- Nearby town establishments
- Breweries and taprooms
- Cafes and coffee shops
- Après-ski spots

For EACH venue, provide:
1. **name**: Official business name
2. **description**: 2-3 sentence description highlighting what makes it special
3. **address**: Street address
4. **city**: City name
5. **state**: State abbreviation (e.g., "CO")
6. **postal_code**: ZIP code
7. **latitude**: Decimal latitude (must be accurate to 4+ decimal places)
8. **longitude**: Decimal longitude (must be accurate to 4+ decimal places)
9. **phone**: Phone number in format xxx-xxx-xxxx
10. **website**: Full URL including https://
11. **venue_type**: Array from [restaurant, bar, brewery, cafe, food_truck, lodge_dining]
12. **cuisine_type**: Array from [american, italian, mexican, asian, pizza, burgers, seafood, steakhouse, bbq, pub_food, fine_dining, deli, sushi, thai, indian, french, mediterranean]
13. **price_range**: One of [$, $$, $$$, $$$$]
14. **serves_breakfast**: boolean
15. **serves_lunch**: boolean
16. **serves_dinner**: boolean
17. **serves_drinks**: boolean (serves alcohol)
18. **has_full_bar**: boolean
19. **ambiance**: Array from [casual, upscale, family_friendly, sports_bar, apres_ski, romantic, lively, cozy, trendy]
20. **features**: Array from [outdoor_seating, patio, fireplace, live_music, happy_hour, late_night, reservations_recommended, walk_ins_only, takeout, delivery, pet_friendly, craft_cocktails, local_beer, wine_list, mountain_views]
21. **is_on_mountain**: boolean (accessible only via ski lift or on ski area property)
22. **mountain_location**: One of [base, mid_mountain, summit, village, off_mountain]
23. **is_ski_in_ski_out**: boolean (can ski directly to entrance)
24. **hours_notes**: Brief notes about hours, especially winter vs summer

IMPORTANT:
- Only include venues that ACTUALLY EXIST and are CURRENTLY OPERATING
- Coordinates MUST be accurate - verify against known addresses
- Include the most popular and well-reviewed establishments
- Prioritize venues that cater to skiers and snowboarders
- Include both casual and upscale options

Return a JSON object with this structure:
{
  "venues": [
    { venue object },
    { venue object },
    ...
  ]
}

Return up to {maxVenues} venues, prioritized by relevance to skiers.
`;
```

## Token Cost Tracking

```typescript
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

const PRICING = {
  'gpt-4-turbo': { input: 0.01, output: 0.03 },  // per 1K tokens
  'gpt-4o': { input: 0.005, output: 0.015 },
};

function calculateCost(usage: TokenUsage, model: string): number {
  const prices = PRICING[model];
  return (
    (usage.promptTokens / 1000) * prices.input +
    (usage.completionTokens / 1000) * prices.output
  );
}
```

## OpenAI Service Implementation

```typescript
// services/openai.ts
export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4-turbo') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async findDiningVenues(resort: Resort, options: SearchOptions): Promise<OpenAIResult> {
    const prompt = this.buildPrompt(resort, options);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,  // Lower for more consistent results
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    const usage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      estimatedCost: this.calculateCost(response.usage),
    };

    return {
      content: response.choices[0].message.content,
      usage,
      model: this.model,
    };
  }
}
```

## Error Handling

- Retry logic with exponential backoff for rate limits
- Graceful fallback for empty responses
- Validation of coordinate bounds (North America)
- Logging of all API errors

## Effort

Large (4-6 hours)
