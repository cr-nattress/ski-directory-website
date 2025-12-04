# Story 29.10: Fix Environment Variable Type Handling

## Priority: Medium

## Context

Environment variables use non-null assertions (`!`) which tell TypeScript the value exists before the runtime check. This is a minor type safety issue.

## Current State

**Locations:**
- `apps/v1/lib/supabase.ts:22-23`
- `apps/v1/app/api/engagement/route.ts:16-17`

**Current Code:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
```

## Requirements

1. Remove non-null assertions
2. Perform runtime check before using values
3. TypeScript should understand values are defined after check
4. Create `.env.example` file documenting required variables

## Implementation

### Fix lib/supabase.ts

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// TypeScript now knows these are defined
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Fix app/api/engagement/route.ts

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing required environment variables for engagement API'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

### Create .env.example

Create `apps/v1/.env.example`:

```bash
# Supabase Configuration
# Required for all environments
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for server-side operations (API routes)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://skidirectory.org

# Optional: Rate Limiting (Upstash Redis)
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=xxx

# Optional: Observability (Grafana Cloud)
# GRAFANA_LOKI_URL=https://xxx.grafana.net
# GRAFANA_LOKI_USER=xxx
# GRAFANA_LOKI_TOKEN=xxx
```

### Consider Environment Validation Utility

Create `apps/v1/lib/config/env.ts`:

```typescript
/**
 * Validated environment variables
 * Throws at module load if required vars are missing
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  return process.env[name];
}

export const env = {
  // Supabase
  supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceKey: optionalEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // App
  baseUrl: optionalEnv('NEXT_PUBLIC_BASE_URL') ?? 'https://skidirectory.org',

  // Flags
  isProduction: process.env.NODE_ENV === 'production',
} as const;
```

Then use throughout:
```typescript
import { env } from '@/lib/config/env';

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
```

## Acceptance Criteria

- [ ] No non-null assertions on env variables
- [ ] Runtime checks before usage
- [ ] TypeScript understands values are defined
- [ ] `.env.example` file created
- [ ] Error messages specify which variable is missing

## Testing

1. Remove an env variable and verify clear error
2. Verify application starts with all vars present
3. Check TypeScript compilation passes

## Effort: Small (< 2 hours)
