/**
 * Rate Limit Middleware Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, RATE_LIMITS } from '../rate-limit';

// Create a mock request with configurable headers
function createMockRequest(headers: Record<string, string> = {}): Request {
  return {
    headers: new Headers(headers),
  } as Request;
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset any internal state between tests by waiting
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows first request', () => {
    const request = createMockRequest({ 'x-forwarded-for': '192.168.1.1' });
    const result = checkRateLimit(request, { windowSeconds: 60, maxRequests: 10 });
    expect(result).toBeNull();
  });

  it('allows requests under the limit', () => {
    const ip = `test-ip-${Date.now()}`;
    const request = createMockRequest({ 'x-forwarded-for': ip });
    const config = { windowSeconds: 60, maxRequests: 5 };

    // Make 5 requests (at the limit)
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(request, config);
      expect(result).toBeNull();
    }
  });

  it('blocks requests over the limit', () => {
    const ip = `limit-test-${Date.now()}`;
    const request = createMockRequest({ 'x-forwarded-for': ip });
    const config = { windowSeconds: 60, maxRequests: 3 };

    // Make 3 requests (at the limit)
    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit(request, config);
      expect(result).toBeNull();
    }

    // 4th request should be blocked
    const blockedResult = checkRateLimit(request, config);
    expect(blockedResult).not.toBeNull();
    expect(blockedResult?.status).toBe(429);
  });

  it('returns 429 response with proper headers when rate limited', async () => {
    const ip = `header-test-${Date.now()}`;
    const request = createMockRequest({ 'x-forwarded-for': ip });
    const config = { windowSeconds: 60, maxRequests: 1 };

    // First request passes
    checkRateLimit(request, config);

    // Second request is blocked
    const blockedResult = checkRateLimit(request, config);
    expect(blockedResult).not.toBeNull();

    // Check response headers
    const headers = blockedResult!.headers;
    expect(headers.get('Retry-After')).toBeDefined();
    expect(headers.get('X-RateLimit-Limit')).toBe('1');
    expect(headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(headers.get('X-RateLimit-Reset')).toBeDefined();

    // Check response body
    const body = await blockedResult!.json();
    expect(body.error).toBe('Too many requests');
  });

  it('uses different limits for different clients', () => {
    const request1 = createMockRequest({ 'x-forwarded-for': `client1-${Date.now()}` });
    const request2 = createMockRequest({ 'x-forwarded-for': `client2-${Date.now()}` });
    const config = { windowSeconds: 60, maxRequests: 2 };

    // Client 1 makes 2 requests
    checkRateLimit(request1, config);
    checkRateLimit(request1, config);
    const client1Blocked = checkRateLimit(request1, config);
    expect(client1Blocked).not.toBeNull();

    // Client 2 should still be allowed
    const client2Result = checkRateLimit(request2, config);
    expect(client2Result).toBeNull();
  });
});

describe('RATE_LIMITS', () => {
  it('has expected configuration for engagement endpoint', () => {
    expect(RATE_LIMITS.engagement).toEqual({
      windowSeconds: 60,
      maxRequests: 100,
    });
  });

  it('has expected configuration for conditions endpoint', () => {
    expect(RATE_LIMITS.conditions).toEqual({
      windowSeconds: 60,
      maxRequests: 60,
    });
  });

  it('has expected default configuration', () => {
    expect(RATE_LIMITS.default).toEqual({
      windowSeconds: 60,
      maxRequests: 30,
    });
  });
});
