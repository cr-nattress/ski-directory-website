import {
  GraduationCap,
  Video,
  ShoppingBag,
  Mountain,
  Compass,
  Shield,
  Newspaper,
  Laugh,
  Zap,
  Flag,
  Heart,
  BookOpen,
  Users,
} from 'lucide-react';
import { SocialLink, SocialTopic, SOCIAL_TOPIC_LABELS } from '@/lib/mock-data/social-links-types';
import { SocialLinkCard } from './SocialLinkCard';

interface SocialLinksListProps {
  groupedLinks: Record<SocialTopic, SocialLink[]>;
  showGroupHeadings?: boolean;
}

const topicIcons: Record<SocialTopic, React.ReactNode> = {
  instruction: <GraduationCap className="w-5 h-5" />,
  'trip-vlog': <Video className="w-5 h-5" />,
  gear: <ShoppingBag className="w-5 h-5" />,
  'resort-official': <Mountain className="w-5 h-5" />,
  backcountry: <Compass className="w-5 h-5" />,
  safety: <Shield className="w-5 h-5" />,
  news: <Newspaper className="w-5 h-5" />,
  meme: <Laugh className="w-5 h-5" />,
  park: <Zap className="w-5 h-5" />,
  race: <Flag className="w-5 h-5" />,
  family: <Heart className="w-5 h-5" />,
  'beginner-focus': <BookOpen className="w-5 h-5" />,
  community: <Users className="w-5 h-5" />,
};

const topicOrder: SocialTopic[] = [
  'instruction',
  'trip-vlog',
  'gear',
  'resort-official',
  'backcountry',
  'safety',
  'news',
  'meme',
  'park',
  'race',
  'family',
  'beginner-focus',
  'community',
];

export function SocialLinksList({ groupedLinks, showGroupHeadings = true }: SocialLinksListProps) {
  // Get non-empty sections in order
  const nonEmptySections = topicOrder.filter(
    (topic) => groupedLinks[topic] && groupedLinks[topic].length > 0
  );

  if (nonEmptySections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No channels match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {nonEmptySections.map((topic) => (
        <section key={topic} aria-labelledby={`section-${topic}`}>
          {showGroupHeadings && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-ski-blue">{topicIcons[topic]}</span>
              <h2
                id={`section-${topic}`}
                className="font-display text-xl font-semibold text-gray-900"
              >
                {SOCIAL_TOPIC_LABELS[topic]}
              </h2>
              <span className="text-sm text-gray-400">({groupedLinks[topic].length})</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupedLinks[topic].map((link) => (
              <SocialLinkCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
