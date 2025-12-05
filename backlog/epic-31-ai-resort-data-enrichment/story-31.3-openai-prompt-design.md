# Story 31.3: Design OpenAI Prompt for Resort Data Extraction

## Description

Design a comprehensive prompt for GPT-4o that extracts structured data from aggregated resort information and generates high-quality taglines and descriptions.

## Acceptance Criteria

- [ ] Prompt extracts all required fields with confidence scores
- [ ] Generated taglines are concise (< 100 chars) and compelling
- [ ] Generated descriptions are informative (2-3 paragraphs)
- [ ] Terrain percentages sum to 100% (or close to it)
- [ ] Numeric values are in correct units (feet, inches, etc.)
- [ ] Output is valid JSON matching defined schema

## Technical Details

### System Prompt

```typescript
const SYSTEM_PROMPT = `You are a ski resort data analyst. Your job is to analyze information about ski resorts and extract structured data.

You will receive aggregated data about a ski resort from multiple sources:
1. Wikipedia content (article text and structured data)
2. Liftie.info data (lift status, weather, webcams)

Your task is to:
1. Generate a compelling tagline (under 100 characters)
2. Write an engaging 2-3 paragraph description
3. Extract key statistics with confidence scores

IMPORTANT RULES:
- Only extract data you find evidence for in the provided content
- Assign confidence scores (0.0-1.0) based on source reliability
- For terrain percentages, ensure they sum to approximately 100%
- All elevations should be in feet
- Snowfall should be in inches per year
- If data is not found or uncertain, set confidence to 0.0
- Never make up statistics - only extract what you can verify

OUTPUT FORMAT:
Return valid JSON matching the schema provided.`;
```

### User Prompt Template

```typescript
const USER_PROMPT = (data: AggregatedResortData) => `
Analyze this ski resort data and extract structured information:

RESORT: ${data.slug}

${data.wikipedia ? `
=== WIKIPEDIA CONTENT ===
${data.wikipedia.content}

=== WIKIPEDIA RAW DATA ===
${JSON.stringify(data.wikipedia.rawData, null, 2)}
` : 'No Wikipedia data available.'}

${data.liftie ? `
=== LIFTIE DATA ===
Summary: ${JSON.stringify(data.liftie.summary, null, 2)}
Lifts: ${JSON.stringify(data.liftie.lifts, null, 2)}
Weather: ${JSON.stringify(data.liftie.weather, null, 2)}
` : 'No Liftie data available.'}

=== INSTRUCTIONS ===
Extract the following information and return as JSON:

1. tagline: A compelling one-line description (under 100 chars)
2. description: 2-3 paragraph engaging description
3. terrain: Percentage breakdown (beginner, intermediate, advanced, expert)
4. stats: Key mountain statistics
5. For each extracted value, include a confidence score (0.0-1.0)

Return your response as valid JSON matching this structure:
{
  "tagline": { "value": "string", "confidence": 0.0-1.0 },
  "description": { "value": "string", "confidence": 0.0-1.0 },
  "terrain": {
    "beginner": { "value": number, "confidence": 0.0-1.0 },
    "intermediate": { "value": number, "confidence": 0.0-1.0 },
    "advanced": { "value": number, "confidence": 0.0-1.0 },
    "expert": { "value": number, "confidence": 0.0-1.0 }
  },
  "stats": {
    "liftsCount": { "value": number, "confidence": 0.0-1.0 },
    "verticalDrop": { "value": number, "confidence": 0.0-1.0 },
    "summitElevation": { "value": number, "confidence": 0.0-1.0 },
    "baseElevation": { "value": number, "confidence": 0.0-1.0 },
    "skiableAcres": { "value": number, "confidence": 0.0-1.0 },
    "avgAnnualSnowfall": { "value": number, "confidence": 0.0-1.0 },
    "runsCount": { "value": number, "confidence": 0.0-1.0 }
  },
  "sources": ["list of sources used"],
  "notes": "any relevant notes about data quality"
}
`;
```

### Example Output

```json
{
  "tagline": {
    "value": "Colorado's premier powder destination with legendary back bowls",
    "confidence": 0.95
  },
  "description": {
    "value": "Vail Mountain stands as one of North America's most iconic ski destinations, offering an unparalleled combination of terrain variety, reliable snowfall, and world-class amenities. With over 5,300 skiable acres spread across three distinct areas—the Front Side, Back Bowls, and Blue Sky Basin—Vail caters to every skill level.\n\nThe resort's legendary Back Bowls provide endless powder stashes after storms, while the meticulously groomed runs on the Front Side welcome beginners and intermediates. Blue Sky Basin offers a more secluded, adventure-focused experience with its gladed terrain and natural features.\n\nLocated just 100 miles west of Denver along I-70, Vail combines easy accessibility with a charming European-inspired village atmosphere.",
    "confidence": 0.92
  },
  "terrain": {
    "beginner": { "value": 18, "confidence": 0.9 },
    "intermediate": { "value": 29, "confidence": 0.9 },
    "advanced": { "value": 53, "confidence": 0.9 },
    "expert": { "value": 0, "confidence": 0.7 }
  },
  "stats": {
    "liftsCount": { "value": 31, "confidence": 0.95 },
    "verticalDrop": { "value": 3450, "confidence": 0.95 },
    "summitElevation": { "value": 11570, "confidence": 0.95 },
    "baseElevation": { "value": 8120, "confidence": 0.95 },
    "skiableAcres": { "value": 5317, "confidence": 0.95 },
    "avgAnnualSnowfall": { "value": 354, "confidence": 0.85 },
    "runsCount": { "value": 195, "confidence": 0.9 }
  },
  "sources": ["Wikipedia infobox", "Wikipedia article body", "Liftie lift count"],
  "notes": "Expert terrain included in advanced percentage as Wikipedia does not separate them"
}
```

## Tasks

- [ ] Write system prompt with clear instructions
- [ ] Write user prompt template with data injection
- [ ] Define expected JSON output schema
- [ ] Test prompt with 3-5 sample resorts
- [ ] Iterate on prompt based on output quality
- [ ] Document prompt design decisions

## Effort

**Size:** L (Large - 4-8 hours) - Prompt engineering requires iteration

## Dependencies

- Story 31.2: Need aggregated data structure for prompt template

## References

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Existing Wikidata Enricher Prompts](../../apps/updaters/wikidata-enricher/src/openai.ts)
