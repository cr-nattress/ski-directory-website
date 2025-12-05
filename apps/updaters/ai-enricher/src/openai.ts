import OpenAI from 'openai';
import { config, calculateCost } from './config.js';
import type { AggregatedData, AIEnrichmentResult } from './types.js';

let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client instance
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }
  return openaiClient;
}

/**
 * Build the extraction prompt for the LLM
 */
function buildExtractionPrompt(data: AggregatedData): string {
  const parts: string[] = [];

  parts.push(`You are a ski resort marketing expert and data extraction specialist.

Analyze the following data sources for "${data.name}" in ${data.state}, ${data.country} and extract accurate information.`);

  // Add Wikipedia data if available
  if (data.wikipedia) {
    parts.push(`
=== WIKIPEDIA DATA ===

INFOBOX:
${JSON.stringify(data.wikipedia.infobox, null, 2)}

ARTICLE EXTRACT:
${data.wikipedia.fullExtract || data.wikipedia.extract}

CATEGORIES:
${data.wikipedia.categories.join(', ')}`);

    if (data.wikipedia.coordinates) {
      parts.push(`\nCOORDINATES: ${data.wikipedia.coordinates.lat}, ${data.wikipedia.coordinates.lng}`);
    }
  }

  // Add Liftie data if available
  if (data.liftie) {
    parts.push(`
=== LIFTIE (REAL-TIME) DATA ===

Resort Status: ${data.liftie.status}
Lifts - Open: ${data.liftie.lifts.stats.open}, Closed: ${data.liftie.lifts.stats.closed}
Total Lifts: ${Object.keys(data.liftie.lifts.list).length}
Last Updated: ${data.liftie.lastUpdated}`);
  }

  // Add OnTheSnow data if available
  if (data.onTheSnow?.stats) {
    parts.push(`
=== ONTHESNOW DATA ===

Stats:
${JSON.stringify(data.onTheSnow.stats, null, 2)}

Terrain:
${data.onTheSnow.terrain ? JSON.stringify(data.onTheSnow.terrain, null, 2) : 'Not available'}`);
  }

  // Add SkiResortInfo data if available
  if (data.skiResortInfo?.stats) {
    parts.push(`
=== SKI RESORT INFO DATA ===

${JSON.stringify(data.skiResortInfo.stats, null, 2)}`);
  }

  // Add the extraction instructions
  parts.push(`
=== INSTRUCTIONS ===

Extract the following information and return as JSON. For each field:
- Provide a "value" (use null if data is not available or uncertain)
- Provide a "confidence" score (0.0 = no data, 1.0 = explicitly stated in source)

For TAGLINE: Create a catchy 5-10 word phrase that captures what makes this resort unique.
- Reference specific features (elevation, terrain, history, snowfall, location)
- Make it memorable and specific to THIS resort
- Examples: "Legendary Back Bowls, World-Class Village" or "Where Steep Meets Deep"
- Avoid generic phrases like "Great skiing for everyone"

For DESCRIPTION: Write a compelling 2-3 paragraph (300-500 words) description.
- Tell the resort's story - its history, unique terrain features, atmosphere
- Include specific details: signature runs, elevation, snowfall when available
- Write in an inviting, informative tone that makes readers want to visit
- Do NOT use markdown formatting

For STATS: Convert to standard units:
- Acres for skiable area
- Feet for elevation and vertical drop
- Inches for annual snowfall
- If sources disagree, weight Wikipedia and official sources higher

For TERRAIN: Ensure percentages add up to approximately 100%.

Return ONLY this JSON structure:

{
  "content": {
    "tagline": { "value": "string", "confidence": 0.0-1.0 },
    "description": { "value": "string", "confidence": 0.0-1.0 }
  },
  "stats": {
    "skiableAcres": { "value": number or null, "confidence": 0.0-1.0 },
    "liftsCount": { "value": number or null, "confidence": 0.0-1.0 },
    "runsCount": { "value": number or null, "confidence": 0.0-1.0 },
    "verticalDrop": { "value": number or null, "confidence": 0.0-1.0 },
    "baseElevation": { "value": number or null, "confidence": 0.0-1.0 },
    "summitElevation": { "value": number or null, "confidence": 0.0-1.0 },
    "avgAnnualSnowfall": { "value": number or null, "confidence": 0.0-1.0 }
  },
  "terrain": {
    "beginner": { "value": number or null, "confidence": 0.0-1.0 },
    "intermediate": { "value": number or null, "confidence": 0.0-1.0 },
    "advanced": { "value": number or null, "confidence": 0.0-1.0 },
    "expert": { "value": number or null, "confidence": 0.0-1.0 }
  }
}`);

  return parts.join('\n');
}

/**
 * Extract data using OpenAI
 */
export async function enrichResortData(
  data: AggregatedData
): Promise<{
  result: AIEnrichmentResult;
  usage: {
    promptTokens: number;
    completionTokens: number;
    estimatedCost: number;
  };
}> {
  const client = getOpenAIClient();
  const prompt = buildExtractionPrompt(data);

  const response = await client.chat.completions.create({
    model: config.openai.model,
    messages: [
      {
        role: 'system',
        content: 'You are a data extraction assistant. Return only valid JSON with no additional text or formatting.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3, // Lower temperature for more consistent extraction
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  const promptTokens = response.usage?.prompt_tokens ?? 0;
  const completionTokens = response.usage?.completion_tokens ?? 0;

  try {
    const result = JSON.parse(content) as AIEnrichmentResult;
    return {
      result,
      usage: {
        promptTokens,
        completionTokens,
        estimatedCost: calculateCost(config.openai.model, promptTokens, completionTokens),
      },
    };
  } catch (error) {
    console.error('Failed to parse LLM response:', content);
    throw new Error(`Failed to parse LLM response as JSON: ${error}`);
  }
}

/**
 * Enrich with rate limiting and retry
 */
export async function enrichResortDataWithRateLimit(
  data: AggregatedData,
  retries = 3
): Promise<ReturnType<typeof enrichResortData>> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await enrichResortData(data);
    } catch (error) {
      const err = error as Error & { status?: number };

      // Handle rate limiting
      if (err.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`  Rate limited, waiting ${waitTime / 1000}s...`);
        await sleep(waitTime);
        continue;
      }

      // Handle other errors
      if (attempt === retries) {
        throw error;
      }

      console.log(`  Attempt ${attempt} failed, retrying...`);
      await sleep(1000);
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
