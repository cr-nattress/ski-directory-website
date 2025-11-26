import { Link2 } from 'lucide-react';

interface SkiLinksHeroProps {
  linkCount: number;
  categoryCount: number;
}

export function SkiLinksHero({ linkCount, categoryCount }: SkiLinksHeroProps) {
  return (
    <div className="bg-gradient-to-b from-ski-blue/5 to-white border-b border-gray-100">
      <div className="container-custom py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-ski-blue/10 rounded-lg">
            <Link2 className="w-6 h-6 text-ski-blue" />
          </div>
          <nav className="text-sm text-gray-500">
            <a href="/" className="hover:text-ski-blue transition-colors">
              Home
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Ski Links</span>
          </nav>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Ski Links Directory
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mb-4">
          Stop googling every trip. Explore the best ski websites in one place — from snow reports
          and gear reviews to communities and news.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{linkCount}</span> curated links
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{categoryCount}</span> categories
          </span>
        </div>
      </div>
    </div>
  );
}
