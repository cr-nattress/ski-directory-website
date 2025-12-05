# Story 34.2: Set Up Node.js/TypeScript Project

## Priority: High

## Phase: Setup

## Context

Create the foundational project structure for the ski shop enricher application with TypeScript, proper configuration, and dependencies.

## Requirements

1. Initialize Node.js project with TypeScript
2. Configure ESLint and Prettier
3. Set up environment variable handling
4. Create project folder structure
5. Add required dependencies

## Implementation

### Project Structure

```
apps/updaters/ski-shop-enricher/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── config.ts                # Configuration
│   ├── types.ts                 # TypeScript interfaces
│   │
│   ├── services/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── openai.ts            # OpenAI client
│   │   └── geocoding.ts         # Distance calculations
│   │
│   ├── enricher/
│   │   ├── ski-shop-enricher.ts # Main enrichment logic
│   │   ├── response-parser.ts   # Parse OpenAI responses
│   │   └── deduplicator.ts      # Prevent duplicates
│   │
│   └── utils/
│       ├── logger.ts            # Logging
│       ├── rate-limiter.ts      # API rate limiting
│       └── slug.ts              # URL slug generation
│
├── package.json
├── tsconfig.json
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── README.md
```

### package.json

```json
{
  "name": "ski-shop-enricher",
  "version": "1.0.0",
  "description": "OpenAI-powered ski shop discovery for ski resorts",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "lint": "eslint src/**/*.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "openai": "^4.24.0",
    "dotenv": "^16.3.1",
    "slugify": "^1.6.6",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.2",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### .env.example

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Enrichment Settings
SEARCH_RADIUS_MILES=20
MAX_SHOPS_PER_RESORT=10
BATCH_SIZE=5
DELAY_BETWEEN_REQUESTS_MS=2000
OPENAI_MODEL=gpt-4-turbo-preview

# Logging
LOG_LEVEL=info
```

### src/config.ts

```typescript
import dotenv from 'dotenv';

dotenv.config();

export interface EnrichmentConfig {
  searchRadiusMiles: number;
  maxShopsPerResort: number;
  batchSize: number;
  delayBetweenRequests: number;
  openaiModel: string;
}

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  enrichment: {
    searchRadiusMiles: parseInt(process.env.SEARCH_RADIUS_MILES || '20'),
    maxShopsPerResort: parseInt(process.env.MAX_SHOPS_PER_RESORT || '10'),
    batchSize: parseInt(process.env.BATCH_SIZE || '5'),
    delayBetweenRequests: parseInt(process.env.DELAY_BETWEEN_REQUESTS_MS || '2000'),
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required config
export function validateConfig(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

### src/types.ts

```typescript
export interface Resort {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  nearest_city: string;
  state: string;
  state_name: string;
}

export interface SkiShop {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: ShopType[];
  services: ShopService[];
  source: 'openai' | 'manual' | 'google_places';
  verified: boolean;
  is_active: boolean;
}

export type ShopType = 'rental' | 'retail' | 'repair' | 'demo';

export type ShopService =
  | 'ski_rental'
  | 'snowboard_rental'
  | 'boot_fitting'
  | 'tuning'
  | 'waxing'
  | 'repairs'
  | 'lessons';

export interface ResortSkiShop {
  resort_id: string;
  ski_shop_id: string;
  distance_miles: number;
  drive_time_minutes?: number;
  is_on_mountain: boolean;
  is_preferred: boolean;
}

export interface EnrichmentResult {
  resort_id: string;
  resort_name: string;
  status: 'success' | 'partial' | 'failed' | 'no_results';
  shops_found: number;
  shops_created: number;
  shops_updated: number;
  shops_linked: number;
  error?: string;
  duration_ms: number;
}
```

## Acceptance Criteria

- [ ] Project compiles with `npm run build`
- [ ] TypeScript strict mode enabled
- [ ] ESLint passes with `npm run lint`
- [ ] Environment variables loaded correctly
- [ ] Config validation catches missing vars
- [ ] All type definitions in place

## Testing

1. Run `npm install`
2. Run `npm run typecheck`
3. Run `npm run build`
4. Verify dist folder created

## Effort: Small (1 hour)
