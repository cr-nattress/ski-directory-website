/**
 * @module AdminResortByIdRoute
 * @purpose GET/PUT/PATCH/DELETE /api/admin/resorts/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminResortService, type UpdateResortInput } from '@/lib/api/admin-resort-service';
import { validateAdminAuth, apiResponse, errorResponse } from '@/lib/middleware/admin-auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/resorts/[id]
 * Get a resort by ID (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    validateAdminAuth(request);

    const { id } = await params;
    const result = await adminResortService.getResortById(id);

    if (result.error) {
      return apiResponse(
        {
          error: {
            code: 'NOT_FOUND',
            message: result.error,
          },
        },
        404
      );
    }

    return apiResponse(result.data);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/admin/resorts/[id]
 * Full update of a resort (admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    validateAdminAuth(request);

    const { id } = await params;
    const body = await request.json();

    const input: UpdateResortInput = {
      slug: body.slug,
      name: body.name,
      countryCode: body.countryCode,
      stateSlug: body.stateSlug,
      status: body.status,
      latitude: body.latitude,
      longitude: body.longitude,
      nearestCity: body.nearestCity,
      websiteUrl: body.websiteUrl,
      description: body.description,
      stats: body.stats,
      terrain: body.terrain,
      features: body.features,
      passAffiliations: body.passAffiliations,
      tags: body.tags,
    };

    const result = await adminResortService.updateResort(id, input);

    if (result.error) {
      const status = result.error.includes('not found') ? 404 : 400;
      return apiResponse(
        {
          error: {
            code: status === 404 ? 'NOT_FOUND' : 'UPDATE_FAILED',
            message: result.error,
          },
        },
        status
      );
    }

    return apiResponse(result.data);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/admin/resorts/[id]
 * Partial update of a resort (admin only)
 */
export async function PATCH(request: NextRequest, context: RouteParams) {
  // PATCH uses the same logic as PUT for partial updates
  return PUT(request, context);
}

/**
 * DELETE /api/admin/resorts/[id]
 * Soft-delete a resort (admin only)
 * Use ?hard=true for permanent deletion
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    validateAdminAuth(request);

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    const result = await adminResortService.deleteResort(id, hard);

    if (result.error) {
      return apiResponse(
        {
          error: {
            code: 'DELETE_FAILED',
            message: result.error,
          },
        },
        404
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
