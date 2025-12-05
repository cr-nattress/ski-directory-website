import OpenAI from 'openai';
import { config } from '../config';
import { Resort, OpenAISkiShopResponse } from '../types';
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
  shops: OpenAISkiShopResponse['shops'];
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

  private buildPrompt(resort: Resort, radiusMiles: number, maxShops: number): string {
    return `You are a helpful assistant that provides information about ski shops near ski resorts.

For the ski resort "${resort.name}" located near ${resort.nearest_city}, ${resort.state_name} (coordinates: ${resort.latitude}, ${resort.longitude}), please provide a list of ski and snowboard shops within ${radiusMiles} miles.

Include:
- Shops that rent ski and snowboard equipment
- Shops that sell ski and snowboard equipment
- Shops that offer tuning, waxing, and repair services
- Both on-mountain shops and shops in nearby towns

For each shop, provide:
1. name: The official business name
2. description: A brief 1-2 sentence description of the shop
3. address: Street address
4. city: City name
5. state: Two-letter state code (e.g., "CO", "UT")
6. postal_code: ZIP code
7. latitude: Precise GPS latitude (decimal degrees)
8. longitude: Precise GPS longitude (decimal degrees)
9. phone: Phone number if known (format: xxx-xxx-xxxx)
10. website_url: Official website URL if known
11. shop_type: Array of types from: ["rental", "retail", "repair", "demo"]
12. services: Array of services from: ["ski_rental", "snowboard_rental", "boot_fitting", "tuning", "waxing", "repairs", "lessons"]
13. is_on_mountain: Boolean - true if the shop is located at the resort base area or on the mountain

Return up to ${maxShops} shops, prioritizing:
1. Shops closest to the resort
2. Shops with the most services
3. Well-known and reputable shops

IMPORTANT:
- Only include businesses you are highly confident actually exist
- Provide accurate GPS coordinates, not approximations
- Include resort-operated rental shops at the base area if they exist
- Do not include generic big-box stores unless they have dedicated ski departments

Return your response as a JSON object with a "shops" array.`;
  }

  async getSkiShopsForResort(
    resort: Resort,
    radiusMiles: number,
    maxShops: number
  ): Promise<OpenAIResponse> {
    const prompt = this.buildPrompt(resort, radiusMiles, maxShops);

    logger.debug('Sending request to OpenAI', { resort: resort.name, model: this.model });

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert on ski shops and ski resorts in North America. You provide accurate, factual information about businesses. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const parsed = JSON.parse(content) as OpenAISkiShopResponse;
      const usage = response.usage;

      const promptTokens = usage?.prompt_tokens || 0;
      const completionTokens = usage?.completion_tokens || 0;
      const pricing = PRICING[this.model] || PRICING['gpt-4-turbo-preview'];
      const totalCost =
        (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output;

      logger.debug('OpenAI response received', {
        resort: resort.name,
        shopsFound: parsed.shops?.length || 0,
        tokens: { prompt: promptTokens, completion: completionTokens },
        cost: totalCost.toFixed(4),
      });

      return {
        shops: parsed.shops || [],
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
