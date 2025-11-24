import Link from 'next/link';
import { Resort, getCardImage } from '@/lib/mock-data';
import { Star, MapPin, Snowflake } from 'lucide-react';
import { formatDistance, formatSnowfall, formatRating } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ResortCardProps {
  resort: Resort;
}

export function ResortCard({ resort }: ResortCardProps) {
  const cardImage = getCardImage(resort);
  const imageUrl = cardImage?.url || resort.heroImage;
  const imageAlt = cardImage?.alt || `${resort.name} ski resort`;

  const getPassBadgeStyles = (pass: string) => {
    switch (pass) {
      case 'epic':
        return 'bg-epic-red text-white';
      case 'ikon':
        return 'bg-ikon-orange text-white';
      case 'indy':
        return 'bg-purple-600 text-white';
      case 'local':
        return 'bg-mountain-gray text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <Link
      href={`/colorado/${resort.slug}`}
      className="card group cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
          role="img"
          aria-label={imageAlt}
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
              {pass}
            </span>
          ))}
        </div>

        {/* Status indicator */}
        {resort.conditions.status === 'open' && (
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

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-sm">
            {formatRating(resort.rating)}
          </span>
          <span className="text-gray-500 text-sm">
            ({resort.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{formatDistance(resort.distanceFromDenver)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Snowflake className="w-4 h-4" />
            <span>{formatSnowfall(resort.conditions.snowfall24h)}</span>
          </div>
        </div>

        {/* Terrain open */}
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
      </div>
    </Link>
  );
}
