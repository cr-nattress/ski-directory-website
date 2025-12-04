---
title: "Resort Data Schema"
description: "JSON Schema and TypeScript definitions for resort data files"
tags:
  - schema
  - json-schema
  - typescript
  - data-model
---

# Resort Data Schema

This directory contains the schema definitions for resort data files stored in GCS.

## Files

| File | Description |
|------|-------------|
| `resort.schema.json` | JSON Schema (draft-07) for validating resort.json files |
| `resort.types.ts` | TypeScript type definitions for resort data |

## GCS Structure

Resort data is stored at:
```
gs://sda-assets-prod/resorts/{country}/{state}/{slug}/
├── resort.json    # Resort data (follows this schema)
├── resort.ts      # TypeScript source (if available)
└── .gitkeep       # Folder placeholder
```

## Example resort.json

```json
{
  "id": "resort:vail",
  "slug": "vail",
  "name": "Vail Ski Resort",
  "country": "us",
  "countryName": "United States",
  "state": "colorado",
  "stateName": "Colorado",
  "status": "active",
  "isActive": true,
  "isLost": false,
  "location": {
    "lat": 39.6403,
    "lng": -106.3742
  },
  "nearestCity": "Denver",
  "stats": {
    "skiableAcres": 5317,
    "liftsCount": 31,
    "runsCount": 195,
    "verticalDrop": 3450,
    "baseElevation": 8120,
    "summitElevation": 11570,
    "avgAnnualSnowfall": 350
  },
  "terrain": {
    "beginner": 18,
    "intermediate": 29,
    "advanced": 36,
    "expert": 17
  },
  "passAffiliations": ["epic"],
  "features": {
    "hasPark": true,
    "hasHalfpipe": true,
    "hasNightSkiing": false,
    "hasBackcountryAccess": true,
    "hasSpaVillage": true
  },
  "websiteUrl": "https://www.vail.com",
  "description": "World-renowned resort featuring legendary Back Bowls and over 5,300 acres of varied terrain.",
  "tags": ["world-class", "back-bowls", "family-friendly", "village"],
  "assetLocation": {
    "country": "us",
    "state": "colorado",
    "slug": "vail"
  },
  "lastUpdated": "2025-11-28T22:08:04.763Z"
}
```

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Format: `resort:{slug}` |
| `slug` | string | URL-friendly identifier |
| `name` | string | Official resort name |
| `country` | string | `us` or `ca` |
| `countryName` | string | Full country name |
| `state` | string | State/province slug |
| `stateName` | string | Full state/province name |
| `status` | string | `active` or `defunct` |
| `isActive` | boolean | Derived from status |
| `isLost` | boolean | Derived from status |
| `assetLocation` | object | GCS path components |
| `lastUpdated` | string | ISO 8601 timestamp |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `location` | object | `{ lat, lng }` coordinates |
| `nearestCity` | string | Reference city |
| `stats` | object | Resort measurements |
| `terrain` | object | Difficulty percentages |
| `passAffiliations` | array | `epic`, `ikon`, `indy`, etc. |
| `features` | object | Boolean amenities |
| `websiteUrl` | string | Official website |
| `description` | string | Brief description |
| `tags` | array | Searchable tags |

## Pass Affiliations

Valid values:
- `epic` - Vail Resorts Epic Pass
- `ikon` - Alterra Ikon Pass
- `indy` - Indy Pass
- `mountain-collective` - Mountain Collective
- `powder-alliance` - Powder Alliance

## Validation

### Using JSON Schema

```bash
# Install ajv-cli
npm install -g ajv-cli

# Validate a resort.json file
ajv validate -s schemas/resort.schema.json -d path/to/resort.json
```

### Using TypeScript

```typescript
import { Resort } from './schemas/resort.types';

const resort: Resort = {
  id: 'resort:my-resort',
  slug: 'my-resort',
  name: 'My Resort',
  // ... required fields
};
```

## Creating New Resorts

1. Create the folder in GCS:
   ```
   gs://sda-assets-prod/resorts/{country}/{state}/{slug}/
   ```

2. Create `resort.json` following this schema

3. Optionally add `resort.ts` for TypeScript source

4. Update the region JSON file to include the new resort

## Public URLs

All resort data is publicly accessible:

```
https://storage.googleapis.com/sda-assets-prod/resorts/{country}/{state}/{slug}/resort.json
```

Example:
```
https://storage.googleapis.com/sda-assets-prod/resorts/us/colorado/vail/resort.json
```
