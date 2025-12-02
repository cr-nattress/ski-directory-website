'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Resort } from '@/lib/types';
import { getCardImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils/resort-images';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResortRowCardProps {
  resort: Resort;
}

/**
 * Compact resort card for horizontal scrolling rows.
 * Shows: image, name, location, pass badges
 */
export function ResortRowCard({ resort }: ResortRowCardProps) {
  const originalImageUrl = getCardImageUrl(resort);
  const [imageUrl, setImageUrl] = useState(originalImageUrl);
  const imageAlt = `${resort.name} ski resort`;

  // Check if image exists, fallback to placeholder on error
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      // Image exists, keep URL
    };
    img.onerror = () => {
      // Image doesn't exist, use placeholder
      setImageUrl(PLACEHOLDER_IMAGE);
    };
    img.src = originalImageUrl;
  }, [originalImageUrl]);

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
        return 'MTN COLL';
      case 'powder-alliance':
        return 'PWD ALL';
      case 'ny-ski3':
        return 'SKI3';
      case 'rcr-rockies':
        return 'RCR';
      case 'lest-go':
        return 'LEST GO';
      default:
        return pass.toUpperCase();
    }
  };

  return (
    <Link
      href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
      className="group flex-shrink-0 w-[200px] sm:w-[220px] bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
          role="img"
          aria-label={imageAlt}
        />

        {/* Pass badges - show only first one to save space */}
        {resort.passAffiliations.length > 0 && (
          <div className="absolute top-2 right-2">
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                getPassBadgeStyles(resort.passAffiliations[0])
              )}
            >
              {getPassLabel(resort.passAffiliations[0])}
            </span>
          </div>
        )}

        {/* Lost indicator */}
        {resort.isLost && (
          <div className="absolute top-2 left-2 bg-gray-500/90 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
            Lost
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Resort name */}
        <h4 className="font-display font-semibold text-sm text-gray-900 mb-1 truncate group-hover:text-ski-blue transition-colors">
          {resort.name}
        </h4>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {resort.nearestCity}, {resort.stateCode?.toUpperCase()}
          </span>
        </div>
      </div>
    </Link>
  );
}
