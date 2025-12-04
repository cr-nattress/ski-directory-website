import { Check, ExternalLink, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SocialLink,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORM_BG_COLORS,
  SOCIAL_TOPIC_LABELS,
  SOCIAL_REGION_LABELS,
  SocialTopic,
} from '@/lib/types/social-links';
import { PlatformIcon, getPlatformCTA } from '@/components/ui/PlatformIcon';

interface SocialLinkCardProps {
  link: SocialLink;
}

// Topic short labels
const topicShortLabels: Record<SocialTopic, string> = {
  instruction: 'Instruction',
  'trip-vlog': 'Vlogs',
  gear: 'Gear',
  'resort-official': 'Official',
  news: 'News',
  meme: 'Memes',
  backcountry: 'Backcountry',
  safety: 'Safety',
  race: 'Racing',
  park: 'Park',
  family: 'Family',
  'beginner-focus': 'Beginner',
  community: 'Community',
};

export function SocialLinkCard({ link }: SocialLinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${link.name} on ${SOCIAL_PLATFORM_LABELS[link.platform]} (opens in new tab)`}
      className={cn(
        'block bg-white rounded-xl border border-gray-200 p-4',
        'hover:border-ski-blue hover:shadow-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:ring-offset-2',
        link.isFeatured && 'ring-1 ring-amber-300 border-amber-200'
      )}
    >
      {/* Header with platform and name */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              'inline-flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0',
              SOCIAL_PLATFORM_BG_COLORS[link.platform]
            )}
          >
            <PlatformIcon platform={link.platform} />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{link.name}</h3>
            <p className="text-xs text-gray-400 truncate">{link.handle}</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{link.description}</p>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {/* Platform badge */}
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
            SOCIAL_PLATFORM_BG_COLORS[link.platform]
          )}
        >
          <PlatformIcon platform={link.platform} className="w-3 h-3" />
          {SOCIAL_PLATFORM_LABELS[link.platform]}
        </span>

        {/* Official badge */}
        {link.isOfficial && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
            <Check className="w-3 h-3" />
            Official
          </span>
        )}

        {/* Community badge */}
        {link.isCommunity && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
            <Users className="w-3 h-3" />
            Community
          </span>
        )}

        {/* Metrics label */}
        {link.metricsLabel && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {link.metricsLabel}
          </span>
        )}

        {/* Primary topic badge */}
        {link.topics.length > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-sky-50 text-sky-700 text-xs rounded">
            {topicShortLabels[link.topics[0]]}
          </span>
        )}

        {/* Region badge (first one) */}
        {link.regions.length > 0 && link.regions[0] !== 'global' && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {SOCIAL_REGION_LABELS[link.regions[0]]}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="text-sm font-medium text-ski-blue flex items-center gap-1">
        {getPlatformCTA(link.platform)}
        <span aria-hidden="true">→</span>
      </div>
    </a>
  );
}
