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

// Use service role key for server-side inserts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Event types
 */
type EventType = 'impression' | 'click' | 'dwell';

/**
 * Context where event occurred
 */
type EventContext = 'landing' | 'directory' | 'search' | 'themed_section' | 'map';

/**
 * Single engagement event
 */
interface EngagementEvent {
  resort_id: string;
  resort_slug: string;
  event_type: EventType;
  context?: EventContext;
  section_id?: string;
  position_index?: number;
  page_number?: number;
  session_id?: string;
  dwell_seconds?: number;
}

/**
 * Request body for batch events
 */
interface EngagementRequestBody {
  events: EngagementEvent[];
}

/**
 * Validate event type
 */
function isValidEventType(type: string): type is EventType {
  return ['impression', 'click', 'dwell'].includes(type);
}

/**
 * Validate context
 */
function isValidContext(context: string): context is EventContext {
  return ['landing', 'directory', 'search', 'themed_section', 'map'].includes(context);
}

/**
 * Validate a single event
 */
function validateEvent(event: unknown): event is EngagementEvent {
  if (typeof event !== 'object' || event === null) return false;

  const e = event as Record<string, unknown>;

  // Required fields
  if (typeof e.resort_id !== 'string' || !e.resort_id) return false;
  if (typeof e.resort_slug !== 'string' || !e.resort_slug) return false;
  if (typeof e.event_type !== 'string' || !isValidEventType(e.event_type)) return false;

  // Optional fields with type validation
  if (e.context !== undefined && (typeof e.context !== 'string' || !isValidContext(e.context))) {
    return false;
  }
  if (e.section_id !== undefined && typeof e.section_id !== 'string') return false;
  if (e.position_index !== undefined && typeof e.position_index !== 'number') return false;
  if (e.page_number !== undefined && typeof e.page_number !== 'number') return false;
  if (e.session_id !== undefined && typeof e.session_id !== 'string') return false;
  if (e.dwell_seconds !== undefined && typeof e.dwell_seconds !== 'number') return false;

  return true;
}

/**
 * POST /api/engagement
 *
 * Log one or more engagement events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as EngagementRequestBody;

    // Validate request body
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Missing or invalid events array' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (body.events.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 events per request' },
        { status: 400 }
      );
    }

    // Validate each event
    const validEvents: EngagementEvent[] = [];
    const invalidIndices: number[] = [];

    for (let i = 0; i < body.events.length; i++) {
      if (validateEvent(body.events[i])) {
        validEvents.push(body.events[i]);
      } else {
        invalidIndices.push(i);
      }
    }

    // If no valid events, return error
    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: 'No valid events provided', invalidIndices },
        { status: 400 }
      );
    }

    // Insert events into database
    const { error } = await supabase
      .from('resort_impressions')
      .insert(validEvents);

    if (error) {
      console.error('Error inserting engagement events:', error);
      return NextResponse.json(
        { error: 'Failed to log events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logged: validEvents.length,
      skipped: invalidIndices.length,
    });

  } catch (error) {
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
