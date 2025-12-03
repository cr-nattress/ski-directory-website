'use client';

import { useResortConditions } from '@/lib/hooks/useResortConditions';
import { LiveConditions } from './LiveConditions';
import { LiftStatusList } from './LiftStatusList';
import { WebcamGallery } from './WebcamGallery';
import { featureFlags } from '@/lib/config/feature-flags';
import type { LiftStatus } from '@/lib/types/liftie';

interface ConditionsSectionProps {
  slug: string;
}

/**
 * Client component that fetches and displays resort conditions
 * Renders LiveConditions, LiftStatusList, and WebcamGallery based on feature flags
 */
export function ConditionsSection({ slug }: ConditionsSectionProps) {
  const { conditions, loading, error } = useResortConditions(slug);

  // Don't render anything while loading or if there's an error
  if (loading) {
    return (
      <div className="space-y-6">
        {featureFlags.liveConditions && (
          <div className="bg-white rounded-lg border border-neutral-200 p-4 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-neutral-200 rounded mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>
        )}
      </div>
    );
  }

  if (error || !conditions) {
    return null;
  }

  // Parse lifts_status JSONB if it exists
  const liftsStatus = conditions.lifts_status as Record<string, LiftStatus> | null;

  // Parse webcams JSONB if it exists
  const webcams = (conditions.webcams as Array<{ name: string; source: string; image: string }>) || [];

  return (
    <div className="space-y-6">
      {/* Live Conditions Card */}
      {featureFlags.liveConditions && (
        <LiveConditions conditions={conditions} />
      )}

      {/* Lift Status List */}
      {featureFlags.liftStatusList && liftsStatus && Object.keys(liftsStatus).length > 0 && (
        <LiftStatusList liftsStatus={liftsStatus} />
      )}

      {/* Webcam Gallery */}
      {featureFlags.webcamGallery && webcams.length > 0 && (
        <WebcamGallery webcams={webcams} />
      )}
    </div>
  );
}
