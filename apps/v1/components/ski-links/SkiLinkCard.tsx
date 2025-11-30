import { ExternalLink, Star, Check, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SkiLink,
  SKI_LINK_TYPE_LABELS,
  SKI_LINK_REGION_LABELS,
  SKI_LINK_AUDIENCE_LABELS,
  SkiLinkType,
} from '@/lib/types/ski-links';
import { getDisplayDomain } from '@/lib/data/ski-links';

interface SkiLinkCardProps {
  link: SkiLink;
}

const typeColors: Record<SkiLinkType, string> = {
  'resort': 'bg-blue-100 text-blue-700',
  'snow-weather': 'bg-sky-100 text-sky-700',
  'webcam-trailmap': 'bg-purple-100 text-purple-700',
  'trip-planning': 'bg-green-100 text-green-700',
  'gear-reviews': 'bg-orange-100 text-orange-700',
  'education': 'bg-yellow-100 text-yellow-700',
  'community': 'bg-pink-100 text-pink-700',
  'news': 'bg-red-100 text-red-700',
};

const typeLabelsShort: Record<SkiLinkType, string> = {
  'resort': 'Resort',
  'snow-weather': 'Snow & Weather',
  'webcam-trailmap': 'Webcams & Maps',
  'trip-planning': 'Trip Planning',
  'gear-reviews': 'Gear & Reviews',
  'education': 'Education',
  'community': 'Community',
  'news': 'News',
};

export function SkiLinkCard({ link }: SkiLinkCardProps) {
  const domain = getDisplayDomain(link.url);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${link.title} (opens in new tab)`}
      className={cn(
        'block bg-white rounded-xl border border-gray-200 p-4',
        'hover:border-ski-blue hover:shadow-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:ring-offset-2',
        link.isFeatured && 'ring-1 ring-amber-300 border-amber-200'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{link.title}</h3>
            {link.isFeatured && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                <Star className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{domain}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{link.description}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Type badge */}
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
            typeColors[link.type]
          )}
        >
          {typeLabelsShort[link.type]}
        </span>

        {/* Official badge */}
        {link.isOfficial && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
            <Check className="w-3 h-3" />
            Official
          </span>
        )}

        {/* Paid indicator */}
        {link.isPaid === true && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            <DollarSign className="w-3 h-3" />
            Paid
          </span>
        )}
        {link.isPaid === false && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            Freemium
          </span>
        )}

        {/* Region badges (show first one) */}
        {link.regions.length > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {SKI_LINK_REGION_LABELS[link.regions[0]]}
            {link.regions.length > 1 && ` +${link.regions.length - 1}`}
          </span>
        )}

        {/* Audience badges (show first one) */}
        {link.audience.length > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded">
            {SKI_LINK_AUDIENCE_LABELS[link.audience[0]]}
            {link.audience.length > 1 && ` +${link.audience.length - 1}`}
          </span>
        )}
      </div>
    </a>
  );
}
