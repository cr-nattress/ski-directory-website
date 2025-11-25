import { Mountain } from 'lucide-react';

interface DirectoryHeroProps {
  resortCount: number;
}

export function DirectoryHero({ resortCount }: DirectoryHeroProps) {
  return (
    <div className="bg-gradient-to-b from-ski-blue/5 to-white border-b border-gray-100">
      <div className="container-custom py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-ski-blue/10 rounded-lg">
            <Mountain className="w-6 h-6 text-ski-blue" />
          </div>
          <nav className="text-sm text-gray-500">
            <a href="/" className="hover:text-ski-blue transition-colors">
              Home
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Directory</span>
          </nav>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          A-Z Resort Directory
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Compare all {resortCount} Colorado ski resorts at a glance. Sort by snow conditions,
          terrain, size, or distance to find your perfect mountain.
        </p>
      </div>
    </div>
  );
}
