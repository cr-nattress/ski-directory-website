import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

interface SkiShopResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: string[];
  services: string[];
  distance_miles: number;
  is_on_mountain: boolean;
  proximity_label: string;
  verified: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const maxDistance = parseFloat(searchParams.get('maxDistance') || '30');
  const types = searchParams.get('types')?.split(',');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const supabase = createServerClient();

    // Use the database function for efficient querying
    const { data, error } = await supabase.rpc('get_resort_ski_shops', {
      p_resort_slug: slug,
      p_max_distance: maxDistance,
      p_shop_types: types || null,
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching ski shops:', error);
      return NextResponse.json({ error: 'Failed to fetch ski shops' }, { status: 500 });
    }

    // Transform to response format
    const shops: SkiShopResponse[] = (data || []).map((shop: Record<string, unknown>) => ({
      id: shop.shop_id as string,
      name: shop.shop_name as string,
      slug: shop.shop_slug as string,
      description: shop.description as string | null,
      address: shop.full_address as string,
      city: shop.city as string,
      state: shop.state as string,
      latitude: shop.latitude as number,
      longitude: shop.longitude as number,
      phone: shop.phone as string | null,
      website_url: shop.website_url as string | null,
      shop_type: shop.shop_type as string[],
      services: shop.services as string[],
      distance_miles: shop.distance_miles as number,
      is_on_mountain: shop.is_on_mountain as boolean,
      proximity_label: shop.proximity_label as string,
      verified: shop.verified as boolean,
    }));

    return NextResponse.json({
      resort_slug: slug,
      count: shops.length,
      shops,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
