import OpenAI from 'openai';
import { config } from '../config';
import { Resort, OpenAIDiningVenueResponse } from '../types';
import { logger } from '../utils/logger';

// Pricing per 1K tokens (as of late 2024)
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

export interface OpenAIResponse {
  venues: OpenAIDiningVenueResponse['venues'];
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  rawResponse: unknown;
}

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: config.openai.apiKey });
    this.model = config.enrichment.openaiModel;
  }

  private buildPrompt(resort: Resort, radiusMiles: number, maxVenues: number): string {
    return `You are a helpful assistant that provides information about restaurants, bars, and dining venues near ski resorts.

For the ski resort "${resort.name}" located near ${resort.nearest_city}, ${resort.state_name} (coordinates: ${resort.latitude}, ${resort.longitude}), please provide a list of dining venues within ${radiusMiles} miles.

Include:
- Restaurants (casual, fine dining, family-friendly)
- Bars and pubs
- Breweries and taprooms
- Cafes and coffee shops
- Lodge dining facilities at the resort base
- Aprés-ski spots
- Food trucks if notable/permanent

For each venue, provide:
1. name: The official business name
2. description: A brief 1-2 sentence description of the venue
3. address: Street address
4. city: City name
5. state: Two-letter state/province code (e.g., "CO", "UT", "BC")
6. postal_code: ZIP/postal code
7. latitude: Precise GPS latitude (decimal degrees)
8. longitude: Precise GPS longitude (decimal degrees)
9. phone: Phone number if known (format: xxx-xxx-xxxx)
10. website_url: Official website URL if known
11. venue_type: Array of types from: ["restaurant", "bar", "brewery", "cafe", "food_truck", "lodge_dining"]
12. cuisine_type: Array of cuisines from: ["american", "italian", "mexican", "asian", "japanese", "chinese", "thai", "indian", "french", "mediterranean", "pizza", "burgers", "seafood", "steakhouse", "bbq", "pub_food", "deli", "bakery", "coffee", "vegetarian", "vegan", "international"]
13. price_range: One of: "$", "$$", "$$$", "$$$$"
14. serves_breakfast: Boolean
15. serves_lunch: Boolean
16. serves_dinner: Boolean
17. serves_drinks: Boolean - true if they serve alcoholic beverages
18. has_full_bar: Boolean - true if they have a full liquor bar (not just beer/wine)
19. ambiance: Array from: ["casual", "upscale", "family_friendly", "apres_ski", "fine_dining", "sports_bar", "romantic", "lively", "cozy"]
20. features: Array from: ["outdoor_seating", "fireplace", "live_music", "sports_tv", "reservations_required", "happy_hour", "dog_friendly", "takeout", "delivery", "private_events", "craft_cocktails", "local_beer"]
21. is_on_mountain: Boolean - true if located at resort base area or on the mountain
22. mountain_location: If on mountain, one of: "base", "mid_mountain", "summit", "village"
23. is_ski_in_ski_out: Boolean - true if accessible directly from ski runs
24. hours_notes: Brief notes about hours, especially seasonal variations

Return EXACTLY ${maxVenues} venues. Popular ski towns like Vail, Aspen, Park City, etc. have hundreds of restaurants and bars - you should easily find ${maxVenues} real establishments.

Prioritize in this order:
1. On-mountain dining facilities and aprés-ski spots at the resort
2. Restaurants and bars in the resort village/base area
3. Venues in nearby ski towns within ${radiusMiles} miles
4. Well-known and popular local restaurants and bars
5. Variety of cuisine types and price ranges

IMPORTANT:
- Return the full ${maxVenues} venues - ski resort areas have abundant dining options
- Only include businesses you are confident actually exist
- Provide accurate GPS coordinates
- Include resort-operated dining at the base area
- Include both high-end restaurants and casual/affordable options
- Include bars, breweries, and aprés-ski spots - not just restaurants

Return your response as a JSON object with a "venues" array.`;
  }

  async getDiningVenuesForResort(
    resort: Resort,
    radiusMiles: number,
    maxVenues: number
  ): Promise<OpenAIResponse> {
    const prompt = this.buildPrompt(resort, radiusMiles, maxVenues);

    logger.debug('Sending request to OpenAI', { resort: resort.name, model: this.model });

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert on restaurants, bars, and dining near ski resorts in North America. You provide accurate, factual information about businesses. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 6000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const parsed = JSON.parse(content) as OpenAIDiningVenueResponse;
      const usage = response.usage;

      const promptTokens = usage?.prompt_tokens || 0;
      const completionTokens = usage?.completion_tokens || 0;
      const pricing = PRICING[this.model] || PRICING['gpt-4-turbo-preview'];
      const totalCost =
        (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output;

      logger.debug('OpenAI response received', {
        resort: resort.name,
        venuesFound: parsed.venues?.length || 0,
        tokens: { prompt: promptTokens, completion: completionTokens },
        cost: totalCost.toFixed(4),
      });

      return {
        venues: parsed.venues || [],
        promptTokens,
        completionTokens,
        totalCost,
        rawResponse: parsed,
      };
    } catch (error) {
      logger.error('OpenAI request failed', {
        resort: resort.name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
