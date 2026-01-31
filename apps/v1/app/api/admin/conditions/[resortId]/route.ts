/**
 * @module AdminConditionsRoute
 * @purpose GET/POST/PUT /api/admin/conditions/[resortId]
 */

import { NextRequest } from 'next/server';
import { adminResortService } from '@/lib/api/admin-resort-service';
import { supabaseResortService } from '@/lib/api/supabase-resort-service';
import { validateAdminAuth, apiResponse, errorResponse } from '@/lib/middleware/admin-auth';

interface RouteParams {
  params: Promise<{ resortId: string }>;
}

/**
 * GET /api/admin/conditions/[resortId]
 * Get conditions for a resort (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    validateAdminAuth(request);

    const { resortId } = await params;
    const conditions = await supabaseResortService.getResortConditions(resortId);

    return apiResponse(conditions || {});
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/admin/conditions/[resortId]
 * Update or create conditions for a resort (admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    validateAdminAuth(request);

    const { resortId } = await params;
    const body = await request.json();

    const result = await adminResortService.updateConditions(resortId, {
      liftsOpen: body.liftsOpen,
      liftsTotal: body.liftsTotal,
      weatherCondition: body.weatherCondition,
      weatherHigh: body.weatherHigh,
    });

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

    // Fetch and return updated conditions
    const conditions = await supabaseResortService.getResortConditions(resortId);
    return apiResponse(conditions);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/admin/conditions/[resortId]
 * Update conditions (alias for POST)
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  return POST(request, context);
}
