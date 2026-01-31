/**
 * @module AdminAuth
 * @purpose Admin authentication middleware for API routes
 * @context Validates service role key for admin operations
 */

import { NextRequest, NextResponse } from 'next/server';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  status: number;
}

/**
 * Validate admin authentication via service role key
 * @throws Error if authentication fails
 */
export function validateAdminAuth(request: NextRequest): void {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    throw new AuthError('UNAUTHORIZED', 'Missing Authorization header', 401);
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AuthError('UNAUTHORIZED', 'Invalid Authorization header format. Use: Bearer <token>', 401);
  }

  if (!SERVICE_ROLE_KEY) {
    throw new AuthError('FORBIDDEN', 'Service role key not configured', 403);
  }

  if (token !== SERVICE_ROLE_KEY) {
    throw new AuthError('FORBIDDEN', 'Invalid service role key', 403);
  }
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'AuthError';
  }

  toJSON(): ApiError {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
      status: this.status,
    };
  }
}

/**
 * Standard API response helpers
 */
export function apiResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(error.toJSON(), { status: error.status });
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
      status: 500,
    },
    { status: 500 }
  );
}
