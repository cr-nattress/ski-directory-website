import OpenAI from 'openai';
import { config } from './config.js';
import type { Resort, WikiData, ExtractedData } from './types.js';

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
function buildExtractionPrompt(resort: Resort, wikiData: WikiData): string {
  return `You are a ski resort marketing expert and data extraction specialist.

Given the following Wikipedia data for "${resort.name}" in ${resort.state_name}, ${resort.country_name}:

INFOBOX DATA:
${JSON.stringify(wikiData.infobox, null, 2)}

ARTICLE EXTRACT:
${wikiData.fullExtract || wikiData.extract}

CATEGORIES:
${wikiData.categories.join(', ')}

${wikiData.coordinates ? `COORDINATES: ${wikiData.coordinates.lat}, ${wikiData.coordinates.lng}` : ''}

Your task is to:
1. Extract factual data from the Wikipedia information
2. Create compelling marketing content based on what makes this resort unique

Return a JSON object with the following structure.
Use null for any field where data is not available or uncertain.
Include a confidence score (0.0-1.0) for each extracted value.

{
  "content": {
    "tagline": {
      "value": "A catchy 5-10 word phrase that captures what makes this resort special. Make it memorable and unique to this specific resort. Examples: 'Legendary Back Bowls, World-Class Village' or 'Where Steep Meets Deep' or 'The Legend Lives On at 13,000 Feet'. Avoid generic phrases.",
      "confidence": 0.9
    },
    "description": {
      "value": "A detailed 2-3 paragraph (300-500 word) description for the resort's detail page. Tell the resort's story - its history, what makes the terrain unique, the village atmosphere, what type of skiers it attracts, any awards or recognition. Write in an inviting, informative tone that makes readers want to visit. Include specific details like signature runs, elevation, annual snowfall when available. Do not use markdown formatting.",
      "confidence": 0.9
    }
  },
  "stats": {
    "skiableAcres": { "value": null, "confidence": 0 },
    "liftsCount": { "value": null, "confidence": 0 },
    "runsCount": { "value": null, "confidence": 0 },
    "verticalDrop": { "value": null, "confidence": 0 },
    "baseElevation": { "value": null, "confidence": 0 },
    "summitElevation": { "value": null, "confidence": 0 },
    "avgAnnualSnowfall": { "value": null, "confidence": 0 }
  },
  "terrain": {
    "beginner": { "value": null, "confidence": 0 },
    "intermediate": { "value": null, "confidence": 0 },
    "advanced": { "value": null, "confidence": 0 },
    "expert": { "value": null, "confidence": 0 }
  },
  "features": {
    "hasPark": { "value": null, "confidence": 0 },
    "hasHalfpipe": { "value": null, "confidence": 0 },
    "hasNightSkiing": { "value": null, "confidence": 0 },
    "hasBackcountryAccess": { "value": null, "confidence": 0 }
  },
  "general": {
    "websiteUrl": { "value": null, "confidence": 0 },
    "nearestCity": { "value": null, "confidence": 0 }
  },
  "coordinates": {
    "lat": { "value": null, "confidence": 0 },
    "lng": { "value": null, "confidence": 0 }
  }
}

Important guidelines:
- For stats, convert all values to standard units: acres for area, feet for elevation/vertical, inches for snowfall
- For terrain percentages, ensure they add up to approximately 100%
- For tagline: Be creative but authentic. Reference specific features (elevation, snowfall, terrain type, history)
- For description: Write as if you're a passionate local sharing insider knowledge. Avoid hyperbole but convey genuine enthusiasm
- Confidence should reflect how certain you are about the extracted value (0.0 = no data, 1.0 = explicit in source)
- Return ONLY valid JSON, no additional text or markdown`;
}

/**
 * Extract data from wiki data using OpenAI
 */
export async function extractDataWithLLM(
  resort: Resort,
  wikiData: WikiData
): Promise<{
  data: ExtractedData;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}> {
  const client = getOpenAIClient();
  const prompt = buildExtractionPrompt(resort, wikiData);

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

  const usage = {
    promptTokens: response.usage?.prompt_tokens ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    totalTokens: response.usage?.total_tokens ?? 0,
  };

  try {
    const data = JSON.parse(content) as ExtractedData;
    return { data, usage };
  } catch (error) {
    console.error('Failed to parse LLM response:', content);
    throw new Error(`Failed to parse LLM response as JSON: ${error}`);
  }
}

/**
 * Sleep for a specified duration (rate limiting)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
