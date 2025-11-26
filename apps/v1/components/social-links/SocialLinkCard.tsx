import { ExternalLink, Check, Users, Youtube, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SocialLink,
  SocialPlatform,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORM_BG_COLORS,
  SOCIAL_TOPIC_LABELS,
  SOCIAL_REGION_LABELS,
  SocialTopic,
} from '@/lib/mock-data/social-links-types';

interface SocialLinkCardProps {
  link: SocialLink;
}

// Platform icons
function PlatformIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  const iconClass = cn('w-4 h-4', className);

  switch (platform) {
    case 'youtube':
      return <Youtube className={iconClass} />;
    case 'instagram':
      return <Instagram className={iconClass} />;
    case 'facebook':
      return <Facebook className={iconClass} />;
    case 'twitter':
      return <Twitter className={iconClass} />;
    case 'reddit':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case 'discord':
      return <MessageCircle className={iconClass} />;
    case 'forum':
      return <Users className={iconClass} />;
    default:
      return <ExternalLink className={iconClass} />;
  }
}

// CTA text by platform
function getPlatformCTA(platform: SocialPlatform): string {
  switch (platform) {
    case 'youtube':
      return 'Watch on YouTube';
    case 'instagram':
      return 'View on Instagram';
    case 'tiktok':
      return 'View on TikTok';
    case 'facebook':
      return 'View on Facebook';
    case 'reddit':
      return 'Join on Reddit';
    case 'twitter':
      return 'View on X';
    case 'discord':
      return 'Join Discord';
    case 'forum':
      return 'Visit Forum';
    default:
      return 'Visit';
  }
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
