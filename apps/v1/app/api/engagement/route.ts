/**
 * Engagement Tracking API
 *
 * POST /api/engagement
 *
 * Logs resort engagement events (impressions, clicks, dwell time).
 * Privacy-conscious: no PII collected.
 *
 * Epic 24, Story 12: Engagement Tracking Foundation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  engagementRequestSchema,
  type EngagementEvent,
} from '@/lib/validation/api-schemas';
import { checkRateLimit, RATE_LIMITS } from '@/lib/middleware/rate-limit';

// Use service role key for server-side inserts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);


/**
 * POST /api/engagement
 *
 * Log one or more engagement events
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.engagement);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate request body with Zod
    const parseResult = engagementRequestSchema.safeParse(body);

    if (!parseResult.success) {
      // Format Zod issues into readable error messages
      const details = parseResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      return NextResponse.json(
        {
          error: 'Validation failed',
          details,
        },
        { status: 400 }
      );
    }

    const { events } = parseResult.data;

    // Insert events into database
    const { error } = await supabase
      .from('resort_impressions')
      .insert(events as EngagementEvent[]);

    if (error) {
      console.error('Error inserting engagement events:', error);
      return NextResponse.json(
        { error: 'Failed to log events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logged: events.length,
    });
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.error('Engagement API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/engagement
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Engagement tracking API',
  });
}
