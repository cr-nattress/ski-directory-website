# Story 31.5: Create JSON Schema for AI Enrichment Output

## Description

Define the JSON schema for the AI enrichment output that will be saved to GCS. This schema ensures consistency across all processed resorts and enables validation.

## Acceptance Criteria

- [ ] TypeScript interfaces defined for all data structures
- [ ] JSON schema file created for validation
- [ ] Schema includes metadata (timestamp, version, cost)
- [ ] Schema supports partial updates (some fields may be low confidence)

## Technical Details

### TypeScript Types (types.ts)

```typescript
// Confidence-scored value
export interface ScoredValue<T> {
  value: T;
  confidence: number; // 0.0 - 1.0
}

// Terrain breakdown
export interface TerrainData {
  beginner: ScoredValue<number>;
  intermediate: ScoredValue<number>;
  advanced: ScoredValue<number>;
  expert: ScoredValue<number>;
}

// Mountain statistics
export interface StatsData {
  liftsCount: ScoredValue<number>;
  verticalDrop: ScoredValue<number>;      // feet
  summitElevation: ScoredValue<number>;   // feet
  baseElevation: ScoredValue<number>;     // feet
  skiableAcres: ScoredValue<number>;
  avgAnnualSnowfall: ScoredValue<number>; // inches/year
  runsCount: ScoredValue<number>;
}

// Content fields
export interface ContentData {
  tagline: ScoredValue<string>;
  description: ScoredValue<string>;
}

// Full AI enrichment result
export interface AIEnrichmentResult {
  content: ContentData;
  terrain: TerrainData;
  stats: StatsData;
  sources: string[];
  notes: string;
}

// Metadata about the enrichment process
export interface EnrichmentMetadata {
  version: string;           // Schema version (e.g., "1.0.0")
  processedAt: string;       // ISO timestamp
  processingTimeMs: number;  // Duration of processing
  model: string;             // OpenAI model used
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;     // USD
  minConfidenceThreshold: number;
}

// Complete output file structure
export interface AIEnrichmentOutput {
  slug: string;
  assetPath: string;
  enrichment: AIEnrichmentResult;
  metadata: EnrichmentMetadata;
  inputDataQuality: {
    hasWikipedia: boolean;
    hasLiftie: boolean;
    fileCount: number;
  };
}
```

### JSON Schema (ai-enrichment.schema.json)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://skidirectory.org/schemas/ai-enrichment.json",
  "title": "AI Enrichment Output",
  "description": "Schema for AI-generated resort enrichment data",
  "type": "object",
  "required": ["slug", "assetPath", "enrichment", "metadata"],
  "properties": {
    "slug": {
      "type": "string",
      "description": "Resort slug identifier"
    },
    "assetPath": {
      "type": "string",
      "description": "GCS asset path (e.g., us/colorado/vail)"
    },
    "enrichment": {
      "type": "object",
      "required": ["content", "terrain", "stats"],
      "properties": {
        "content": {
          "type": "object",
          "properties": {
            "tagline": { "$ref": "#/definitions/scoredString" },
            "description": { "$ref": "#/definitions/scoredString" }
          }
        },
        "terrain": {
          "type": "object",
          "properties": {
            "beginner": { "$ref": "#/definitions/scoredNumber" },
            "intermediate": { "$ref": "#/definitions/scoredNumber" },
            "advanced": { "$ref": "#/definitions/scoredNumber" },
            "expert": { "$ref": "#/definitions/scoredNumber" }
          }
        },
        "stats": {
          "type": "object",
          "properties": {
            "liftsCount": { "$ref": "#/definitions/scoredNumber" },
            "verticalDrop": { "$ref": "#/definitions/scoredNumber" },
            "summitElevation": { "$ref": "#/definitions/scoredNumber" },
            "baseElevation": { "$ref": "#/definitions/scoredNumber" },
            "skiableAcres": { "$ref": "#/definitions/scoredNumber" },
            "avgAnnualSnowfall": { "$ref": "#/definitions/scoredNumber" },
            "runsCount": { "$ref": "#/definitions/scoredNumber" }
          }
        },
        "sources": {
          "type": "array",
          "items": { "type": "string" }
        },
        "notes": { "type": "string" }
      }
    },
    "metadata": {
      "type": "object",
      "required": ["version", "processedAt", "model"],
      "properties": {
        "version": { "type": "string" },
        "processedAt": { "type": "string", "format": "date-time" },
        "processingTimeMs": { "type": "number" },
        "model": { "type": "string" },
        "promptTokens": { "type": "number" },
        "completionTokens": { "type": "number" },
        "estimatedCost": { "type": "number" },
        "minConfidenceThreshold": { "type": "number" }
      }
    }
  },
  "definitions": {
    "scoredString": {
      "type": "object",
      "required": ["value", "confidence"],
      "properties": {
        "value": { "type": "string" },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },
    "scoredNumber": {
      "type": "object",
      "required": ["value", "confidence"],
      "properties": {
        "value": { "type": "number" },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    }
  }
}
```

## Tasks

- [ ] Create comprehensive TypeScript interfaces in `src/types.ts`
- [ ] Create JSON schema file
- [ ] Add validation utility function
- [ ] Document schema in README

## Effort

**Size:** S (Small - 1-2 hours)

## Dependencies

- Story 31.1: Project structure

## References

- [JSON Schema Specification](https://json-schema.org/)
