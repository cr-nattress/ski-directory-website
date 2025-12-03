import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First get the resort ID from the slug
    const { data: resort, error: resortError } = await supabase
      .from('resorts')
      .select('id')
      .eq('slug', slug)
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
