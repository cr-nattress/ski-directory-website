# Story 29.13: Add Content Security Policy Headers

## Priority: Low

## Context

The application doesn't define Content Security Policy headers, which help prevent XSS attacks and other code injection vulnerabilities. While not critical for this application, adding CSP is a security best practice.

## Current State

**Location:** `apps/v1/next.config.js`

No security headers defined.

## Requirements

1. Define appropriate CSP directives
2. Allow required external resources
3. Test that all features still work
4. Implement via middleware or next.config.js

## Implementation

### Option A: Next.js Config Headers

Update `apps/v1/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ... existing config
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
              // Styles
              "style-src 'self' 'unsafe-inline'", // Tailwind inline styles
              // Images
              "img-src 'self' data: https://storage.googleapis.com https://*.tile.openstreetmap.org https://*.supabase.co blob:",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Connect (API calls)
              "connect-src 'self' https://*.supabase.co https://liftie.info wss://*.supabase.co",
              // Frames
              "frame-src 'none'",
              // Objects
              "object-src 'none'",
              // Base
              "base-uri 'self'",
              // Form actions
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Option B: Middleware (More Flexible)

Create `apps/v1/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CSP directives
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://storage.googleapis.com https://*.tile.openstreetmap.org https://*.supabase.co blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://liftie.info wss://*.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Required Domains

| Domain | Purpose |
|--------|---------|
| `storage.googleapis.com` | GCS resort images |
| `*.tile.openstreetmap.org` | Map tiles |
| `*.supabase.co` | Database API |
| `liftie.info` | Conditions API |
| `fonts.gstatic.com` | Google Fonts |

### Report-Only Mode for Testing

Start with report-only to catch violations without breaking:

```javascript
{
  key: 'Content-Security-Policy-Report-Only',
  value: cspString,
}
```

Monitor console for CSP violations, then switch to enforcing.

## Acceptance Criteria

- [ ] CSP header applied to all pages
- [ ] All current functionality works
- [ ] Images load correctly
- [ ] Map tiles load correctly
- [ ] API calls succeed
- [ ] No CSP errors in console
- [ ] Additional security headers added

## Testing

1. Open DevTools Network tab
2. Check response headers for CSP
3. Navigate through all major pages
4. Verify map loads
5. Verify images load
6. Check console for CSP violations
7. Run Lighthouse security audit

## Notes

- `'unsafe-inline'` and `'unsafe-eval'` needed for Next.js
- Future: Consider nonce-based CSP for stricter policy
- Webcam images from various domains may need blob: or specific domains

## Effort: Small (< 2 hours)
