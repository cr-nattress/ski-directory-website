import { NextRequest, NextResponse } from 'next/server';
import { resortService } from '@/lib/api/resort-service';
import { getNearbyResorts, getResortsInState } from '@/lib/utils/related-resorts';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Fetch the current resort
    const currentResortResponse = await resortService.getResortBySlug(slug);

    if (!currentResortResponse.data) {
      return NextResponse.json({ error: 'Resort not found' }, { status: 404 });
    }

    const currentResort = currentResortResponse.data;

    // Fetch all resorts for comparison
    const response = await resortService.getAllResorts();
    const allResorts = response.data.filter((r) => r.isActive);

    // Get nearby resorts (within 100 miles)
    const nearbyResorts = getNearbyResorts(currentResort, allResorts, 100, 3);

    // Get more resorts in the same state (excluding those already in nearby)
    const nearbyIds = new Set(nearbyResorts.map((r) => r.id));
    const stateResorts = getResortsInState(currentResort, allResorts, 6)
      .filter((r) => !nearbyIds.has(r.id))
      .slice(0, 3);

    return NextResponse.json({
      resort_slug: slug,
      nearbyResorts,
      stateResorts,
    });
  } catch (error) {
    console.error('Error fetching related resorts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
