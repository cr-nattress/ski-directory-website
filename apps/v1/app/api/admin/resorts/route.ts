/**
 * @module AdminResortsRoute
 * @purpose POST /api/admin/resorts - Create new resort
 */

import { NextRequest } from 'next/server';
import { adminResortService, type CreateResortInput } from '@/lib/api/admin-resort-service';
import { validateAdminAuth, apiResponse, errorResponse } from '@/lib/middleware/admin-auth';

/**
 * POST /api/admin/resorts
 * Create a new resort (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    validateAdminAuth(request);

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.slug || !body.name || !body.countryCode || !body.stateSlug) {
      return apiResponse(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: slug, name, countryCode, stateSlug',
          },
        },
        400
      );
    }

    const input: CreateResortInput = {
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

    const result = await adminResortService.createResort(input);

    if (result.error) {
      return apiResponse(
        {
          error: {
            code: 'CREATE_FAILED',
            message: result.error,
          },
        },
        400
      );
    }

    return apiResponse(result.data, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
