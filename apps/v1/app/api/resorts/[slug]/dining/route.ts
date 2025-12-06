import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

interface DiningVenueResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  venue_type: string[];
  cuisine_type: string[];
  price_range: string;
  serves_breakfast: boolean;
  serves_lunch: boolean;
  serves_dinner: boolean;
  serves_drinks: boolean;
  has_full_bar: boolean;
  ambiance: string[];
  features: string[];
  is_on_mountain: boolean;
  mountain_location: string | null;
  is_ski_in_ski_out: boolean;
  hours_notes: string | null;
  distance_miles: number;
  drive_time_minutes: number | null;
  proximity_label: string;
  verified: boolean;
}

function getProximityLabel(distanceMiles: number, isOnMountain: boolean): string {
  if (isOnMountain) return 'On Mountain';
  if (distanceMiles < 0.5) return 'At Base';
  if (distanceMiles < 1) return 'Walking Distance';
  if (distanceMiles < 5) return 'Short Drive';
  if (distanceMiles < 15) return 'Nearby';
  return 'In Area';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const maxDistance = parseFloat(searchParams.get('maxDistance') || '30');
  const limit = parseInt(searchParams.get('limit') || '30');
  const offset = parseInt(searchParams.get('offset') || '0');
  const venueType = searchParams.get('venue_type');
  const cuisineType = searchParams.get('cuisine_type');
  const priceRange = searchParams.get('price_range');
  const isOnMountain = searchParams.get('is_on_mountain');
  const isSkiInSkiOut = searchParams.get('is_ski_in_ski_out');
  const sortBy = searchParams.get('sort') || 'distance';

  try {
    const supabase = createServerClient();

    // Build query
    let query = supabase
      .from('resort_dining_venues_full')
      .select('*')
      .eq('resort_slug', slug)
      .lte('distance_miles', maxDistance);

    // Apply filters
    if (venueType) {
      query = query.contains('venue_type', [venueType]);
    }
    if (cuisineType) {
      query = query.contains('cuisine_type', [cuisineType]);
    }
    if (priceRange) {
      query = query.eq('price_range', priceRange);
    }
    if (isOnMountain === 'true') {
      query = query.eq('is_on_mountain', true);
    }
    if (isSkiInSkiOut === 'true') {
      query = query.eq('is_ski_in_ski_out', true);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        query = query.order('name');
        break;
      case 'price_asc':
        query = query.order('price_range');
        break;
      case 'price_desc':
        query = query.order('price_range', { ascending: false });
        break;
      case 'distance':
      default:
        query = query.order('distance_miles');
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching dining venues:', error);
      return NextResponse.json({ error: 'Failed to fetch dining venues' }, { status: 500 });
    }

    // Transform to response format
    const venues: DiningVenueResponse[] = (data || []).map((venue: Record<string, unknown>) => ({
      id: venue.dining_venue_id as string,
      name: venue.name as string,
      slug: venue.slug as string,
      description: venue.description as string | null,
      address: venue.address_line1 as string,
      city: venue.city as string,
      state: venue.state as string,
      postal_code: venue.postal_code as string,
      latitude: venue.latitude as number,
      longitude: venue.longitude as number,
      phone: venue.phone as string | null,
      website_url: venue.website_url as string | null,
      venue_type: venue.venue_type as string[],
      cuisine_type: venue.cuisine_type as string[],
      price_range: venue.price_range as string,
      serves_breakfast: venue.serves_breakfast as boolean,
      serves_lunch: venue.serves_lunch as boolean,
      serves_dinner: venue.serves_dinner as boolean,
      serves_drinks: venue.serves_drinks as boolean,
      has_full_bar: venue.has_full_bar as boolean,
      ambiance: venue.ambiance as string[],
      features: venue.features as string[],
      is_on_mountain: venue.is_on_mountain as boolean,
      mountain_location: venue.mountain_location as string | null,
      is_ski_in_ski_out: venue.is_ski_in_ski_out as boolean,
      hours_notes: venue.hours_notes as string | null,
      distance_miles: venue.distance_miles as number,
      drive_time_minutes: venue.drive_time_minutes as number | null,
      proximity_label: getProximityLabel(
        venue.distance_miles as number,
        venue.is_on_mountain as boolean
      ),
      verified: venue.verified as boolean,
    }));

    return NextResponse.json({
      resort_slug: slug,
      count: venues.length,
      offset,
      limit,
      venues,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
