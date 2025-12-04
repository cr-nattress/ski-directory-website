/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiter for API routes.
 * Uses sliding window algorithm with configurable limits.
 *
 * Note: For production with multiple instances, consider using
 * Redis or Upstash for distributed rate limiting.
 */

import { NextResponse } from 'next/server';

interface RateLimitConfig {
  /** Time window in seconds */
  windowSeconds: number;
  /** Maximum requests per window */
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header or falls back to a default
 */
function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback to a hash of other headers for identification
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `ua:${userAgent.slice(0, 50)}`;
}

/**
 * Check if request should be rate limited
 *
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @returns null if allowed, or a 429 response if rate limited
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = { windowSeconds: 60, maxRequests: 100 }
): NextResponse | null {
  cleanupExpiredEntries();

  const clientId = getClientIdentifier(request);
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = rateLimitStore.get(clientId);

  if (!entry || now > entry.resetTime) {
    // First request in window or window expired
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return null;
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
        },
      }
    );
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(clientId, entry);

  return null;
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: Request,
  config: RateLimitConfig = { windowSeconds: 60, maxRequests: 100 }
): NextResponse {
  const clientId = getClientIdentifier(request);
  const entry = rateLimitStore.get(clientId);

  if (entry) {
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(Math.max(0, config.maxRequests - entry.count)));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));
  }

  return response;
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Engagement API: 100 requests per minute (batch events)
  engagement: { windowSeconds: 60, maxRequests: 100 },
  // Conditions API: 60 requests per minute (read-only)
  conditions: { windowSeconds: 60, maxRequests: 60 },
  // Default: 30 requests per minute
  default: { windowSeconds: 60, maxRequests: 30 },
} as const;
