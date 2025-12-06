import { Users } from 'lucide-react';

interface SocialLinksHeroProps {
  channelCount: number;
  platformCount: number;
}

export function SocialLinksHero({ channelCount, platformCount }: SocialLinksHeroProps) {
  return (
    <div className="bg-gradient-to-b from-ski-blue/5 to-white border-b border-gray-100">
      <div className="container-custom py-4 md:py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-ski-blue/10 rounded-lg">
            <Users className="w-6 h-6 text-ski-blue" />
          </div>
          <nav className="text-sm text-gray-500">
            <a href="/" className="hover:text-ski-blue transition-colors">
              Home
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Social Media</span>
          </nav>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Social Media
        </h1>
        <p className="hidden md:block text-gray-600 text-lg max-w-2xl mb-4">
          Find the best ski YouTube channels, Instagram feeds, TikToks, and communities in one
          place. From technique tutorials to powder stoke, we&apos;ve curated the accounts worth
          following.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{channelCount}</span> curated channels
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{platformCount}</span> platforms
          </span>
        </div>
      </div>
    </div>
  );
}
