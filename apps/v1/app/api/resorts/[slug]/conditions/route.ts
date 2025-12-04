/**
 * @module ConditionsAPI
 * @purpose API endpoint for fetching real-time resort conditions
 * @context GET /api/resorts/[slug]/conditions
 *
 * @sideeffects
 * - Database queries to resorts and resort_conditions tables
 * - Response caching (5 min fresh, 15 min stale-while-revalidate)
 *
 * @decision
 * PGRST116 (no rows) is treated as "no conditions available" (returns null),
 * not as an error. This allows UI to gracefully hide conditions section.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resortSlugSchema } from '@/lib/validation/api-schemas';
import { checkRateLimit, RATE_LIMITS } from '@/lib/middleware/rate-limit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Fetch resort conditions by slug
 *
 * @returns {conditions: ResortConditionsRow | null} with cache headers
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.conditions);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { slug } = await params;

    // Validate slug parameter with Zod
    const slugResult = resortSlugSchema.safeParse(slug);
    if (!slugResult.success) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // First get the resort ID from the slug
    const { data: resort, error: resortError } = await supabase
      .from('resorts')
      .select('id')
      .eq('slug', slugResult.data)
      .single();

    if (resortError || !resort) {
      return NextResponse.json(
        { error: 'Resort not found' },
        { status: 404 }
      );
    }

    // Then get the conditions
    const { data: conditions, error: conditionsError } = await supabase
      .from('resort_conditions')
      .select('*')
      .eq('resort_id', resort.id)
      .single();

    if (conditionsError && conditionsError.code !== 'PGRST116') {
      console.error('Error fetching conditions:', conditionsError);
      return NextResponse.json(
        { error: 'Failed to fetch conditions' },
        { status: 500 }
      );
    }

    // Return conditions or null if not found
    return NextResponse.json(
      { conditions: conditions || null },
      {
        headers: {
          // Cache for 5 minutes, stale-while-revalidate for 15 minutes
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      }
    );
  } catch (error) {
    console.error('Error in conditions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
