import {
  Mountain,
  Cloud,
  Camera,
  Plane,
  ShoppingBag,
  GraduationCap,
  Users,
  Newspaper,
  ChevronDown,
} from 'lucide-react';
import { SkiLink, SkiLinkType, SKI_LINK_TYPE_LABELS } from '@/lib/types/ski-links';
import { SkiLinkCard } from './SkiLinkCard';

interface SkiLinksListProps {
  groupedLinks: Record<SkiLinkType, SkiLink[]>;
  showGroupHeadings?: boolean;
}

const typeIcons: Record<SkiLinkType, React.ReactNode> = {
  'resort': <Mountain className="w-5 h-5" />,
  'snow-weather': <Cloud className="w-5 h-5" />,
  'webcam-trailmap': <Camera className="w-5 h-5" />,
  'trip-planning': <Plane className="w-5 h-5" />,
  'gear-reviews': <ShoppingBag className="w-5 h-5" />,
  'education': <GraduationCap className="w-5 h-5" />,
  'community': <Users className="w-5 h-5" />,
  'news': <Newspaper className="w-5 h-5" />,
};

const typeOrder: SkiLinkType[] = [
  'resort',
  'snow-weather',
  'webcam-trailmap',
  'trip-planning',
  'gear-reviews',
  'education',
  'community',
  'news',
];

export function SkiLinksList({ groupedLinks, showGroupHeadings = true }: SkiLinksListProps) {
  // Get non-empty sections in order
  const nonEmptySections = typeOrder.filter(
    (type) => groupedLinks[type] && groupedLinks[type].length > 0
  );

  if (nonEmptySections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No links match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {nonEmptySections.map((type) => (
        <details
          key={type}
          open
          className="group border border-gray-200 rounded-lg bg-white"
        >
          {showGroupHeadings && (
            <summary className="flex items-center gap-2 p-4 cursor-pointer select-none hover:bg-gray-50 transition-colors rounded-lg">
              <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-0 -rotate-90" />
              <span className="text-ski-blue">{typeIcons[type]}</span>
              <h2
                id={`section-${type}`}
                className="font-display text-xl font-semibold text-gray-900"
              >
                {SKI_LINK_TYPE_LABELS[type]}
              </h2>
              <span className="text-sm text-gray-400">({groupedLinks[type].length})</span>
            </summary>
          )}

          <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupedLinks[type].map((link) => (
              <SkiLinkCard key={link.id} link={link} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
