# Security Recommendations

Based on analysis of SECURITY_GUIDELINES.md against the current codebase.

## Executive Summary

| Category | Status | Score |
|----------|--------|-------|
| HTTP Security Headers | Good | 8/10 |
| Input Validation | Excellent | 10/10 |
| API Security | Good | 8/10 |
| Client-Side Security | Excellent | 10/10 |
| Database Security | Excellent | 10/10 |
| Dependency Security | Needs Work | 5/10 |
| CI/CD Security | Needs Work | 4/10 |
| **Overall** | **Good** | **7.8/10** |

---

## High Priority Recommendations

### 1. Add HSTS Header (Missing)

**Risk**: Man-in-the-Middle attacks, protocol downgrade attacks

**Current State**: HSTS header is not configured in `next.config.js`

**Required Action**: Add to `apps/v1/next.config.js`:

```javascript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
}
```

**Location**: `apps/v1/next.config.js` line ~15 (in headers array)

---

### 2. Install Security ESLint Plugin

**Risk**: Unsafe code patterns not caught during development

**Current State**: Only `next/core-web-vitals` configured

**Required Actions**:

```bash
cd apps/v1
npm install -D eslint-plugin-security
```

Update `.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals"],
  "plugins": ["security"],
  "rules": {
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "warn",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-non-literal-require": "warn",
    "security/detect-object-injection": "warn",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-pseudoRandomBytes": "error"
  }
}
```

---

### 3. Add Security Scanning to CI Pipeline

**Risk**: Vulnerable dependencies and leaked secrets not detected

**Current State**: No security scanning in `.github/workflows/ci.yml`

**Required Action**: Create `.github/workflows/security.yml`:

```yaml
name: Security

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6 AM

jobs:
  secrets:
    name: Secret Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified

  dependencies:
    name: Dependency Scanning
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/v1
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: NPM Audit
        run: npm audit --audit-level=high

      - name: OSV Scanner
        uses: google/osv-scanner-action@v1
        with:
          scan-args: |-
            --lockfile=apps/v1/package-lock.json

  sast:
    name: Static Analysis
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/v1
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Security Linting
        run: npm run lint
```

---

## Medium Priority Recommendations

### 4. Improve CSP Configuration

**Current State**: CSP allows `'unsafe-inline'` and `'unsafe-eval'` for scripts

**Issue**: This significantly reduces CSP effectiveness against XSS

**Options**:

#### Option A: Nonce-based CSP (Recommended for dynamic sites)

Create `apps/v1/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.tile.openstreetmap.org https://images.unsplash.com https://storage.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://liftie.info wss://*.supabase.co;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\n/g, '');

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

#### Option B: Hash-based CSP (Recommended for static sites)

Add to `next.config.js`:
```javascript
experimental: {
  sri: {
    algorithm: 'sha256',
  },
},
```

**Note**: Document the current decision to use `'unsafe-inline'` with justification.

---

### 5. Add Rate Limit Scalability Warning

**Current State**: In-memory rate limiting works only for single instance

**Location**: `apps/v1/lib/middleware/rate-limit.ts`

**Action**: Add comment and future recommendation:

```typescript
/**
 * Rate Limiting Middleware
 *
 * IMPORTANT: This implementation uses in-memory storage and is suitable
 * for single-instance deployments only. For horizontal scaling (multiple
 * server instances), migrate to Redis-based rate limiting:
 *
 * Recommended: @upstash/ratelimit with Upstash Redis
 *
 * @see https://upstash.com/docs/oss/sdks/ts/ratelimit/overview
 */
```

---

### 6. Add Input Validation to All Dynamic Routes

**Current State**: `/[country]/[state]/[slug]` route params not validated with Zod

**Location**: `apps/v1/app/[country]/[state]/[slug]/page.tsx`

**Recommended**: Add Zod validation for URL parameters:

```typescript
import { z } from 'zod';

const routeParamsSchema = z.object({
  country: z.enum(['us', 'ca']),
  state: z.string().regex(/^[a-z-]+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export default async function ResortPage({ params }: Props) {
  const result = routeParamsSchema.safeParse(params);
  if (!result.success) {
    notFound();
  }
  // ... rest of component
}
```

---

## Low Priority Recommendations

### 7. Prepare for Server Actions (Future)

When Server Actions are added, ensure:

```javascript
// next.config.js
module.exports = {
  serverActions: {
    allowedOrigins: [
      'skiresortdirectory.com',
      'www.skiresortdirectory.com',
    ],
    bodySizeLimit: '1mb',
  },
};
```

---

### 8. Add server-only Imports to Data Layer

**Locations**: `apps/v1/lib/api/supabase-resort-service.ts`

```typescript
import 'server-only';

// Ensures this file cannot be imported from Client Components
```

---

### 9. Document Security Architecture

Create `docs/security.md`:
- Document authentication approach (currently: none, public app)
- Document rate limiting strategy
- Document CSP decisions
- Document data access patterns

---

## Verification Checklist

Use this checklist after implementing recommendations:

### Phase 1: Configuration
- [ ] HSTS header added to next.config.js
- [ ] Verify all security headers present (use securityheaders.com)
- [ ] CSP decision documented (nonce, hash, or justified unsafe-inline)

### Phase 2: Code Quality
- [ ] eslint-plugin-security installed and configured
- [ ] `npm run lint` passes with security rules
- [ ] server-only imports added to data layer files

### Phase 3: CI/CD
- [ ] security.yml workflow created
- [ ] TruffleHog secret scanning active
- [ ] npm audit / OSV-Scanner running on PRs

### Phase 4: Validation
- [ ] Zod validation on all API routes
- [ ] Zod validation on dynamic route params
- [ ] Rate limiting documented for scaling

---

## Current Strengths (Already Implemented)

| Feature | Implementation | File |
|---------|---------------|------|
| Zod API Validation | Excellent | `api/engagement/route.ts` |
| Parameterized Queries | All queries | `supabase-resort-service.ts` |
| Rate Limiting | In-memory | `lib/middleware/rate-limit.ts` |
| Safe localStorage | Validated with Zod | `hooks/useMapPins.ts` |
| JSON-LD Safety | Escaped output | `ResortStructuredData.tsx` |
| Environment Safety | Type-safe access | `lib/config/env.ts` |
| Service Key Protection | Server-only | `lib/supabase.ts` |

---

## Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 1 | Add HSTS header | 5 min | High |
| 2 | Install eslint-plugin-security | 15 min | High |
| 3 | Create security.yml workflow | 30 min | High |
| 4 | Add server-only imports | 10 min | Medium |
| 5 | Validate route params with Zod | 20 min | Medium |
| 6 | Document CSP decision | 15 min | Low |
| 7 | Add rate limit scaling docs | 5 min | Low |

**Total estimated effort**: ~2 hours for all recommendations
