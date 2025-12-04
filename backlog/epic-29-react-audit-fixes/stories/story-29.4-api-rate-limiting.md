# Story 29.4: Implement Rate Limiting on API Routes

## Priority: High

## Context

The engagement API has no rate limiting beyond batch size limits, making it vulnerable to abuse. An attacker could flood the database with fake engagement events or perform denial-of-service attacks.

## Current State

**Location:** `apps/v1/app/api/engagement/route.ts`

Only protection is batch size limit:
```typescript
if (body.events.length > 100) {
  return NextResponse.json(
    { error: 'Maximum 100 events per request' },
    { status: 400 }
  );
}
```

## Requirements

1. Implement per-IP rate limiting
2. Use Redis-based rate limiter for distributed deployments
3. Apply to all public API routes
4. Return proper 429 status with retry information
5. Allow configuration via environment variables

## Implementation

### Option A: Upstash Redis (Recommended for Vercel)

#### Step 1: Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

#### Step 2: Create Rate Limiter Utility

Create `apps/v1/lib/api/rate-limit.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Create Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
const redis = Redis.fromEnv();

// Rate limiter: 100 requests per minute per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ski-directory',
});

export async function checkRateLimit(request: NextRequest): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  return { success, limit, remaining, reset };
}

export function rateLimitResponse(reset: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
```

#### Step 3: Apply to API Routes

```typescript
import { checkRateLimit, rateLimitResponse } from '@/lib/api/rate-limit';

export async function POST(request: NextRequest) {
  // Check rate limit first
  const { success, reset } = await checkRateLimit(request);
  if (!success) {
    return rateLimitResponse(reset);
  }

  // Continue with normal processing
  // ...
}
```

### Option B: In-Memory Rate Limiting (Simple, Non-Distributed)

For simpler deployments without Redis:

```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
```

### Environment Variables

Add to `.env.local`:
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## Acceptance Criteria

- [ ] Rate limiter installed and configured
- [ ] Engagement API protected with rate limiting
- [ ] Conditions API protected with rate limiting
- [ ] 429 response includes `Retry-After` header
- [ ] Rate limit headers included in responses
- [ ] Limits configurable via environment
- [ ] Works correctly in distributed deployment

## Testing

1. Send requests within limit - should succeed
2. Send 101 requests rapidly - 101st should return 429
3. Wait for window to reset - should allow requests again
4. Verify `Retry-After` header is present
5. Test with multiple IPs (different clients)

## Environment Setup

For Vercel + Upstash:
1. Create Upstash account at upstash.com
2. Create Redis database
3. Add environment variables to Vercel project
4. Deploy and test

## Effort: Medium (2-4 hours)
