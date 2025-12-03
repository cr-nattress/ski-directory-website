/**
 * @module ResortCard
 * @purpose Display resort summary card in listings/grid views
 * @context Landing page grid, directory listings, search results
 *
 * @pattern Card component with feature-flagged optional sections
 *
 * @sideeffects
 * - Image preload via new Image() to detect 404s
 * - Logs image failures via useLogger
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Resort } from '@/lib/types';
import { getCardImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils/resort-images';
import { Star, MapPin, Snowflake, Gauge } from 'lucide-react';
import { formatDistance, formatSnowfall, formatRating } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useLogger } from '@/lib/hooks/useLogger';
import { featureFlags } from '@/lib/config/feature-flags';

/** Lift conditions data from Liftie integration */
export interface LiftConditions {
  liftsOpen: number;
  liftsTotal: number;
  liftsPercentage: number;
}

interface ResortCardProps {
  /** Resort data to display */
  resort: Resort;
  /** Optional real-time lift conditions (from Liftie) */
  liftConditions?: LiftConditions | null;
}

/**
 * Resort card component for listing views
 *
 * Displays resort image, name, location, and optional stats.
 * Feature flags control which optional sections are shown:
 * - resortCardRating: Star rating and review count
 * - resortCardSnowfall: Distance and snowfall stats
 * - resortCardTerrainOpen: Terrain open progress bar
 * - resortCardLiftStatus: Real-time lift status from Liftie
 */
export function ResortCard({ resort, liftConditions }: ResortCardProps) {
  const originalImageUrl = getCardImageUrl(resort);
  const [imageUrl, setImageUrl] = useState(originalImageUrl);
  const imageAlt = `${resort.name} ski resort`;
  const log = useLogger({ component: 'ResortCard' });
  const hasLoggedError = useRef(false);

  // Check if image exists, fallback to placeholder on error
  useEffect(() => {
    hasLoggedError.current = false;
    const img = new window.Image();
    img.onload = () => {
      // Image exists, keep URL
    };
    img.onerror = () => {
      // Only log once per resort to avoid spam
      if (!hasLoggedError.current) {
        hasLoggedError.current = true;
        log.warn('Image failed to load, using placeholder', {
          resortId: resort.id,
          resortName: resort.name,
          imageUrl: originalImageUrl,
          fallbackUsed: PLACEHOLDER_IMAGE,
        });
      }
      setImageUrl(PLACEHOLDER_IMAGE);
    };
    img.src = originalImageUrl;
  }, [originalImageUrl, resort.id, resort.name, log]);

  const getPassBadgeStyles = (pass: string) => {
    switch (pass) {
      case 'epic':
        return 'bg-epic-red text-white';
      case 'ikon':
        return 'bg-ikon-orange text-white';
      case 'indy':
        return 'bg-purple-600 text-white';
      case 'mountain-collective':
        return 'bg-emerald-600 text-white';
      case 'powder-alliance':
        return 'bg-cyan-600 text-white';
      case 'ny-ski3':
        return 'bg-blue-600 text-white';
      case 'rcr-rockies':
        return 'bg-violet-600 text-white';
      case 'lest-go':
        return 'bg-pink-600 text-white';
      case 'local':
        return 'bg-mountain-gray text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getPassLabel = (pass: string) => {
    switch (pass) {
      case 'mountain-collective':
        return 'Mtn Collective';
      case 'powder-alliance':
        return 'Powder Alliance';
      case 'ny-ski3':
        return 'NY SKI3';
      case 'rcr-rockies':
        return 'RCR Rockies';
      case 'lest-go':
        return "L'EST GO";
      default:
        return pass;
    }
  };

  // Get lift status color based on percentage
  const getLiftStatusColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLiftStatusBgColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Link
      href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
      className="card group cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          unoptimized={imageUrl.startsWith('https://')}
        />

        {/* Pass badges */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
          {resort.passAffiliations.map((pass) => (
            <span
              key={pass}
              className={cn(
                'px-2 py-1 rounded text-xs font-semibold uppercase',
                getPassBadgeStyles(pass)
              )}
            >
              {getPassLabel(pass)}
            </span>
          ))}
        </div>

        {/* Status indicator */}
        {resort.isLost ? (
          <div className="absolute top-3 left-3 bg-gray-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            Lost
          </div>
        ) : resort.conditions.status === 'open' && (
          <div className="absolute top-3 left-3 bg-success-green text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            Open
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Resort name */}
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-1 group-hover:text-ski-blue transition-colors">
          {resort.name}
        </h3>

        {/* Rating - hidden for lost ski areas and controlled by feature flag */}
        {featureFlags.resortCardRating && !resort.isLost && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">
              {formatRating(resort.rating)}
            </span>
            <span className="text-gray-500 text-sm">
              ({resort.reviewCount.toLocaleString()})
            </span>
          </div>
        )}

        {/* Location - town, state */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {resort.nearestCity}, {resort.stateCode?.toUpperCase()}
          </span>
        </div>

        {/* Stats - distance and snowfall - controlled by feature flag */}
        {featureFlags.resortCardSnowfall && (
          <div className={cn("flex items-center gap-3 text-sm text-gray-600 mt-2")}>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{formatDistance(resort.distanceFromMajorCity)}</span>
            </div>
            {!resort.isLost && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Snowflake className="w-4 h-4" />
                  <span>{formatSnowfall(resort.conditions.snowfall24h)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Terrain open - hidden for lost ski areas and controlled by feature flag */}
        {featureFlags.resortCardTerrainOpen && !resort.isLost && (
          <>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">Terrain Open</span>
              <span className="text-xs font-semibold text-gray-900">
                {resort.conditions.terrainOpen}%
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-success-green rounded-full transition-all"
                style={{ width: `${resort.conditions.terrainOpen}%` }}
              />
            </div>
          </>
        )}

        {/* Lift status - from Liftie real-time data */}
        {featureFlags.resortCardLiftStatus && !resort.isLost && liftConditions && liftConditions.liftsTotal > 0 && (
          <>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">Lifts Open</span>
              </div>
              <span className={cn(
                'text-xs font-semibold',
                getLiftStatusColor(liftConditions.liftsPercentage)
              )}>
                {liftConditions.liftsOpen}/{liftConditions.liftsTotal}
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  getLiftStatusBgColor(liftConditions.liftsPercentage)
                )}
                style={{ width: `${liftConditions.liftsPercentage}%` }}
              />
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
